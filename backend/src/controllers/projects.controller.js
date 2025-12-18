const projectsService = require("../services/projects.service");

async function list(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await projectsService.list(userId, {
      q: req.query.q,
      status: req.query.status,
      client_id: req.query.client_id,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);

    const project = await projectsService.getById(userId, projectId);
    return res.json({ status: "success", data: project });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.id;
    const project = await projectsService.create(userId, req.body);

    return res.status(201).json({ status: "success", data: project });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);

    const project = await projectsService.update(userId, projectId, req.body);
    return res.json({ status: "success", data: project });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.id);

    await projectsService.remove(userId, projectId); // hard delete
    return res.json({ status: "success", message: "Projet supprimé" });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
