const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    enum: ["stitching", "alteration", "custom"],
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  approvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("appointment", appointmentSchema);
