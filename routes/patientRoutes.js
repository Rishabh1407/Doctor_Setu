const express = require('express');
const router  = express.Router();
const Appointment = require('../models/Appointment');
const Message     = require('../models/Message');
const Patient     = require('../models/Patient');
const patientAuth = require('../middleware/patientAuth');

// Get all appointments for all patients under this mobile
router.get('/appointments', patientAuth, async (req, res) => {
  try {
    const patients = await Patient.find({ mobile: req.mobile }).select('_id');
    const ids = patients.map(p => p._id);

    const appointments = await Appointment.find({ patientId: { $in: ids } })
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages for all patients under this mobile
router.get('/messages', patientAuth, async (req, res) => {
  try {
    const patients = await Patient.find({ mobile: req.mobile }).select('_id');
    const ids = patients.map(p => p._id);

    const messages = await Message.find({ patientId: { $in: ids } })
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
