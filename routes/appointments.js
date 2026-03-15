const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/auth');

router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.doctorId })
      .populate('patientId')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/appointments/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status === 'confirmed') {
      return res.status(400).json({ error: 'Appointment already confirmed' });
    }

    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    appointment.autoConfirmTimer = new Date(Date.now() + 30000);
    await appointment.save();

    setTimeout(async () => {
      const apt = await Appointment.findById(req.params.id);
      if (apt && apt.status === 'confirmed') {
        console.log(`Appointment ${req.params.id} auto-locked after 30 seconds`);
      }
    }, 30000);

    res.json({ message: 'Appointment confirmed', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/appointments/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status === 'confirmed' && appointment.autoConfirmTimer < new Date()) {
      return res.status(400).json({ error: 'Cannot cancel after 30 seconds of confirmation' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/patient/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      patient: appointment.patientId,
      healthProblem: appointment.healthProblem,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
