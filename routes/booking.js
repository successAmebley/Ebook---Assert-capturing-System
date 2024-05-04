const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/booking");
const ICTBooking = require("../models/ICTBooking");

// Middleware to check authentication and role
function authenticate(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Middleware to check if user is a receptionist
function isReceptionist(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "receptionist") {
    return next();
  }
  res.redirect("/");
}

// Middleware to check if user is an ICT staff
function isICTStaff(req, res, next) {
  if (
    req.isAuthenticated() &&
    req.user.role === "ICT" &&
    req.user.staffclass === "user"
  ) {
    return next();
  }
  res.redirect("/");
}

// Middleware to check if user is an ICT admin
function isICTAdmin(req, res, next) {
  if (
    req.isAuthenticated() &&
    req.user.role === "ICT" &&
    req.user.staffclass === "admin"
  ) {
    return next();
  }
  res.redirect("/");
}

// GET /booking route
router.get("/booking", authenticate, async (req, res) => {
  try {
    if (req.user.role === "receptionist") {
      const partial = "partials/recepHeader.ejs";
      res.render("booking", { partial });
    } else if (req.user.role === "ICT") {
      let partial = "partials/header.ejs";
      const users = await User.find({ role: "ICT" });

      if (req.user.staffclass === "admin") {
        partial = "partials/ictAdminheader.ejs";
      }

      res.render("ICTbooking", { users, partial });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
});

// POST /booking route

router.post("/booking", authenticate, async (req, res) => {
  try {
    if (req.user.role === "receptionist") {
      const username = req.user.fName;
      const { name, contact, department, purpose, additionalInfo } = req.body;
      const now = new Date();
      const timeIn = now.toLocaleTimeString();
      const year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = now.getDate();
      month = month < 10 ? "0" + month : month;
      day = day < 10 ? "0" + day : day;
      const bookingDate = `${year}-${month}-${day}`;
      // Create booking for receptionist
      await Booking.create({
        username,
        name,
        contact,
        department,
        purpose,
        additionalInfo,
        timeIn,
        bookingDate,
        status: "Pending",
      });
    } else if (req.user.role === "ICT") {
      const username = req.user.fName;
      const { staffname, location, department, detail, problem, assignedTo } =
        req.body;
      const now = new Date();
      const timeIn = now.toLocaleTimeString();
      const year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = now.getDate();
      month = month < 10 ? "0" + month : month;
      day = day < 10 ? "0" + day : day;
      const bookingDate = `${year}-${month}-${day}`;
      // Create booking for ICT staff
      await ICTBooking.create({
        username,
        staffname,
        location,
        department,
        detail,
        problem,
        assignedTo,
        timeIn,
        bookingDate,
        status: "Pending",
      });
    }
    req.flash("successMessage", "Booking saved successfully");
    res.redirect("/booking");
  } catch (error) {
    console.error("Error saving booking:", error);
    req.flash("info", "Error saving booking");
    res.redirect("/userdashboard");
  }
});

module.exports = router;
