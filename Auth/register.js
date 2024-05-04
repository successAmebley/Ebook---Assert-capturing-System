const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const flash = require("connect-flash");

const router = express.Router();

// Initialize connect-flash middleware
router.use(flash());

// Render registration form
router.get("/register", (req, res) => {
  res.render("register", {
   
    // successMessage: req.flash("successMessage"),
    errorMessage: req.flash("info"), // Ensure to pass errorMessage
  });
});

// Handle user registration
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      fName,
      lName,
      contact,
      password,
      department,
      staffclass,
      role,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username: email });
    if (existingUser) {
      req.flash("info", "User already registered");
      return res.redirect("/register");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await User.create({
      username: email,
      fName,
      lName,
      contact,
      email,
      password: hashedPassword,
      department,
      staffclass,
      role,
    });

    // Registration successful
    req.flash("info", "Registration successful"); // Add successMessage
    res.redirect("/"); // Redirect to login page
  } catch (error) {
    console.error(error);
    req.flash("message", "An error occurred during registration");
    res.redirect("/register");
  }
});

module.exports = router;
