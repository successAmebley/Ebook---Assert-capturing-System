const express = require("express");
const ExcelJS = require("exceljs");
const User = require("../models/User");
const Printer = require("../models/printerAsset");
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

router.get("/printSpec",authenticate, async (req, res) => {
  try {
    let partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
        res.render("pcSpecs", { getdistrict:"/printSpecs/printer", partial });

  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});

router.get("/printSpecs/printer", authenticate,async (req, res) => {
  try {
    const partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    const { reg, dis } = req.query;
    const findDetailsInDistrict = await Printer.find({
      Region: reg,
      District: dis,
    });
    const findDetailsInRegion = await Printer.find({
      Region: reg,
      District: dis,
    });

        if (req && dis === "Region") {
          res.render("regPrintDetails", {
            reg,
        dis,
        findDetailsInRegion,
        editMode: false,
        findUser: req.user,
        partial,
          });
        } else if (req && dis !== `Region`) {
      res.render("printdetails", {
        reg,
        dis,
        findDetailsInDistrict,
        findUser: req.user,
        partial,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});

router.post("/printSpecs/printer",authenticate, async (req, res) => {
  try {
   // Extract region and district from the request body
    const { region, district } = req.body;

    // Check if region and district are provided
    if (!region|| !district) {
      return res.status(400).send("Region and district are required");
    }

    // Check if serialNumber, macAddress, and assetTag already exist
    const existingPrinter= await Printer.findOne({
      $or: [
        { serialNumber: req.body.serialNumber },
      
      ],
    });


        if (existingPrinter) {
          // Display error message and redirect
          const error = "Serial Number  already exists";
          return res.redirect(
            `/printSpecs/printer?reg=${region}&dis=${district}&error=${error}`
          );
        }
        const {
          brand,
          make,
          model,
          assetTag,
          serialNumber,
          assignedUser,
          department,
          status,
          physicalCondition,
          notesComments,
        } = req.body;

 // Create a new Printer document
        await Printer.create({
          Region: region,
          District: district,
          brand,
          make,
          model,
          serialNumber,
          assetTag,
          assignedUser,
          department,
          status,
          physicalCondition,
          notesComments,
        });

        // Redirect to the same page with the same query parameters
       return res.redirect(`/printSpecs/printer?reg=${region}&dis=${district}`);
      }  catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render('500');
  }
});

router.get("/printSpecs/printer/dis_download/:reg/:dis", authenticate, async (req, res) => {
  try {
    const findDetailsInDistrict = await Printer.find({
      Region: req.params.reg,
      District: req.params.dis,
    });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `${req.params.dis} Printer Details `
    );

    // Add headers to the worksheet
    worksheet.addRow([
      "Asset Tag",
      "Department",
      "User",
      "Brand",
      "Model",
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
      `attachment; filename=${req.params.dis}printer_details.xlsx`
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
});

router.get(
  "/printSpecs/printer/allDistrictsAndRegions/download/:reg", authenticate,
  async (req, res) => {
    try {
      // console.log(req.params);
      const allDistrictsAndRegionsData = await Printer.find({
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
          if (!uniqueRegionsAndDistricts.some(  (entry) => entry.region === Region && entry.district === District    )) {
            uniqueRegionsAndDistricts.push({ region: Region, district: District, });
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
        "attachment; filename=all_districts_and_regions Printer_details.xlsx"
      );

      // Write the workbook to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).render('500');
    }
  }
);

// Route to update PC details
router.get("/updatePrinter/:id", authenticate,async (req, res) => {
  try {
    const partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    const printerId = req.params.id;
    const findPrinter = await Printer.findById(printerId);
    if (findPrinter) {
      res.render("updatePrinter", { findPrinter, partial });
    } else {
      res.status(404).send("Printer not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
})

// Route to update Printer details

router.post("/updatePrinter/:id", authenticate,async (req, res) => {
  try {
    const printerId = req.params.id;
   const { region, district } = req.body;
    const existingPrinter = await Printer.findById(printerId);
    if (!existingPrinter) {
      return res.status(404).send("Printer not found");
    }

    // Save existing details into the history array
    const historicalDetails = {
      timestamp: Date.now(),
      details: existingPrinter.toObject(),
    };
    // Save existing details
    existingPrinter.history.push(historicalDetails);
    await existingPrinter.save();

    // Update the fields with new values
    const updatedPrinter = await Printer.findByIdAndUpdate(
      printerId,
      { $set: req.body },
      { new: true }
    );
    await updatedPrinter.save();
    res.redirect(`/printSpecs/printer?reg=${region}&dis=${district}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('500');
  }
});
module.exports = router;
