




const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  
      username: { type: String, required: true }, // Assuming this is the receptionist's username
      name: { type: String, required: true },
      contact: { type: Number, required: true },
      appointmentDate: { type: String, required: true, unique: false },
      timeIn: { type: String, required: true },
      department: { type: String, required: true },
      purpose: { type: String, required: true },
      additionalInfo: { type: String },
      status: { type: String, required: true },
      timeOut: { type: String  },
    
  
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;