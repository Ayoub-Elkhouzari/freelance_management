const svc = require("../services/invoices.service");

async function list(req, res, next) {
  try {
    const data = await svc.list(req.user.id, req.query);
    res.json({ status: "success", data });
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const inv = await svc.create(req.user.id, req.body);
    res.status(201).json({ status: "success", data: inv });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const inv = await svc.getById(req.user.id, Number(req.params.id));
    res.json({ status: "success", data: inv });
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const inv = await svc.update(req.user.id, Number(req.params.id), req.body);
    res.json({ status: "success", data: inv });
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    await svc.remove(req.user.id, Number(req.params.id));
    res.json({ status: "success", message: "Facture supprimée" });
  } catch (e) { next(e); }
}

module.exports = { list, create, getById, update, remove };
