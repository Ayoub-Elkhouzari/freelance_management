const clientsService = require("../services/clients.service");

async function list(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await clientsService.list(userId, {
      q: req.query.q,
      type: req.query.type,
      page: req.query.page,
      limit: req.query.limit,
      includeArchived: req.query.includeArchived,
    });

    return res.json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user.id;
    const clientId = Number(req.params.id);

    const client = await clientsService.getById(userId, clientId);

    return res.json({ status: "success", data: client });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.id;
    const client = await clientsService.create(userId, req.body);

    return res.status(201).json({ status: "success", data: client });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.id;
    const clientId = Number(req.params.id);

    const client = await clientsService.update(userId, clientId, req.body);

    return res.json({ status: "success", data: client });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.id;
    const clientId = Number(req.params.id);

    await clientsService.softDelete(userId, clientId);

    return res.json({ status: "success", message: "Client archivé" });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
