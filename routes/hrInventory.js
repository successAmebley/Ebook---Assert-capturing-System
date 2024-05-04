const express = require("express");
const User = require("../models/User");
const computer = require("../models/computerAsset");
const router = express.Router();

// Middleware to authenticate the route
function authenticate(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get("/inventory/hr/electronics", authenticate, async (req, res) => {
  try {
    if (
      req.user.role === "HR" &&
      req.user.department === "HR" &&
      req.user.staffclass === "admin"
    ) {
      const partial = "partials/hrAdminHeader.ejs";
      res.render("location", {
        partial,
        getdistrict: "/inventory/hr/electronics/e",
      });
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

router.get("/inventory/hr/electronics/e", authenticate, async (req, res) => {
  try {
    if (req.user.role === "HR") {
      const partial =
        req.user.staffclass === "admin"
          ? "partials/hrAdminheader.ejs"
          : "partials/header.ejs";
      const { reg, dis } = req.query;
      const findDetailsInDistrict = await computer.find({
        Region: reg,
        District: dis,
      });
      const findDetailsInRegion = await computer.find({
        Region: reg,
        District: dis,
      });

      if (req && dis === "Region") {
        res.render("regElectronicsDetails", {
          reg,
          dis,
          findDetailsInRegion,
          findDetailsInDistrict,
          editMode: false,
          findUser: req.user,
          partial,
        });
      } else {
        res.render("electronicsdetails", {
          reg,
          dis,
          findDetailsInDistrict,
          findUser: req.user,
          partial,
        });
      }
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

module.exports = router;
