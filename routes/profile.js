const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Middleware to authenticate the route
function authenticate(req, res, next) {
  if (req.isAuthenticated()) {
    // If user is authenticated, proceed to the next middleware or route handler
    return next();
  }
  // If user is not authenticated, redirect them to the login page or send an error response
  res.redirect("/");
}

router.get("/profile", authenticate, async (req, res) => {
  try {
    const findUser = req.user;

    let partial = "";

    if (findUser.role === "receptionist") {
      partial = "partials/recepHeader.ejs";
    } else if (findUser.role === "ICT") {
      if (findUser.staffclass === "user") {
        partial = "partials/header.ejs";
      } else if (findUser.staffclass === "admin") {
        partial = "partials/ictAdminheader.ejs";
      }
    } else if (findUser.role === "HR") {
      if (findUser.staffclass === "admin") {
        partial = "partials/hrAdminHeader.ejs";
      } else if (findUser.staffclass === "user") {
        partial = "partials/hrHeader.ejs";
      }
    }

    res.render("profile", { findUser, partial });
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

router.get("/settings", authenticate, async (req, res) => {
  try {
    const findUser = req.user;

    if (findUser.role === "ICT" && findUser.staffclass === "admin") {
      const allUsers = await User.find();
      const users = allUsers.filter(
        (user) => user.username !== req.user.username
      );

      return res.render("settings", { users });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

router.post("/updateUser", authenticate, async (req, res) => {
  try {
    const userID = req.body.id;
    const findUser = await User.findById(userID);

    const action = req.body.action;

    if (findUser) {
      switch (action) {
        case "makeAdmin":
          await findUser.updateOne({ staffclass: "admin" });
          break;
        case "makeUser":
          await findUser.updateOne({ staffclass: "user" });
          break;
        case "disableEdit":
          await findUser.updateOne({ editStatus: false });
          break;
        case "enableEdit":
          await findUser.updateOne({ editStatus: true });
          break;
        default:
          console.log("Invalid action");
          break;
      }
    }

    res.redirect("/settings");
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

module.exports = router;
