// Import necessary modules
const express = require("express");
const User = require("../models/User");
const Booking = require("../models/booking");
const ICTbooking = require("../models/ICTBooking");
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

// Route to access the calendar
router.get("/calendar", authenticate, async (req, res) => {
  try {
    if (req.user.role === "receptionist") {
      const partial = "partials/recepHeader.ejs";
      const bookings = await Booking.find();
      res.render("calendar", { bookings, partial });
    } else if (req.user.role === "ICT") {
      if (req.user.staffclass === "user") {
        const partial = "partials/header.ejs";
        const bookings = await ICTbooking.find();
        res.render("ICTcalendar", { bookings, partial });
      } else if (req.user.staffclass === "admin") {
        const partial = "partials/ictAdminheader.ejs";
        const bookings = await ICTbooking.find();
        res.render("ICTcalendar", { bookings, partial });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('500')
  }
});

// Route to update appointment
router.post("/updateAppointment", authenticate, async (req, res) => {
  try {
    if (req.user.role === "receptionist") {
      const { appointmentId } = req.body;
      const booking = await Booking.findById(appointmentId);

      if (booking) {
        const now = new Date();
        booking.timeOut = now.toLocaleTimeString();
        booking.status = "Signed Out";
        await booking.save();
        res
          .status(200)
          .json({ message: "Appointment signed out successfully" });
      } else {
        res.status(404).json({ message: "Booking not found" });
      }
    } else if (req.user.role === "ICT") {
      const { bookingId, solution } = req.body;
      const booking = await ICTbooking.findById(bookingId);

      if (booking) {
        const now = new Date();
        booking.timeOut = now.toLocaleTimeString();
        booking.status = "Signed Out";
        booking.solution = solution;
        const year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        month = month < 10 ? "0" + month : month;
        day = day < 10 ? "0" + day : day;
        booking.resolvedDate = `${year}-${month}-${day}`;
        await booking.save();
        res
          .status(200)
          .json({ message: "Appointment signed out successfully" });
      } else {
        res.status(404).json({ message: "Booking not found" });
      }
    }
  } catch (error) {
    console.error("Error signing out appointment:", error);
    res.status(500).render("500");
  }
});

module.exports = router;
