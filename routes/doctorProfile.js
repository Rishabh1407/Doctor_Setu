const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, 'doctor-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctorId).select('-otp -otpExpiry');
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/profile', authMiddleware, upload.single('profilePhoto'), async (req, res) => {
  try {
    const { firstName, lastName, age, gender, medicalDegree, yearOfCompletion, permanentAddress, presentAddress } = req.body;
    
    const updateData = {
      firstName,
      lastName,
      age,
      gender,
      medicalDegree,
      yearOfCompletion,
      permanentAddress,
      presentAddress,
      isProfileComplete: true
    };

    if (req.file) {
      updateData.profilePhoto = '/uploads/' + req.file.filename;
    }

    const doctor = await Doctor.findByIdAndUpdate(req.doctorId, updateData, { new: true });
    
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
