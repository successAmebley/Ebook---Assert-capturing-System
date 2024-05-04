const express = require("express");
const Computer = require("../models/computerAsset");
const ExcelJS = require("exceljs");
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

// Route to access PC specs
router.get("/pcSpecs", authenticate, async (req, res) => {
  try {
    let partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    res.render("pcSpecs", { getdistrict: "/pcSpecs/pc", partial });
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

// Route to fetch PC details by district
router.get("/pcSpecs/pc", authenticate, async (req, res) => {
  try {
    const partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    const { reg, dis } = req.query;
    const findDetailsInDistrict = await Computer.find({
      Region: reg,
      District: dis,
    });
    const findDetailsInRegion = await Computer.find({
      Region: reg,
      District: dis,
    });

    if (req && dis === "Region") {
      res.render("regPcDetails", {
        reg,
        dis,
        findDetailsInRegion,
        editMode: false,
        findUser: req.user,
        partial,
      });
    } else if (req && dis !== `Region`) {
      res.render("pcdetails", {
        reg,
        dis,
        findDetailsInDistrict,
        findUser: req.user,
        partial,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

// Route to update PC details
router.post("/pcSpecs/pc", authenticate, async (req, res) => {
  try {
    // Extract region and district from the request body
    const { region, district } = req.body;

    // Check if region and district are provided
    if (!region || !district) {
      return res.status(400).send("Region and district are required");
    }

    // Check if serialNumber, macAddress, and assetTag already exist
    const existingComputer = await Computer.findOne({
      $or: [
        { serialNumber: req.body.serialNumber },
        { macAddress: req.body.macAddress },
        { assetTag: req.body.assetTag },
      ],
    });

    if (existingComputer) {
      const error = "Serial Number, MAC Address, or Asset Tag already exists";
      return res.redirect(
        `/pcSpecs/pc?reg=${region}&dis=${district}&error=${error}`
      );
    }

    // Extract other fields from the request body
    const {
      brand,
      make,
      model,
      processor,
      ramCapacity,
      storage,
      operatingSystem,
      assignedUser,
      department,
      status,
      physicalCondition,
      notesComments,
      peripherals,
      monitorBrand,
      monitorSerialNumber,
      monitorStatus,
    } = req.body;

    // Create a new computer document
    await Computer.create({
      Region: region,
      District: district,
      brand,
      make,
      model,
      serialNumber: req.body.serialNumber,
      assetTag: req.body.assetTag,
      processor,
      ramCapacity,
      storage,
      operatingSystem,
      macAddress: req.body.macAddress,
      assignedUser,
      department,
      status,
      physicalCondition,
      notesComments,
      peripherals,
      monitorBrand,
      monitorSerialNumber,
      monitorStatus,
      UserName: req.user.username,
      //UserName: req.user.fname + " " + req.user.lname,
    });

    // Redirect to the same page with the same query parameters
    return res.redirect(`/pcSpecs/pc?reg=${region}&dis=${district}`);
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).render("500");
  }
});

// Route to download PC details by district
router.get(
  "/pcSpecs/pc/dis_download/:reg/:dis",
  authenticate,
  async (req, res) => {
    try {
      const findDetailsInDistrict = await Computer.find({
        Region: req.params.reg,
        District: req.params.dis,
      });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${req.params.dis} PC Details `);

      worksheet.addRow([
        "Asset Tag",
        "Department",
        "User",
        "Brand",
        "Make",
        "Model",
        "Serial Number",
        "Processor",
        "RAM Capacity",
        "Storage",
        "Operating System",
        "MAC Address",
        "Region",
        "District",
        "Room",
        "Status",
        "Physical Condition",
        "Peripherals",
        "Notes/Comments",
        "Monitor Brand",
        "Monitor Serial Number",
        "Monitor Status",
      ]);

      // Add data to the worksheet
      findDetailsInDistrict.forEach((item) => {
        worksheet.addRow([
          item.assetTag,
          item.department,
          item.assignedUser,
          item.brand,
          item.make,
          item.model,
          item.serialNumber,
          item.processor,
          item.ramCapacity,
          item.storage,
          item.operatingSystem,
          item.macAddress,
          item.Region,
          item.District,
          item.Room,
          item.status,
          item.physicalCondition,
          item.peripherals,
          item.monitorBrand, // New field for monitor details
          item.monitorSerialNumber, // New field for monitor details
          item.monitorStatus, // New field for monitor details
          item.notesComments,

          // Add more columns as needed
        ]);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${req.params.dis} PC Details .xlsx`
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).render("500");
    }
  }
);

// Route to download PC details for all districts and regions
router.get(
  "/pcSpecs/pc/allDistrictsAndRegions/download/:reg",
  authenticate,
  async (req, res) => {
     try {
       const allDistrictsAndRegionsData = await Computer.find({
         Region: req.params.reg,
       }); // Fetch data for all districts and regions

       function addDataToWorksheet(worksheet, data) {
         // Add headers to the worksheet

         // Add headers to the worksheet
         worksheet.addRow([
           "Asset Tag",
           "Department",
           "User",
           "Brand",
           "Make",
           "Model",
           "Serial Number",
           "Processor",
           "RAM Capacity",
           "Storage",
           "Operating System",
           "MAC Address",
           "Region",
           "District",
           "Room",
           "Status",
           "Physical Condition",
           "Peripherals",
           "Notes/Comments",
           "Monitor Brand", // New field for monitor details
           "Monitor Serial Number", // New field for monitor details
           "Monitor Status", // New field for monitor details
           // Add more headers as needed
         ]);

         // Add data to the worksheet
         data.forEach((item) => {
           worksheet.addRow([
             item.assetTag,
             item.department,
             item.assignedUser,
             item.brand,
             item.make,
             item.model,
             item.serialNumber,
             item.processor,
             item.ramCapacity,
             item.storage,
             item.operatingSystem,
             item.macAddress,
             item.Region,
             item.District,
             item.Room,
             item.status,
             item.physicalCondition,
             item.peripherals,
             item.notesComments,
             item.monitorBrand, // New field for monitor details
             item.monitorSerialNumber, // New field for monitor details
             item.monitorStatus, // New field for monitor details
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
         "attachment; filename=all_districts_and_regions PC_details.xlsx"
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

// Route to render PC update page
router.get("/updateComputer/:id", authenticate, async (req, res) => {
  try {
    const partial =
      req.user.staffclass === "admin"
        ? "partials/ictAdminheader.ejs"
        : "partials/header.ejs";
    const pcId = req.params.id;
    const findPC = await Computer.findById(pcId);
    if (findPC) {
      res.render("updatePC", { findPC, partial });
    } else {
      res.status(404).send("Computer not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

// Route to update PC details
router.post("/updateComputer/:id", authenticate, async (req, res) => {
  try {
    const computerId = req.params.id;
    const { region, district } = req.body;
    const existingComputer = await Computer.findById(computerId);

    if (!existingComputer) {
      return res.status(404).send("Computer not found");
    }

    const historicalDetails = {
      timestamp: Date.now(),
      details: existingComputer.toObject(),
    };
    existingComputer.history.push(historicalDetails);
    await existingComputer.save();

    const updatedComputer = await Computer.findByIdAndUpdate(
      computerId,
      { $set: req.body },
      { new: true }
    );
    await updatedComputer.save();

    res.redirect(`/pcSpecs/pc?reg=${region}&dis=${district}`);
  } catch (error) {
    console.error(error);
    res.status(500).render("500");
  }
});

module.exports = router;
