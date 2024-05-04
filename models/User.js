const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  contact: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "receptionist",'ICT','HR' ] },
  department:{type:String,enum:['IT','HR','Admin']},
  staffclass:{type:String,enum:['admin','user']},
  editStatus:{type:Boolean,default:false}
});

const User = mongoose.model("User", userSchema);

module.exports = User;


