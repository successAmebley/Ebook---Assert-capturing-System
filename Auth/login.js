const express = require("express");
const passport = require("passport");
const router = express.Router();

// Render login form
router.get("/", (req, res) => {
  res.render("login", {
    successMessage: req.flash("info"),
    errorMessage: req.flash("info"), // Ensure to pass errorMessage
  });
});

// Handle login request
router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("info", info.errorMessage); // Change "info" to "errorMessage"
      return res.redirect("/");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // If authentication is successful, this callback will be called.
      switch (req.user.role) {
        case "receptionist":
        case "ICT":
        case "HR":
          res.redirect("/userdashboard");
          break;
        case "Admin":
          res.redirect("/adminDashboard");
          break;
        default:
          res.redirect("/");
      }
    });
  })(req, res, next);
});

module.exports = router;
