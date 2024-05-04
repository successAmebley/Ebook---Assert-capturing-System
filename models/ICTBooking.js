const mongoose = require("mongoose");

const ICTbookingSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Assuming this is the receptionist's username
  staffname: { type: String, required: true },
  location: { type: String, required: true },
  bookingDate: { type: String, required: true, unique: false },
  timeIn: { type: String, required: true },
  department: { type: String, required: true },
  detail: { type: String, required: true },
  problem: { type: String, required: true },
  assignedTo: { type: String, required: true },
  solution: { type: String },
  status: { type: String, required: true },
  timeOut: { type: String },
  resolvedDate: { type: String },
});

const ICTbooking = mongoose.model("ICTBooking", ICTbookingSchema);

module.exports = ICTbooking;
