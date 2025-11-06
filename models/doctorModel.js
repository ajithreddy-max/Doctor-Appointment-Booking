const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    medicalCollege: {
      type: String,
      required: true,
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    mbbsCertificate: {
      type: String,
      required: true,
    },
    internshipCertificate: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    feePerCunsultation: {
      type: Number,
      required: true,
    },
    timings: {
      type: Array,
      required: true,
    },
    // Doctor weekly working days e.g., ["Mon","Tue","Wed","Thu","Fri"]
    workingDays: {
      type: [String],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    // Slot duration in minutes for generating availability
    slotDurationMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 240,
    },
    // List of holiday dates in format DD-MM-YYYY
    holidays: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);

const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel;
