const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const c = require("../controllers/timeEntries.controller");
const v = require("../validator/timeEntries.validator");

router.get(
  "/projects/:projectId/time-entries",
  auth,
  validate(v.projectIdParamSchema, "params"),
  validate(v.listTimeEntriesSchema, "query"),
  c.listByProject
);

router.post(
  "/projects/:projectId/time-entries",
  auth,
  validate(v.projectIdParamSchema, "params"),
  validate(v.createTimeEntrySchema),
  c.createInProject
);

router.get("/time-entries/:id", auth, validate(v.idParamSchema, "params"), c.getById);
router.put(
  "/time-entries/:id",
  auth,
  validate(v.idParamSchema, "params"),
  validate(v.updateTimeEntrySchema),
  c.update
);
router.delete("/time-entries/:id", auth, validate(v.idParamSchema, "params"), c.remove);

module.exports = router;
