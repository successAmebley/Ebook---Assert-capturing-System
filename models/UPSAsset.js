const mongoose = require("mongoose");

const historicalDetailsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  details: {
    Region: String,
    District: String,
    brand: String,
    model: String,
    capacity: String,
    serialNumber: String,
    assetTag: String,
    Room: String,
    assignedUser: String,
    department: String,
    status: String,
    physicalCondition: String,
    notesComments: String,
    UserName: String,
  },
});

const UpsSchema = new mongoose.Schema({
  history: [historicalDetailsSchema],
  Region: String,
  District: String,
  brand: String,
  model: String,
  capacity: String,
  serialNumber: String,
  assetTag: String,
  Room: String,
  assignedUser: String,
  department: String,
  status: String,
  physicalCondition: String,
  notesComments: String,
  UserName: String,
});

const Ups = mongoose.model("UPS", UpsSchema);

module.exports = Ups;
