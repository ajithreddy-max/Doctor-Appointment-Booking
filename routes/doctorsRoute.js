const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const moment = require("moment");

router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/update-doctor-profile", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting doctor info", success: false, error });
  }
});

router.get(
  "/get-appointments-by-doctor-id",
  authMiddleware,
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.userId || req.body.userId });
      if (!doctor) {
        return res.status(404).send({
          message: "Doctor not found",
          success: false,
        });
      }
      const appointments = await Appointment.find({ doctorId: String(doctor._id) });
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
  }
);

// Get appointment details for viewing (no populate; ids are stored as strings)
router.get("/get-appointment-details/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
        success: false,
      });
    }

    res.status(200).send({
      message: "Appointment details fetched successfully",
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching appointment details",
      success: false,
      error,
    });
  }
});

// Complete appointment
router.post("/complete-appointment", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'completed',
      completedAt: new Date()
    });

    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
        success: false,
      });
    }

    // Get doctor info
    const doctor = await Doctor.findOne({ userId: req.userId || req.body.userId });
    const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor";

    const user = await User.findById(appointment.userId);
    if (user) {
      user.unseenNotifications.push({
        type: "appointment-completed",
        message: `Your appointment with ${doctorName} on ${appointment.date} at ${appointment.time} has been completed successfully`,
        onClickPath: "/appointments",
        createdAt: new Date()
      });
      await user.save();
    }

    res.status(200).send({
      message: "Appointment completed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error completing appointment",
      success: false,
      error,
    });
  }
});

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });

    if (appointment) {
      // Get doctor info
      const doctor = await Doctor.findOne({ userId: req.userId || req.body.userId });
      const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor";

      const user = await User.findById(appointment.userId);
      if (user) {
        user.unseenNotifications.push({
          type: "appointment-status-changed",
          message: `Your appointment status with ${doctorName} has been ${status}. Date: ${appointment.date}, Time: ${appointment.time}`,
          onClickPath: "/appointments",
          createdAt: new Date()
        });
        await user.save();
        console.log("Appointment status change notification sent to user:", user.name);
      } else {
        console.log("User not found for appointment status change notification");
      }
    } else {
      console.log("Appointment not found for status change");
    }

    res.status(200).send({
      message: "Appointment status updated successfully",
      success: true
    });
  } catch (error) {
    console.log("Error changing appointment status:", error);
    res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error,
    });
  }
});

// Update appointment details (doctor-only): reschedule, add notes/prescription/follow-up
router.post("/update-appointment", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, date, time, doctorNotes, prescription, followUpDate } = req.body;

    const update = {};
    if (date) update.date = date;
    if (time) update.time = time;
    if (typeof doctorNotes === 'string') update.doctorNotes = doctorNotes;
    if (typeof prescription === 'string') update.prescription = prescription;
    if (followUpDate) update.followUpDate = followUpDate;

    const appointment = await Appointment.findByIdAndUpdate(appointmentId, update, { new: true });

    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found" });
    }

    // Get doctor info
    const doctor = await Doctor.findOne({ userId: req.userId || req.body.userId });
    const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Doctor";

    const user = await User.findById(appointment.userId);
    if (user) {
      const changes = [];
      if (date) changes.push(`Date: ${date}`);
      if (time) changes.push(`Time: ${time}`);
      if (doctorNotes) changes.push("Doctor notes added");
      if (prescription) changes.push("Prescription added");
      if (followUpDate) changes.push(`Follow-up: ${followUpDate}`);

      user.unseenNotifications.push({
        type: "appointment-updated",
        message: `Your appointment with ${doctorName} has been updated. ${changes.join(", ")}`,
        onClickPath: "/appointments",
        createdAt: new Date()
      });
      await user.save();
    }

    res.status(200).send({ success: true, message: "Appointment updated successfully", data: appointment });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error updating appointment", error });
  }
});

module.exports = router;

// Set or update doctor's availability (working days, timings, slot duration, holidays)
router.post("/set-availability", authMiddleware, async (req, res) => {
  try {
    const { workingDays, timings, slotDurationMinutes, holidays } = req.body;
    const doctor = await Doctor.findOne({ userId: req.userId || req.body.userId });
    if (!doctor) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }

    if (workingDays) doctor.workingDays = workingDays;
    if (timings) doctor.timings = timings;
    if (slotDurationMinutes) doctor.slotDurationMinutes = slotDurationMinutes;
    if (holidays) doctor.holidays = holidays;

    await doctor.save();
    return res.status(200).send({ success: true, message: "Availability updated", data: doctor });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error updating availability", error });
  }
});

// Get available slots for a date (DD-MM-YYYY)
router.post("/available-slots", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date } = req.body; // date format: DD-MM-YYYY
    const doctor = doctorId
      ? await Doctor.findById(doctorId)
      : await Doctor.findOne({ userId: req.userId || req.body.userId });

    if (!doctor) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }

    // Check holiday
    if (doctor.holidays?.includes(date)) {
      return res.status(200).send({ success: true, data: [], message: "Holiday" });
    }

    // Check working day
    const m = moment(date, "DD-MM-YYYY");
    const dayKey = m.format("ddd"); // Mon, Tue, ...
    if (Array.isArray(doctor.workingDays) && doctor.workingDays.length > 0) {
      if (!doctor.workingDays.includes(dayKey)) {
        return res.status(200).send({ success: true, data: [], message: "Non-working day" });
      }
    }

    // Parse timings (may be array or JSON string)
    let startTimeStr = null;
    let endTimeStr = null;
    if (Array.isArray(doctor.timings)) {
      startTimeStr = doctor.timings[0];
      endTimeStr = doctor.timings[1];
    } else if (typeof doctor.timings === "string") {
      try {
        const parsed = JSON.parse(doctor.timings);
        if (Array.isArray(parsed)) {
          startTimeStr = parsed[0];
          endTimeStr = parsed[1];
        }
      } catch (_) {}
    }
    if (!startTimeStr || !endTimeStr) {
      return res.status(200).send({ success: true, data: [], message: "Working hours not set" });
    }

    const start = moment(startTimeStr, "HH:mm");
    const end = moment(endTimeStr, "HH:mm");
    const slotMinutes = Number(doctor.slotDurationMinutes || 30);
    const slots = [];
    let cursor = start.clone();
    while (cursor.add(0, "minutes") && cursor.isBefore(end)) {
      const next = cursor.clone().add(slotMinutes, "minutes");
      if (next.isAfter(end)) break;
      slots.push(cursor.format("HH:mm"));
      cursor = next;
    }

    // Remove booked/conflicting slots on that date
    const dateStr = m.format("DD-MM-YYYY");
    const appts = await Appointment.find({ doctorId: String(doctor._id), date: dateStr });
    const takenTimes = new Set(appts.map(a => a.time));
    const available = slots.filter(t => !takenTimes.has(t));

    return res.status(200).send({ success: true, data: available });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error fetching slots", error });
  }
});
