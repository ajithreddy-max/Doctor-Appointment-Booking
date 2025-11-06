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
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "your-secret-key-here-please-change-this-in-production", {
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
    // Check for file validation errors
    if (req.fileValidationError) {
      return res.status(400).send({
        message: req.fileValidationError,
        success: false,
      });
    }
    
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("User ID from auth:", req.body.userId);
    
    // Get file paths from uploaded files
    const photoPath = req.files.photo ? req.files.photo[0].path : null;
    const mbbsCertificatePath = req.files.mbbsCertificate ? req.files.mbbsCertificate[0].path : null;
    const internshipCertificatePath = req.files.internshipCertificate ? req.files.internshipCertificate[0].path : null;

    // Ensure userId is available (check both authMiddleware and form data)
    const userId = req.body.userId || req.userId;
    if (!userId) {
      return res.status(400).send({
        message: "User ID not found in request",
        success: false,
      });
    }
    
    // Set userId in req.body for consistency
    req.body.userId = userId;

    // Create new doctor with file paths
    const newdoctor = new Doctor({
      ...req.body,
      userId: req.body.userId, // Ensure userId is explicitly set
      photo: photoPath,
      mbbsCertificate: mbbsCertificatePath,
      internshipCertificate: internshipCertificatePath,
      status: "pending"
    });

    await newdoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });

    if (adminUser) {
      const unseenNotifications = adminUser.unseenNotifications;
      unseenNotifications.push({
        type: "new-doctor-request",
        message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newdoctor._id,
          name: newdoctor.firstName + " " + newdoctor.lastName,
        },
        onClickPath: "/admin/doctorslist",
        createdAt: new Date()
      });
      await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    }
    res.status(200).send({
      success: true,
      message: "Doctor account applied successfully",
    });
  } catch (error) {
    console.log("Apply doctor error:", error);
    res.status(500).send({
      message: "Error applying doctor account: " + error.message,
      success: false,
      error: error.message,
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
    // Validate requested time is within doctor's working hours and according to availability rules
    const doctorForBooking = await Doctor.findById(req.body.doctorId);
    if (!doctorForBooking) {
      return res.status(404).send({
        message: "Doctor not found",
        success: false,
      });
    }
    // Handle timings stored as Array or JSON string
    let startTimeStr = null;
    let endTimeStr = null;
    if (Array.isArray(doctorForBooking.timings)) {
      startTimeStr = doctorForBooking.timings[0];
      endTimeStr = doctorForBooking.timings[1];
    } else if (typeof doctorForBooking.timings === "string") {
      try {
        const parsed = JSON.parse(doctorForBooking.timings);
        if (Array.isArray(parsed)) {
          startTimeStr = parsed[0];
          endTimeStr = parsed[1];
        }
      } catch (_) {}
    }
    if (!startTimeStr || !endTimeStr) {
      return res.status(400).send({
        message: "Doctor working hours not configured",
        success: false,
      });
    }
    const workStart = moment(startTimeStr, "HH:mm");
    const workEnd = moment(endTimeStr, "HH:mm");
    if (!appointmentTime.isBetween(workStart, workEnd, undefined, "[]")) {
      return res.status(400).send({
        message: `Selected time must be between ${workStart.format("HH:mm")} and ${workEnd.format("HH:mm")}`,
        success: false,
      });
    }

    // Check doctor's working day and holidays
    const dayKey = appointmentDate.format("ddd");
    if (Array.isArray(doctorForBooking.workingDays) && doctorForBooking.workingDays.length > 0) {
      if (!doctorForBooking.workingDays.includes(dayKey)) {
        return res.status(400).send({
          message: "Selected date is a non-working day for the doctor",
          success: false,
        });
      }
    }
    if (Array.isArray(doctorForBooking.holidays) && doctorForBooking.holidays.includes(appointmentDate.format("DD-MM-YYYY"))) {
      return res.status(400).send({
        message: "Selected date is a holiday for the doctor",
        success: false,
      });
    }

    // Enforce slot grid (optional: align to doctor's slotDurationMinutes)
    const slotMinutes = Number(doctorForBooking.slotDurationMinutes || 30);
    const minutesFromStart = appointmentTime.diff(workStart, 'minutes');
    if (slotMinutes > 0 && minutesFromStart % slotMinutes !== 0) {
      return res.status(400).send({
        message: `Please select time aligned to ${slotMinutes}-minute slots`,
        success: false,
      });
    }

    req.body.status = "pending";
    // Persist in the same string formats used by the client and doctor UI
    req.body.date = appointmentDate.format("DD-MM-YYYY");
    req.body.time = appointmentTime.format("HH:mm");
    
    // Create a properly structured appointment object
    const appointmentData = {
      userId: req.body.userId,
      doctorId: req.body.doctorId,
      doctorInfo: {
        firstName: req.body.doctorInfo?.firstName || '',
        lastName: req.body.doctorInfo?.lastName || '',
        phoneNumber: req.body.doctorInfo?.phoneNumber || '',
        specialization: req.body.doctorInfo?.specialization || '',
        address: req.body.doctorInfo?.address || '',
        feePerCunsultation: req.body.doctorInfo?.feePerCunsultation || 0
      },
      userInfo: {
        name: req.body.userInfo?.name || '',
        email: req.body.userInfo?.email || '',
        phoneNumber: req.body.userInfo?.phoneNumber || ''
      },
      date: req.body.date,
      time: req.body.time,
      status: req.body.status,
      symptoms: req.body.symptoms || []
    };
    
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();
    // Notify doctor
    let doctorUser = null;
    try {
      // Prefer lookup from doctorId to avoid stale doctorInfo
      const doctor = await Doctor.findById(req.body.doctorId);
      if (doctor && doctor.userId) {
        doctorUser = await User.findById(doctor.userId);
      }
      if (!doctorUser && req.body.doctorInfo?.userId) {
        doctorUser = await User.findById(req.body.doctorInfo.userId);
      }
    } catch (error) {
      console.log("Error finding doctor user:", error);
    }

    // Create symptoms list for notification
    const symptomsList = appointmentData.symptoms && appointmentData.symptoms.length > 0 
      ? appointmentData.symptoms.join(", ") 
      : "No symptoms specified";

    if (doctorUser) {
      doctorUser.unseenNotifications.push({
        type: "new-appointment-request",
        message: `New appointment request from ${appointmentData.userInfo.name}. Date: ${appointmentData.date}, Time: ${appointmentData.time}. Symptoms: ${symptomsList}`,
        onClickPath: "/doctor/appointments",
        createdAt: new Date()
      });
      await doctorUser.save();
      console.log("Notification sent to doctor:", doctorUser.name);
    } else {
      console.log("Doctor user not found for notification");
    }

    // Notify admin
    const adminUser = await User.findOne({ isAdmin: true });
    if (adminUser) {
      adminUser.unseenNotifications.push({
        type: "new-appointment",
        message: `New appointment booked by ${appointmentData.userInfo.name} with Dr. ${appointmentData.doctorInfo?.firstName || ""} ${appointmentData.doctorInfo?.lastName || ""}. Date: ${appointmentData.date}, Time: ${appointmentData.time}. Symptoms: ${symptomsList}`.trim(),
        onClickPath: "/admin/dashboard",
        createdAt: new Date()
      });
      await adminUser.save();
      console.log("Notification sent to admin:", adminUser.name);
    } else {
      console.log("Admin user not found for notification");
    }

    // Notify booking user (confirmation)
    try {
      const bookingUser = await User.findById(appointmentData.userId);
      if (bookingUser) {
        bookingUser.unseenNotifications.push({
          type: "appointment-booked",
          message: `Your appointment with Dr. ${appointmentData.doctorInfo?.firstName || ""} ${appointmentData.doctorInfo?.lastName || ""} has been booked successfully. Date: ${appointmentData.date}, Time: ${appointmentData.time}. Symptoms: ${symptomsList}`,
          onClickPath: "/appointments",
          createdAt: new Date()
        });
        await bookingUser.save();
        console.log("Notification sent to booking user:", bookingUser.name);
      } else {
        console.log("Booking user not found for notification");
      }
    } catch (error) {
      console.log("Error sending notification to booking user:", error);
    }
    res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error: error.message || error,
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
    // Ensure requested time falls within doctor's working hours
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).send({ message: "Doctor not found", success: false });
    }
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
      return res.status(400).send({ message: "Doctor working hours not configured", success: false });
    }
    const workStart = moment(startTimeStr, "HH:mm");
    const workEnd = moment(endTimeStr, "HH:mm");
    const requestedTime = moment(req.body.time, "HH:mm");
    if (!requestedTime.isBetween(workStart, workEnd, undefined, "[]")) {
      return res.status(200).send({
        message: `Selected time must be between ${workStart.format("HH:mm")} and ${workEnd.format("HH:mm")}`,
        success: false,
      });
    }

    const doctorId = req.body.doctorId;
    const dateStr = moment(req.body.date, "DD-MM-YYYY").format("DD-MM-YYYY");
    
    // Conflict check: exact slot matching by time for same date
    const sameDayAppointments = await Appointment.find({ doctorId: doctorId, date: dateStr });
    const conflict = sameDayAppointments.some(a => a.time === requestedTime.format("HH:mm"));

    if (conflict) {
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
      message: "Error checking appointment availability",
      success: false,
      error: error.message || error,
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
      error: error.message || error,
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

// Add search doctors endpoint
router.post("/search-doctors", authMiddleware, async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    // Search for doctors by name (firstName or lastName)
    const doctors = await Doctor.find({
      $and: [
        { status: "approved" },
        {
          $or: [
            { firstName: { $regex: searchTerm, $options: "i" } },
            { lastName: { $regex: searchTerm, $options: "i" } }
          ]
        }
      ]
    });
    
    res.status(200).send({
      success: true,
      message: doctors.length > 0 ? "Doctors found" : "No doctors found",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error searching doctors",
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
