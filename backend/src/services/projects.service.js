const db = require("../db");

function toInt(v, fallback) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function notFound() {
  const err = new Error("Projet introuvable");
  err.statusCode = 404;
  return err;
}

async function assertClientOwnership(userId, clientId) {
  if (clientId === null || clientId === undefined) return;

  const [rows] = await db.execute(
    "SELECT id FROM clients WHERE id = ? AND user_id = ? LIMIT 1",
    [clientId, userId]
  );

  if (!rows[0]) {
    const err = new Error("Client invalide ou non autorisé");
    err.statusCode = 400;
    throw err;
  }
}

async function list(userId, { q, status, client_id, page, limit }) {
  const uid = toInt(userId, 0);
  const pageInt = Math.max(1, toInt(page ?? 1, 1));
  const limInt = Math.min(100, Math.max(1, toInt(limit ?? 20, 20)));
  const offInt = (pageInt - 1) * limInt;

  const where = ["user_id = ?"];
  const params = [uid];

  if (q) {
    where.push("name LIKE ?");
    params.push(`%${q}%`);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (client_id) {
    where.push("client_id = ?");
    params.push(toInt(client_id, 0));
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [[countRow]] = await db.execute(
    `SELECT COUNT(*) as total FROM projects ${whereSql}`,
    params
  );

  const sql =
    `SELECT id, user_id, client_id, name, description, status,
            start_date, end_date_estimated, hourly_rate, fixed_amount,
            created_at, updated_at
     FROM projects
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

async function getById(userId, projectId) {
  const uid = toInt(userId, 0);
  const pid = toInt(projectId, 0);

  const [rows] = await db.execute(
    `SELECT id, user_id, client_id, name, description, status,
            start_date, end_date_estimated, hourly_rate, fixed_amount,
            created_at, updated_at
     FROM projects
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [pid, uid]
  );

  if (!rows[0]) throw notFound();
  return rows[0];
}

async function create(userId, data) {
  const uid = toInt(userId, 0);

  const {
    client_id,
    name,
    description,
    status,
    start_date,
    end_date_estimated,
    hourly_rate,
    fixed_amount,
  } = data;

  await assertClientOwnership(uid, client_id);

  const params = [
    uid,
    client_id ?? null,
    name,
    description ?? null,
    status ?? "active",
    start_date ?? null,
    end_date_estimated ?? null,
    hourly_rate ?? null,
    fixed_amount ?? null,
  ].map(v => (v === undefined ? null : v));

  const [result] = await db.execute(
    `INSERT INTO projects
      (user_id, client_id, name, description, status, start_date, end_date_estimated, hourly_rate, fixed_amount)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  return getById(uid, result.insertId);
}

async function update(userId, projectId, data) {
  const uid = toInt(userId, 0);
  const pid = toInt(projectId, 0);

  await getById(uid, pid);

  if (data.client_id !== undefined) {
    await assertClientOwnership(uid, data.client_id);
  }

  const allowed = [
    "client_id",
    "name",
    "description",
    "status",
    "start_date",
    "end_date_estimated",
    "hourly_rate",
    "fixed_amount",
  ];

  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key] === undefined ? null : data[key]);
    }
  }

  if (fields.length === 0) {
    const err = new Error("Aucun champ à mettre à jour");
    err.statusCode = 400;
    throw err;
  }

  await db.execute(
    `UPDATE projects SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    [...params.map(v => (v === undefined ? null : v)), pid, uid]
  );

  return getById(uid, pid);
}

async function remove(userId, projectId) {
  const uid = toInt(userId, 0);
  const pid = toInt(projectId, 0);

  // ensure exists + ownership
  await getById(uid, pid);

  await db.execute(
    `DELETE FROM projects WHERE id = ? AND user_id = ?`,
    [pid, uid]
  );
}

module.exports = { list, getById, create, update, remove };
