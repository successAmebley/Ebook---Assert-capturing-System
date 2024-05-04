const mongoose = require("mongoose");

const historicalDetailsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  details: {
    Region: String,
    District: String,
    brand: String,
    make: String,
    model: String,
    serialNumber: String,
    assetTag: String,
    processor: String,
    ramCapacity: String,
    storage: String,
    operatingSystem: String,
    macAddress: String,
    Room: String,
    assignedUser: String,
    department: String,
    status: String,
    physicalCondition: String,
    peripherals: String,
    notesComments: String,
    UserName: String,
    peripherals: [{ type: String }], // Array of peripherals
    notesComments: String,
    

    // Monitor details
    monitorBrand: String,
    monitorSerialNumber: String,
    monitorStatus: String,
  },
});

const computerSchema = new mongoose.Schema({
  history: [historicalDetailsSchema],
  Region: String,
  District: String,
  brand: String,
  make: String,
  model: String,
  serialNumber: String,
  assetTag: String,
  processor: String,
  ramCapacity: String,
  storage: String,
  operatingSystem: String,
  macAddress: String,
  Room: String,
  assignedUser: String,
  department: String,
  status: String,
  physicalCondition: String,
  peripherals: [{ type: String }], // Array of peripherals
  notesComments: String,
  UserName: String,

  // Monitor details
  monitorBrand: String,
  monitorSerialNumber: String,
  monitorStatus: String,
});

const computer = mongoose.model("computer", computerSchema);
module.exports = computer;
