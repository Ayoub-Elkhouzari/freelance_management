const db = require("../db");

const toInt = (v, f = 0) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : f);
const boolish = (v) => v === true || v === 1 || v === "1" || v === "true";

function notFound(msg = "Ressource introuvable") { const e = new Error(msg); e.statusCode = 404; return e; }

async function assertProjectOwnership(userId, projectId) {
  const uid = toInt(userId);
  const pid = toInt(projectId);

  const [rows] = await db.execute(
    `SELECT id FROM projects WHERE id = ? AND user_id = ? LIMIT 1`,
    [pid, uid]
  );
  if (!rows[0]) throw notFound("Projet introuvable");
  return { uid, pid };
}

async function getById(userId, entryId) {
  const uid = toInt(userId);
  const eid = toInt(entryId);

  const [rows] = await db.execute(
    `SELECT te.*
     FROM time_entries te
     WHERE te.id = ? AND te.user_id = ?
     LIMIT 1`,
    [eid, uid]
  );
  if (!rows[0]) throw notFound("Time entry introuvable");
  return rows[0];
}

async function listByProject(userId, projectId, filters) {
  const { uid, pid } = await assertProjectOwnership(userId, projectId);

  const page = Math.max(1, toInt(filters.page, 1));
  const limit = Math.min(100, Math.max(1, toInt(filters.limit, 20)));
  const offset = (page - 1) * limit;

  const where = ["te.user_id = ?", "te.project_id = ?"];
  const params = [uid, pid];

  if (filters.from) { where.push("te.date >= ?"); params.push(filters.from); }
  if (filters.to) { where.push("te.date <= ?"); params.push(filters.to); }
  if (filters.task_id) { where.push("te.task_id = ?"); params.push(toInt(filters.task_id)); }
  if (filters.billed !== undefined) { where.push("te.is_billed = ?"); params.push(boolish(filters.billed) ? 1 : 0); }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [[countRow]] = await db.execute(
    `SELECT COUNT(*) AS total FROM time_entries te ${whereSql}`,
    params
  );

  const sql = `
    SELECT te.*
    FROM time_entries te
    ${whereSql}
    ORDER BY te.date DESC, te.id DESC
    LIMIT ${offset}, ${limit}
  `;
  const [rows] = await db.execute(sql, params);

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total: countRow.total,
      pages: Math.ceil(countRow.total / limit),
    },
  };
}

async function createInProject(userId, projectId, data) {
  const { uid, pid } = await assertProjectOwnership(userId, projectId);

  const params = [
    uid,
    pid,
    data.task_id ?? null,
    data.date,
    data.start_time ?? null,
    data.end_time ?? null,
    toInt(data.duration_minutes),
    data.description ?? null,
  ];

  const [r] = await db.execute(
    `INSERT INTO time_entries
      (user_id, project_id, task_id, date, start_time, end_time, duration_minutes, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  return getById(userId, r.insertId);
}

async function update(userId, entryId, data) {
  await getById(userId, entryId);

  const allowed = ["project_id", "task_id", "date", "start_time", "end_time", "duration_minutes", "description"];
  const fields = [];
  const params = [];

  for (const k of allowed) {
    if (data[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(data[k] === undefined ? null : data[k]);
    }
  }

  if (!fields.length) {
    const e = new Error("Aucun champ à mettre à jour");
    e.statusCode = 400;
    throw e;
  }

  await db.execute(
    `UPDATE time_entries SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    [...params, toInt(entryId), toInt(userId)]
  );

  return getById(userId, entryId);
}

async function remove(userId, entryId) {
  await getById(userId, entryId);
  await db.execute(`DELETE FROM time_entries WHERE id = ? AND user_id = ?`, [toInt(entryId), toInt(userId)]);
}

module.exports = { listByProject, createInProject, getById, update, remove };
