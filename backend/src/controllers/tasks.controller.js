const tasksService = require("../services/tasks.service");

async function listByProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.projectId);
    console.log("REQ.QUERY =", req.query);

    const result = await tasksService.listByProject(userId, projectId, {
      q: req.query.q,
      status: req.query.status,
      priority: req.query.priority,
      due_date: req.query.due_date, // ✅ only this
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

async function createInProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.projectId);

    const task = await tasksService.createInProject(userId, projectId, req.body);
    return res.status(201).json({ status: "success", data: task });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);

    const task = await tasksService.getById(userId, taskId);
    return res.json({ status: "success", data: task });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);

    const task = await tasksService.update(userId, taskId, req.body);
    return res.json({ status: "success", data: task });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);

    await tasksService.remove(userId, taskId);
    return res.json({ status: "success", message: "Tâche supprimée" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listByProject, createInProject, getById, update, remove };
