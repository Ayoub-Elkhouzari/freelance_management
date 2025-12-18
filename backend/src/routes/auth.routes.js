const express = require('express');
const router = express.Router();
const auth = require("../middlewares/auth"); // your JWT middleware

const authController = require('../controllers/auth.controller');
const {registerSchema, loginSchema }=require('../validator/auth.validator');
const validate=require('../middlewares/validator')
console.log("✅ auth.routes.js loaded");
router.post('/register',validate(registerSchema), authController.register);
router.post('/login',validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", auth, (req, res) => {
  res.json({
    status: "success",
    data: req.user,
  });
});
module.exports = router;
