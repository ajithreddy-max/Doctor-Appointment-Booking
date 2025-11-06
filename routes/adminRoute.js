const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");

router.get("/get-all-doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).send({
      message: "Doctors fetched successfully",
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying doctor account",
      success: false,
      error,
    });
  }
});

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      message: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying doctor account",
      success: false,
      error,
    });
  }
});

router.post(
  "/change-doctor-account-status",
  authMiddleware,
  async (req, res) => {
    try {
      const { doctorId, status } = req.body;
      const doctor = await Doctor.findByIdAndUpdate(doctorId, {
        status,
      });

      const user = await User.findOne({ _id: doctor.userId });
      if (user) {
        const unseenNotifications = user.unseenNotifications;
        unseenNotifications.push({
          type: "new-doctor-request-changed",
          message: `Your doctor account application has been ${status} by the admin`,
          onClickPath: "/notifications",
          createdAt: new Date()
        });
        user.isDoctor = status === "approved" ? true : false;
        await user.save();
        console.log("Doctor account status notification sent to user:", user.name);
      } else {
        console.log("User not found for doctor account status notification");
      }

      res.status(200).send({
        message: "Doctor status updated successfully",
        success: true,
        data: doctor,
      });
    } catch (error) {
      console.log("Error changing doctor account status:", error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
  }
);

router.get("/get-doctor-by-id/:doctorId", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.doctorId });
    res.status(200).send({
      message: "Doctor details fetched successfully",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching doctor details",
      success: false,
      error,
    });
  }
});

module.exports = router;

// Get all appointments (admin)
router.get("/get-all-appointments", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({});
    res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error: error.message || error,
    });
  }
});
