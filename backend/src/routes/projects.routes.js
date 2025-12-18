const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const projectsController = require("../controllers/projects.controller");
const {
  idParamSchema,
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
} = require("../validator/projects.validator");

router.get("/", auth, validate(listProjectsSchema, "query"), projectsController.list);
router.get("/:id", auth, validate(idParamSchema, "params"), projectsController.getById);
router.post("/", auth, validate(createProjectSchema), projectsController.create);
router.put(
  "/:id",
  auth,
  validate(idParamSchema, "params"),
  validate(updateProjectSchema),
  projectsController.update
);
router.delete("/:id", auth, validate(idParamSchema, "params"), projectsController.remove);

module.exports = router;
