const db = require("../db");

function notFound() {
  const err = new Error("Client introuvable");
  err.statusCode = 404;
  return err;
}

function toInt(v, fallback) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

async function list(userId, { q, type, page, limit, includeArchived }) {
  const uid = Number.parseInt(userId, 10);
  if (!Number.isFinite(uid)) {
    const err = new Error("Invalid user id");
    err.statusCode = 400;
    throw err;
  }

  const pageInt = (() => {
    const n = Number.parseInt(page ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  })();

  const limInt = (() => {
    const n = Number.parseInt(limit ?? "20", 10);
    if (!Number.isFinite(n)) return 20;
    return Math.min(100, Math.max(1, n));
  })();

  const offInt = (pageInt - 1) * limInt;

  const include =
    includeArchived === true ||
    includeArchived === 1 ||
    includeArchived === "1";

  const where = ["user_id = ?"];
  const params = [uid];

  if (!include) where.push("is_archived = 0");
  if (q) {
    where.push("name LIKE ?");
    params.push(`%${q}%`);
  }
  if (type) {
    where.push("type = ?");
    params.push(type);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [[countRow]] = await db.execute(
    `SELECT COUNT(*) as total FROM clients ${whereSql}`,
    params
  );

  // ✅ Inline LIMIT/OFFSET (safe because offInt/limInt are forced ints)
  const sql =
    `SELECT id, user_id, name, type, contact_name, contact_email, contact_phone,
            billing_address, notes, is_archived, created_at, updated_at
     FROM clients
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ${offInt}, ${limInt}`;

  const [rows] = await db.execute(sql, params);

  return {
    items: rows,
    pagination: {
      page: pageInt,
      limit: limInt,
      total: countRow.total,
      pages: Math.ceil(countRow.total / limInt),
    },
  };
}



async function getById(userId, clientId) {
  const [rows] = await db.execute(
    `SELECT id, user_id, name, type, contact_name, contact_email, contact_phone,
            billing_address, notes, is_archived, created_at, updated_at
     FROM clients
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [clientId, userId]
  );

  if (!rows[0]) throw notFound();
  return rows[0];
}

async function create(userId, data) {
  const {
    name,
    type,
    contact_name,
    contact_email,
    contact_phone,
    billing_address,
    notes,
  } = data;

  const [result] = await db.execute(
    `INSERT INTO clients
      (user_id, name, type, contact_name, contact_email, contact_phone, billing_address, notes, is_archived)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      userId,
      name,
      type ?? null,
      contact_name ?? null,
      contact_email ?? null,
      contact_phone ?? null,
      billing_address ?? null,
      notes ?? null,
    ]
  );

  return getById(userId, result.insertId);
}

async function update(userId, clientId, data) {
  // Ensure ownership
  await getById(userId, clientId);

  const fields = [];
  const params = [];

  const allowed = [
    "name",
    "type",
    "contact_name",
    "contact_email",
    "contact_phone",
    "billing_address",
    "notes",
    "is_archived",
  ];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) {
    const err = new Error("Aucun champ à mettre à jour");
    err.statusCode = 400;
    throw err;
  }

  params.push(clientId, userId);

  await db.execute(
    `UPDATE clients SET ${fields.join(", ")}
     WHERE id = ? AND user_id = ?`,
    params
  );

  return getById(userId, clientId);
}

async function softDelete(userId, clientId) {
  // Ensure ownership
  await getById(userId, clientId);

  await db.execute(
    `UPDATE clients SET is_archived = 1 WHERE id = ? AND user_id = ?`,
    [clientId, userId]
  );
}

module.exports = { list, getById, create, update, softDelete };
