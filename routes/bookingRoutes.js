const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const path      = require('path');
const Appointment = require('../models/Appointment');
const Patient     = require('../models/Patient');
const patientAuth = require('../middleware/patientAuth');

const storage = multer.diskStorage({
  destination: './public/uploads/reports/',
  filename: (req, file, cb) => {
    cb(null, 'report-' + Date.now() + '-' + Math.round(Math.random()*1e6) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

// Book appointment — 3-step data + unlimited reports
router.post('/book', patientAuth, upload.array('medicalReports'), async (req, res) => {
  try {
    const {
      // Step 1
      name, age, gender, presentAddress, relation, bloodGroup,
      // Step 2
      healthProblem, currentTreatment,
      // Step 3
      doctorId, appointmentType, appointmentDate, timeSlot
    } = req.body;

    if (!healthProblem || !appointmentType || !doctorId) {
      return res.status(400).json({ error: 'Health problem, appointment type and doctor are required' });
    }

    // Find existing patient profile by name, or create new one
    let patient = await Patient.findOne({ mobile: req.mobile, name });
    if (!patient) {
      patient = await Patient.create({
        mobile: req.mobile, name,
        age, gender, relation: relation || 'Self',
        address: presentAddress, bloodGroup
      });
    }

    const medicalReports = (req.files || []).map(f => '/uploads/reports/' + f.filename);

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      presentAddress,
      healthProblem,
      currentTreatment,
      medicalReports,
      appointmentType,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
      timeSlot: timeSlot || '',
      status: 'pending'
    });

    res.json({ message: 'Appointment booked successfully', appointment, patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all doctors list
router.get('/doctors', patientAuth, async (req, res) => {
  try {
    const Doctor = require('../models/Doctor');
    const doctors = await Doctor.find({ isProfileComplete: true })
      .select('firstName lastName medicalDegree profilePhoto');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search nurses by gender
router.get('/nurses', patientAuth, async (req, res) => {
  try {
    const Nurse = require('../models/Nurse');
    const { gender } = req.query;
    const filter = { isAvailable: true };
    if (gender && gender !== 'Any') filter.gender = gender;
    const nurses = await Nurse.find(filter);
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book nurse visit
router.post('/book-nurse', patientAuth, async (req, res) => {
  try {
    const Nurse  = require('../models/Nurse');
    const { name, age, gender, relation, bloodGroup, presentAddress,
            healthProblem, nurseId, timeSlot, nurseGender } = req.body;

    if (!healthProblem || !nurseId || !timeSlot) {
      return res.status(400).json({ error: 'Health problem, nurse and time slot are required' });
    }

    let patient = await Patient.findOne({ mobile: req.mobile, name });
    if (!patient) {
      patient = await Patient.create({
        mobile: req.mobile, name, age, gender,
        relation: relation || 'Self', address: presentAddress, bloodGroup
      });
    }

    const appointment = await Appointment.create({
      patientId:       patient._id,
      nurseId,
      presentAddress,
      healthProblem,
      appointmentType: 'nurse_visit',
      appointmentDate: new Date(),
      timeSlot,
      status: 'pending'
    });

    res.json({ message: 'Nurse visit booked successfully', appointment, patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
