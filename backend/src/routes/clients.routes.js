const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth"); // your JWT middleware
const validate = require("../middlewares/validator");
const clientsController = require("../controllers/clients.controller");
const {
  createClientSchema,
  updateClientSchema,
  listClientsSchema,
  idParamSchema,
} = require("../validator/clients.validator");

// List with pagination + search + type filter
router.get("/", auth, validate(listClientsSchema, "query"), clientsController.list);

// Get by id
router.get("/:id", auth, validate(idParamSchema, "params"), clientsController.getById);

// Create
router.post("/", auth, validate(createClientSchema), clientsController.create);

// Update
router.put("/:id", auth, validate(idParamSchema, "params"), validate(updateClientSchema), clientsController.update);

// Soft delete
router.delete("/:id", auth, validate(idParamSchema, "params"), clientsController.remove);

module.exports = router;
