const express = require("express");
const ExcelJS = require("exceljs");
const User = require("../models/User");
const Ups = require("../models/UPSAsset");
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


router.get("/upsSpec",authenticate, async (req, res) => {
  try {
    let partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
        res.render("pcSpecs", { getdistrict: "/UPSSpecs/ups", partial });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});


router.get("/UPSSpecs/ups", authenticate,async (req, res) => {
  try {
    const partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    const { reg, dis } = req.query;
    const findDetailsInDistrict = await Ups.find({
      Region: reg,
      District: dis,
    });
    const findDetailsInRegion = await Ups.find({
      Region: reg,
      District: dis,
    });
if (req && dis === "Region") {
      res.render("regUPSDetails", {
        reg,
        dis,
        findDetailsInRegion,
        editMode: false,
        findUser: req.user,
        partial,
      });
    } else if (req && dis !== `Region`) {
      res.render("UPSdetails", {
        reg,
        dis,
        findDetailsInDistrict,
        findUser: req.user,
        partial,
      });
    } 
  }catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});
// Route to update UPS details
router.post("/UPSSpecs/ups",authenticate, async (req, res) => {
  try {
   // Extract region and district from the request body
    const { region, district } = req.body;

    // Check if region and district are provided
    if (!region|| !district) {
      return res.status(400).send("Region and district are required");
    }


        // Check if serialNumber or macAddress already exist
        const existingUPS = await Ups.findOne({
          $or: [
            { serialNumber: req.body.serialNumber }
          ],
        });

        if (existingUPS) {
          // Display error message and redirect
          const error = "Serial Number  already exists";
          return res.redirect(
            `/UPSSpecs/ups?reg=${region}&dis=${district}&error=${error}`
          );
        }
        const {
          brand,
          make,
          model,
          capacity,
          assetTag,
          serialNumber,
          assignedUser,
          department,
          status,
          physicalCondition,
          notesComments,
        } = req.body;


// Create a new Printer document
        await Ups.create({
          Region: region,
          District: district,
          brand,
          make,
          model,
          capacity,
          serialNumber,
          assetTag,
          assignedUser,
          department,
          status,
          physicalCondition,
          notesComments,
        });

        // Redirect to the same page with the same query parameters
        return res.redirect(`/UPSSpecs/ups?reg=${region}&dis=${district}`);
      }  catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});

router.get("/UPSSpecs/ups/dis_download/:reg/:dis", authenticate, async (req, res) => {
  try {
    const findDetailsInDistrict = await Ups.find({
      Region: req.params.reg,
      District: req.params.dis,
    });


    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("UPS Details");

    // Add headers to the worksheet
    worksheet.addRow([
      "Asset Tag",
      "Department",
      "User",
      "Brand",
      "Model",
      'capacity',
      "Serial Number",
      "Region",
      "District",
      "Room",
      "Status",
      "Physical Condition",
      "Notes/Comments",
      // Add more headers as needed
    ]);

    // Add data to the worksheet
    findDetailsInDistrict.forEach((item) => {
      worksheet.addRow([
        item.assetTag,
        item.department,
        item.assignedUser,
        item.brand,
        item.model,
        item.capacity,
        item.serialNumber,
        item.Region,
        item.District,
        item.Room,
        item.status,
        item.physicalCondition,
        item.notesComments,
        // Add more columns as needed
      ]);
    });

    // Set content type and headers for the download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.dis} UPS_details.xlsx`
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

router.get(
  "/UPSSpecs/ups/allDistrictsAndRegions/download/:reg", authenticate,
  async (req, res) => {
    try {
      // console.log(req.params);
      const allDistrictsAndRegionsData = await Ups.find({
        Region: req.params.reg,
      }); // Fetch data for all districts and regions

      function addDataToWorksheet(worksheet, data) {
        // Add headers to the worksheet
        worksheet.addRow([
          "Asset Tag",
          "Department",
          "User",
          "Brand",
          "Model",
          'capacity',
          "Serial Number",
          "Region",
          "District",
          "Room",
          "Status",
          "Physical Condition",
          "Notes/Comments",
          // Add more headers as needed
        ]);

        // Add data to the worksheet
        data.forEach((item) => {
          worksheet.addRow([
            item.assetTag,
            item.department,
            item.assignedUser,
            item.brand,
            item.model,
            item.capacity,
            item.serialNumber,
            item.Region,
            item.District,
            item.Room,
            item.status,
            item.physicalCondition,
            item.notesComments,
            // Add more columns as needed
          ]);
        });
      }

      function extractUniqueRegionsAndDistricts(data) {
        const uniqueRegionsAndDistricts = [];
        data.forEach((item) => {
          const { Region, District } = item; // Make sure the field names match your data model
          if (
            !uniqueRegionsAndDistricts.some(
              (entry) => entry.region === Region && entry.district === District
            )
          ) {
            uniqueRegionsAndDistricts.push({
              region: Region,
              district: District,
            });
          }
        });
        return uniqueRegionsAndDistricts;
      }
      // Create a new Excel workbook
      const workbook = new ExcelJS.Workbook();

      // Add the first sheet for all districts
      const allDistrictsWorksheet = workbook.addWorksheet("All Districts");
      addDataToWorksheet(allDistrictsWorksheet, allDistrictsAndRegionsData);

      // Add subsequent sheets for each region and district
      const regionsAndDistricts = extractUniqueRegionsAndDistricts(
        allDistrictsAndRegionsData
      );

      for (const { region, district } of regionsAndDistricts) {
        const worksheet = workbook.addWorksheet(`${region}_${district}`);
        const regionAndDistrictData = allDistrictsAndRegionsData.filter(
          (item) => item.Region === region && item.District === district
        );
        addDataToWorksheet(worksheet, regionAndDistrictData);
      }

      // Set content type and headers for the download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=UPS_all_districts_and_regions_details.xlsx"
      );

      // Write the workbook to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).render("500");
    }
  }
);

// Route to update UPS details
router.get("/updateUPS/:id", authenticate, async (req, res) => {
   try {
    const partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    const UPSId = req.params.id;
    const findUPS = await Ups.findById(UPSId);
  if (findUPS) {
    res.render("updateUPS", { findUPS,partial });
  }else {
      res.status(404).send("Printer not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
})


router.post("/updateUPS/:id", authenticate,async (req, res) => {
  try {
     const UPSId = req.params.id;
     const { region, district } = req.body;
     const existingUPS = await Ups.findById(UPSId);
    if (!existingUPS) {
      return res.status(404).send("UPS not found");
    }

    // Save existing details into the history array
    const historicalDetails = {
      timestamp: Date.now(),
      details: existingUPS.toObject(),
    };
    // Save existing details
    existingUPS.history.push(historicalDetails);
    await existingUPS.save();

    // Update the fields with new values
    const updatedUPS = await Ups.findByIdAndUpdate(
      UPSId,
      { $set: req.body },
      { new: true }
    );
    await updatedUPS.save();
    res.redirect(`/UPSSpecs/ups?reg=${region}&dis=${district}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500')
  }
});
module.exports = router;
