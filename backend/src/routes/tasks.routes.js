const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const tasksController = require("../controllers/tasks.controller");

const {
  idParamSchema,
  projectIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
} = require("../validator/tasks.validator");

// list + create inside a project
router.get(
  "/projects/:projectId/tasks",
  auth,
  validate(projectIdParamSchema, "params"),
  validate(listTasksSchema, "query"),
  tasksController.listByProject
);

router.post(
  "/projects/:projectId/tasks",
  auth,
  validate(projectIdParamSchema, "params"),
  validate(createTaskSchema),
  tasksController.createInProject
);

// single task endpoints
router.get("/tasks/:id", auth, validate(idParamSchema, "params"), tasksController.getById);

router.put(
  "/tasks/:id",
  auth,
  validate(idParamSchema, "params"),
  validate(updateTaskSchema),
  tasksController.update
);

router.delete("/tasks/:id", auth, validate(idParamSchema, "params"), tasksController.remove);

module.exports = router;
