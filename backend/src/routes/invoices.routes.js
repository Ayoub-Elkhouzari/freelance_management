const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const c = require("../controllers/invoices.controller");
const v = require("../validator/invoices.validator");

router.get("/invoices", auth, validate(v.listInvoicesSchema, "query"), c.list);
router.post("/invoices", auth, validate(v.createInvoiceSchema), c.create);

router.get("/invoices/:id", auth, validate(v.idParamSchema, "params"), c.getById);
router.put("/invoices/:id", auth, validate(v.idParamSchema, "params"), validate(v.updateInvoiceSchema), c.update);
router.delete("/invoices/:id", auth, validate(v.idParamSchema, "params"), c.remove);

module.exports = router;
