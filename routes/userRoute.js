const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF)$/)) {
      req.fileValidationError = "Only image and PDF files are allowed!";
      return cb(new Error("Only image and PDF files are allowed!"), false);
    }
    cb(null, true);
  },
});

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

router.post("/apply-doctor-account", authMiddleware, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'mbbsCertificate', maxCount: 1 },
  { name: 'internshipCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    // Get file paths from uploaded files
    const photoPath = req.files.photo ? req.files.photo[0].path : null;
    const mbbsCertificatePath = req.files.mbbsCertificate ? req.files.mbbsCertificate[0].path : null;
    const internshipCertificatePath = req.files.internshipCertificate ? req.files.internshipCertificate[0].path : null;

    // Create new doctor with file paths
    const newdoctor = new Doctor({
      ...req.body,
      photo: photoPath,
      mbbsCertificate: mbbsCertificatePath,
      internshipCertificate: internshipCertificatePath,
      status: "pending"
    });

    await newdoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });

    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newdoctor._id,
        name: newdoctor.firstName + " " + newdoctor.lastName,
      },
      onClickPath: "/admin/doctorslist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).send({
      success: true,
      message: "Doctor account applied successfully",
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
  "/mark-all-notifications-as-seen",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      const unseenNotifications = user.unseenNotifications;
      const seenNotifications = user.seenNotifications;
      seenNotifications.push(...unseenNotifications);
      user.unseenNotifications = [];
      user.seenNotifications = seenNotifications;
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All notifications marked as seen",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error applying doctor account",
        success: false,
        error,
      });
    }
  }
);

router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications cleared",
      data: updatedUser,
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

router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });
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

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    // Validate that the appointment date is not in the past
    const appointmentDate = moment(req.body.date, "DD-MM-YYYY");
    const appointmentTime = moment(req.body.time, "HH:mm");
    const appointmentDateTime = moment(`${req.body.date} ${req.body.time}`, "DD-MM-YYYY HH:mm");
    const currentDateTime = moment();
    
    if (appointmentDateTime.isBefore(currentDateTime)) {
      return res.status(400).send({
        message: "Cannot book appointments in the past. Please select a future date and time.",
        success: false,
      });
    }
    
    req.body.status = "pending";
    req.body.date = appointmentDate.toISOString();
    req.body.time = appointmentTime.toISOString();
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    //pushing notification to doctor based on his userid
    const user = await User.findOne({ _id: req.body.doctorInfo.userId });
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name}`,
      onClickPath: "/doctor/appointments",
    });
    await user.save();
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
  try {
    // Validate that the appointment date is not in the past
    const appointmentDateTime = moment(`${req.body.date} ${req.body.time}`, "DD-MM-YYYY HH:mm");
    const currentDateTime = moment();
    
    if (appointmentDateTime.isBefore(currentDateTime)) {
      return res.status(400).send({
        message: "Cannot check availability for past dates. Please select a future date and time.",
        success: false,
      });
    }
    
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await Appointment.find({
      doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not available",
        success: false,
      });
    } else {
      return res.status(200).send({
        message: "Appointments available",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.body.userId });
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
      error,
    });
  }
});

router.post("/recommend-doctor", authMiddleware, async (req, res) => {
  try {
    const { healthIssue } = req.body;
    // Map health issue to specialization (this is a simple example; you can expand this mapping)
    const specializationMap = {
      "headache": "Neurology",
      "fever": "General Medicine",
      "heart pain": "Cardiology",
      "stomach pain": "Gastroenterology",
      "cough": "Pulmonology",
      "skin rash": "Dermatology",
      "joint pain": "Orthopedics",
      "anxiety": "Psychiatry",
      "diabetes": "Endocrinology",
      "eye problem": "Ophthalmology",
      // Add more mappings as needed
    };
    const specialization = specializationMap[healthIssue.toLowerCase()] || "General Medicine";
    const doctors = await Doctor.find({ specialization });
    res.status(200).send({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error recommending doctors",
      success: false,
      error,
    });
  }
});

router.post("/update-user-profile", authMiddleware, async (req, res) => {
  try {
    const { userId, name, phoneNumber, address } = req.body;
    
    // Validate required fields
    if (!userId || !name || !phoneNumber || !address) {
      return res.status(400).send({
        message: "All fields are required",
        success: false,
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phoneNumber,
        address,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).send({
      message: "Profile updated successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error updating profile",
      success: false,
      error,
    });
  }
});

router.post("/upload-profile-photo", authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).send({
        message: "User ID is required",
        success: false,
      });
    }

    if (!req.file) {
      return res.status(400).send({
        message: "No photo uploaded",
        success: false,
      });
    }

    // Update user profile with new photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        photo: req.file.path,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).send({
        message: "Profile photo updated successfully",
        success: true,
        data: updatedUser,
      });
    }

    res.status(200).send({
      message: "Profile photo updated successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error uploading profile photo",
      success: false,
      error,
    });
  }
});

router.post("/remove-profile-photo", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).send({
        message: "User ID is required",
        success: false,
      });
    }

    // Remove profile photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        photo: null,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).send({
      message: "Profile photo removed successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error removing profile photo",
      success: false,
      error,
    });
  }
});

module.exports = router;
