const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const config = require("../config/config");
const db = require("../db"); // mysql2 pool (promise)

// ----------------------------
// Helpers
// ----------------------------
function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function hashToken(token) {
  // store only hash in DB, never the raw refresh token
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseDays(exp) {
  // supports "7d" format; fallback 7 days
  const m = /^(\d+)d$/i.exec(exp || "");
  return m ? Number(m[1]) : 7;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function signAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    config.jwt.accessSecret || config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn || config.jwt.expiresIn || "15m" }
  );
}

function signRefreshToken(userId, tokenId) {
  return jwt.sign(
    { sub: userId, tid: tokenId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn || "7d" }
  );
}

async function issueTokens(userId) {
  if (!config.jwt.refreshSecret) {
    throw httpError(
      "JWT refresh secret manquant. Ajoute config.jwt.refreshSecret",
      500
    );
  }

  const refreshExp = config.jwt.refreshExpiresIn || "7d";
  const expiresAt = addDays(new Date(), parseDays(refreshExp));

  // 1) Create DB row first (so we get token id)
  const [r] = await db.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, "PENDING", expiresAt]
  );

  const tokenId = r.insertId;

  // 2) Sign refresh token with token id inside (tid)
  const refreshToken = signRefreshToken(userId, tokenId);

  // 3) Store hash
  const refreshHash = hashToken(refreshToken);
  await db.execute(
    `UPDATE refresh_tokens SET token_hash = ? WHERE id = ?`,
    [refreshHash, tokenId]
  );

  // 4) Sign access token
  const accessToken = signAccessToken(userId);

  return { accessToken, refreshToken };
}

// rotation: revoke old, create new
async function rotateRefreshToken(refreshToken) {
  if (!refreshToken) throw httpError("Refresh token manquant", 400);

  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw httpError("Refresh token invalide ou expiré", 401);
  }

  const userId = Number(payload.sub);
  const tokenId = Number(payload.tid);
  const incomingHash = hashToken(refreshToken);

  const [rows] = await db.execute(
    `SELECT id, user_id, token_hash, expires_at, revoked_at
     FROM refresh_tokens
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [tokenId, userId]
  );

  const row = rows[0];
  if (!row) throw httpError("Refresh token introuvable", 401);
  if (row.revoked_at) throw httpError("Refresh token révoqué", 401);
  if (new Date(row.expires_at) < new Date()) throw httpError("Refresh token expiré", 401);
  if (row.token_hash !== incomingHash) throw httpError("Refresh token mismatch", 401);

  // revoke old token (rotation)
  await db.execute(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?`, [
    tokenId,
  ]);

  // issue new pair
  return issueTokens(userId);
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;

  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    await db.execute(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?`, [
      payload.tid,
    ]);
  } catch {
    // already invalid/expired, nothing to do
  }
}

// ----------------------------
// Public API (register/login/refresh/logout)
// ----------------------------
async function register(payload) {
  const {
    email,
    password,
    first_name,
    last_name,
    currency,
    company_name,
    address,
    tax_id,
    logo_url,
  } = payload;

  // 1) email already used?
  const [existing] = await db.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (existing.length > 0) {
    throw httpError("Un compte avec cet email existe déjà", 409);
  }

  // 2) hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 3) insert user
  const [result] = await db.execute(
    `INSERT INTO users
      (email, password_hash, first_name, last_name, currency, company_name, address, tax_id, logo_url)
     VALUES
      (?, ?, ?, ?, COALESCE(?, 'EUR'), ?, ?, ?, ?)`,
    [
      email,
      passwordHash,
      first_name,
      last_name,
      currency || null,
      company_name || null,
      address || null,
      tax_id || null,
      logo_url || null,
    ]
  );

  const userId = result.insertId;

  // 4) issue access + refresh
  const tokens = await issueTokens(userId);

  // 5) return safe user + tokens
  const user = {
    id: userId,
    email,
    first_name,
    last_name,
    currency: currency || "EUR",
    company_name: company_name || null,
    address: address || null,
    tax_id: tax_id || null,
    logo_url: logo_url || null,
  };

  return { user, ...tokens };
}

async function login({ email, password }) {
  // 1) find user
  const [rows] = await db.execute(
    `SELECT id, email, password_hash, first_name, last_name, currency, company_name, address, tax_id, logo_url
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  const user = rows?.[0];
  if (!user) throw httpError("Identifiants invalides", 401);

  // 2) verify password
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw httpError("Identifiants invalides", 401);

  // 3) issue tokens
  const tokens = await issueTokens(user.id);

  // 4) return safe user + tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      currency: user.currency,
      company_name: user.company_name,
      address: user.address,
      tax_id: user.tax_id,
      logo_url: user.logo_url,
    },
    ...tokens,
  };
}

async function refresh(refreshToken) {
  return rotateRefreshToken(refreshToken);
}

async function logout(refreshToken) {
  await revokeRefreshToken(refreshToken);
  return { ok: true };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
};
