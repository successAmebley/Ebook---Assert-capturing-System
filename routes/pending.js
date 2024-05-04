const express = require("express");
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

router.get("/pending", authenticate, async (req, res) => {
  try {
    // If user reaches here, they are authorized to access the route
    const findUser = req.user;

    if (findUser.role === "receptionist") {
      if (findUser.staffclass === "user") {
        const partial = "partials/recepHeader.ejs";
        const bookings = await Booking.find({ status: "Pending" });
        const total = bookings.length;
        return res.render("pending", { bookings, partial });
      }
    } else if (findUser.role === "ICT") {
      const partial =
        findUser.staffclass === "user"
          ? "partials/header.ejs"
          : "partials/ictAdminheader.ejs";
      const bookings = await ICTbooking.find({ status: "Pending" });
      return res.render("ICTpending", { bookings, partial });
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render("500");
  }
});

module.exports = router;
