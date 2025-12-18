const jwt = require("jsonwebtoken");
const config = require("../config/config");
const db = require("../db"); // your mysql2 pool/connection export
const JWT_SECRET = config.jwt.secret;

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Token manquant ou mal formé",
      });
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: "error",
        message: "Token invalide ou expiré",
      });
    }

    // payload.sub contains the user id
    const userId = payload.sub;

    // Fetch user from MySQL (exclude password hash)
    const [rows] = await db.execute(
      "SELECT id, email FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const user = rows?.[0];
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Utilisateur associé au token introuvable",
      });
    }

    // Attach user to request
    req.user = { id: user.id, email: user.email };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;
