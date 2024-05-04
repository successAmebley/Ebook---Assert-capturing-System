
const mongoose = require("mongoose");

const historicalDetailsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  details: {
    Region: String,
    District: String,
    brand: String,
    model: String,
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

const printerSchema = new mongoose.Schema({
  history: [historicalDetailsSchema],
  Region: String,
  District: String,
  brand: String,
  model: String,
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

const Printer = mongoose.model("printer", printerSchema);

module.exports = Printer;