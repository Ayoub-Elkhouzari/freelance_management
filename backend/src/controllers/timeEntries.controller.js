const svc = require("../services/timeEntries.service");

async function listByProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.projectId);
    const result = await svc.listByProject(userId, projectId, req.query);
    res.json({ status: "success", data: result });
  } catch (e) { next(e); }
}

async function createInProject(req, res, next) {
  try {
    const entry = await svc.createInProject(req.user.id, Number(req.params.projectId), req.body);
    res.status(201).json({ status: "success", data: entry });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const entry = await svc.getById(req.user.id, Number(req.params.id));
    res.json({ status: "success", data: entry });
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const entry = await svc.update(req.user.id, Number(req.params.id), req.body);
    res.json({ status: "success", data: entry });
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    await svc.remove(req.user.id, Number(req.params.id));
    res.json({ status: "success", message: "Time entry supprimée" });
  } catch (e) { next(e); }
}

module.exports = { listByProject, createInProject, getById, update, remove };
