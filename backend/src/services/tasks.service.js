const db = require("../db");

function toInt(v, fallback) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function notFound(msg = "Ressource introuvable") {
  const err = new Error(msg);
  err.statusCode = 404;
  return err;
}

async function assertProjectOwnership(userId, projectId) {
  const uid = toInt(userId, 0);
  const pid = toInt(projectId, 0);

  const [rows] = await db.execute(
    `SELECT id FROM projects WHERE id = ? AND user_id = ? LIMIT 1`,
    [pid, uid]
  );

  if (!rows[0]) throw notFound("Projet introuvable");
  return { uid, pid };
}

async function listByProject(userId, projectId, filters) {
  const { uid,pid } = await assertProjectOwnership(userId, projectId);
    console.log("FILTERS =", filters);
    console.log("UID =", uid);

  const pageInt = Math.max(1, toInt(filters.page ?? 1, 1));
  const limInt = Math.min(100, Math.max(1, toInt(filters.limit ?? 20, 20)));
  const offInt = (pageInt - 1) * limInt;

  const where = ["t.project_id = ?"];
  const params = [pid];

  if (filters.q) {
    where.push("t.title LIKE ?");
    params.push(`%${filters.q}%`);
  }
  if (filters.status) {
    where.push("t.status = ?");
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push("t.priority = ?");
    params.push(filters.priority);
  }
  if (filters.due_date) {
    where.push("t.due_date = ?");
    params.push(filters.due_date);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [[countRow]] = await db.execute(
    `SELECT COUNT(*) as total FROM tasks t ${whereSql}`,
    params
  );

  const sql =
    `SELECT t.*
     FROM tasks t
     ${whereSql}
     ORDER BY t.created_at DESC
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


async function createInProject(userId, projectId, data) {
  const { pid } = await assertProjectOwnership(userId, projectId);

  const params = [
    pid,
    data.title,
    data.description ?? null,
    data.status ?? "todo",
    data.priority ?? "moderate",
    data.due_date ?? null,
    data.estimated_hours ?? null,
  ].map(v => (v === undefined ? null : v));

  const [result] = await db.execute(
    `INSERT INTO tasks
      (project_id, title, description, status, priority, due_date, estimated_hours)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  return getById(userId, result.insertId);
}

async function getById(userId, taskId) {
  const uid = toInt(userId, 0);
  const tid = toInt(taskId, 0);

  // ownership through join
  const [rows] = await db.execute(
    `SELECT t.*
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = ? AND p.user_id = ?
     LIMIT 1`,
    [tid, uid]
  );

  if (!rows[0]) throw notFound("Tâche introuvable");
  return rows[0];
}

async function update(userId, taskId, data) {
  // ensure exists + ownership
  await getById(userId, taskId);

  const allowed = [
    "title",
    "description",
    "status",
    "priority",
    "due_date",
    "estimated_hours",
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
    `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
    [...params.map(v => (v === undefined ? null : v)), toInt(taskId, 0)]
  );

  return getById(userId, taskId);
}

async function remove(userId, taskId) {
  // ensure exists + ownership
  await getById(userId, taskId);

  await db.execute(`DELETE FROM tasks WHERE id = ?`, [toInt(taskId, 0)]);
}

module.exports = { listByProject, createInProject, getById, update, remove };
