const express = require("express");
const router = express.Router();
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

router.get("/bookhistory", authenticate, async (req, res) => {
  try {
    // If user reaches here, they are authorized to access the route
    if (req.user.role === "receptionist") {
      const partial = "partials/recepHeader.ejs";
      const bookings = await Booking.find();
      res.render("bookhistory", { bookings, partial });
    } else if (req.user.role === "ICT") {
      if (req.user.staffclass === "user") {
        const partial = "partials/header.ejs";
        const bookings = await ICTBooking.find();
        res.render("ICTbookhistory", { bookings, partial });
      } else if (req.user.staffclass === "admin") {
        const partial = "partials/ictAdminheader.ejs";
        const bookings = await ICTBooking.find();
        res.render("ICTbookhistory", { bookings, partial });
      }
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});

module.exports = router;
