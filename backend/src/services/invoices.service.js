const db = require("../db");

const toInt = (v, f = 0) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : f);
function notFound(msg="Ressource introuvable") { const e=new Error(msg); e.statusCode=404; return e; }

async function assertInvoiceOwnership(userId, invoiceId) {
  const uid = toInt(userId);
  const iid = toInt(invoiceId);

  const [rows] = await db.execute(`SELECT * FROM invoices WHERE id=? AND user_id=? LIMIT 1`, [iid, uid]);
  if (!rows[0]) throw notFound("Facture introuvable");
  return rows[0];
}

async function list(userId, filters) {
  const uid = toInt(userId);

  const page = Math.max(1, toInt(filters.page, 1));
  const limit = Math.min(100, Math.max(1, toInt(filters.limit, 20)));
  const offset = (page - 1) * limit;

  const where = ["user_id = ?"];
  const params = [uid];

  if (filters.status) { where.push("status = ?"); params.push(filters.status); }
  if (filters.client_id) { where.push("client_id = ?"); params.push(toInt(filters.client_id)); }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [[countRow]] = await db.execute(`SELECT COUNT(*) AS total FROM invoices ${whereSql}`, params);

  const sql = `
    SELECT *
    FROM invoices
    ${whereSql}
    ORDER BY issue_date DESC, id DESC
    LIMIT ${offset}, ${limit}
  `;
  const [rows] = await db.execute(sql, params);

  return { items: rows, pagination: { page, limit, total: countRow.total, pages: Math.ceil(countRow.total / limit) } };
}

async function create(userId, data) {
  const uid = toInt(userId);

  // client ownership
  const [crows] = await db.execute(`SELECT id FROM clients WHERE id=? AND user_id=? LIMIT 1`, [toInt(data.client_id), uid]);
  if (!crows[0]) throw notFound("Client introuvable");

  const params = [
    uid,
    toInt(data.client_id),
    data.number,
    data.issue_date,
    data.due_date,
    data.status ?? "draft",
    data.currency ?? "EUR",
    data.total_ht,
    data.total_tva ?? 0,
    data.total_ttc,
  ];

  const [r] = await db.execute(
    `INSERT INTO invoices
      (user_id, client_id, number, issue_date, due_date, status, currency, total_ht, total_tva, total_ttc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params
  );

  return getById(userId, r.insertId);
}

async function getById(userId, invoiceId) {
  return await assertInvoiceOwnership(userId, invoiceId);
}

async function update(userId, invoiceId, data) {
  const inv = await assertInvoiceOwnership(userId, invoiceId);
  if (inv.status !== "draft") {
    const e = new Error("Impossible de modifier une facture non brouillon");
    e.statusCode = 400;
    throw e;
  }

  const allowed = ["client_id","number","issue_date","due_date","status","currency","total_ht","total_tva","total_ttc"];
  const fields = [];
  const params = [];

  for (const k of allowed) {
    if (data[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(data[k]);
    }
  }

  if (!fields.length) { const e=new Error("Aucun champ à mettre à jour"); e.statusCode=400; throw e; }

  await db.execute(
    `UPDATE invoices SET ${fields.join(", ")} WHERE id=? AND user_id=?`,
    [...params, toInt(invoiceId), toInt(userId)]
  );

  return getById(userId, invoiceId);
}

async function remove(userId, invoiceId) {
  const inv = await assertInvoiceOwnership(userId, invoiceId);
  if (inv.status !== "draft") {
    const e = new Error("Impossible de supprimer une facture non brouillon");
    e.statusCode = 400;
    throw e;
  }
  await db.execute(`DELETE FROM invoices WHERE id=? AND user_id=?`, [toInt(invoiceId), toInt(userId)]);
}

module.exports = { list, create, getById, update, remove };
