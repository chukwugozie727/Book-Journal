const passport = require('passport');
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const {ensureAuth} = require("../middleware/auth");

// Routes
router.get("/signup", authController.getAuthSignup);
router.get("/login", authController.getAuthLogin);   
router.post("/signup", authController.authSignup);  
router.post("/login",   authController.AuthLogin)
router.get(
  "/auth/google", 
  passport.authenticate("google", {
  scope: ["profile", "email"], 
  prompt:"select_account"
  })
);

router.get(
  "/auth/google/profile",
  passport.authenticate("google", {
      successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);
router.get("/dashboard", ensureAuth, authController.dashboard);
router.get("/logout", ensureAuth, authController.logout)
// router.post("/login", bookController.AuthLogin);

module.exports = router;
