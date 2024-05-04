const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const ICTBooking = require("../models/ICTBooking");
const Computer = require("../models/computerAsset");
const Printer = require("../models/printerAsset");

// Middleware to check authentication and role
function authenticate(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

router.get("/userdashboard", authenticate, async (req, res) => {
  try {
    // If authentication is successful, this callback will be called.
    const user = req.user;

    // Receptionist route
    if (
      user.role === "receptionist" &&
      user.department === "HR" &&
      user.staffclass === "user"
    ) {
      const bookings = await Booking.find({ status: "Pending" });
      const totalrecords = await Booking.countDocuments();
      const totalpending = bookings.length;
      return res.render("userdashboard", { totalpending, totalrecords });
    }

    // HR routes
    else if (
      user.role === "HR" &&
      user.department === "HR" &&
      user.staffclass === "admin"
    ) {
      const partial = "partials/hrAdminHeader.ejs";
      return res.render("hrAdminDashboard", { partial });
    } 
    
    else if (
      user.role === "HR" &&
      user.department === "HR" &&
      user.staffclass === "user"
    ) {
      const partial = "partials/hrHeader.ejs";
      return res.render("hrDashboard", { partial });
    }

    // ICT routes
    else if (
      user.role === "ICT" &&
      user.department === "IT" &&
      user.staffclass === "user"
    ) {
      const partial = "partials/header.ejs";
      const computersByDistrict = await Computer.aggregate([
        { $group: { _id: "$District", totalComputers: { $sum: 1 } } },
      ]);
      const printersByDistrict = await Printer.aggregate([
        { $group: { _id: "$District", totalPrinters: { $sum: 1 } } },
      ]);
      const mergedData = computersByDistrict.map((computerDistrict) => {
        const printerDistrict = printersByDistrict.find(
          (printerDistrict) => printerDistrict._id === computerDistrict._id
        );
        return {
          district: computerDistrict._id,
          totalComputers: computerDistrict.totalComputers || 0,
          totalPrinters: printerDistrict ? printerDistrict.totalPrinters : 0,
        };
      });
      const locationsData = await ICTBooking.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
      ]);
      const totalpending = await ICTBooking.countDocuments({
        status: "Pending",
      });
      const totalrecords = await ICTBooking.countDocuments();
      const totalComputers = await Computer.countDocuments();
      const totalPrinters = await Printer.countDocuments();
      return res.render("ICTuserdashboard", {
        totalpending,
        totalrecords,
        totalComputers,
        totalPrinters,
        assetsByDistrict: mergedData,
        locationsData,
        partial,
      });
    }

    // ICT Admin routes
    else if (
      user.role === "ICT" &&
      user.department === "IT" &&
      user.staffclass === "admin"
    ) {
      const partial = "partials/ictAdminheader.ejs";
      const computersByDistrict = await Computer.aggregate([
        { $group: { _id: "$District", totalComputers: { $sum: 1 } } },
      ]);
      const printersByDistrict = await Printer.aggregate([
        { $group: { _id: "$District", totalPrinters: { $sum: 1 } } },
      ]);
      const mergedData = computersByDistrict.map((computerDistrict) => {
        const printerDistrict = printersByDistrict.find(
          (printerDistrict) => printerDistrict._id === computerDistrict._id
        );
        return {
          district: computerDistrict._id,
          totalComputers: computerDistrict.totalComputers || 0,
          totalPrinters: printerDistrict ? printerDistrict.totalPrinters : 0,
        };
      });
      const locationsData = await ICTBooking.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
      ]);
      const totalpending = await ICTBooking.countDocuments({
        status: "Pending",
      });
      const totalrecords = await ICTBooking.countDocuments();
      const totalComputers = await Computer.countDocuments();
      const totalPrinters = await Printer.countDocuments();
      return res.render("ICTadmindashboard", {
        totalpending,
        totalrecords,
        totalComputers,
        totalPrinters,
        assetsByDistrict: mergedData,
        locationsData,
        partial,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
});

router.get("/logout", authenticate, (req, res) => {
  // If authentication is successful, this callback will be called.
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).render("500");
    }
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

module.exports = router;
