require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const doctorAuthRoutes = require('./routes/doctorAuth');
const doctorProfileRoutes = require('./routes/doctorProfile');
const appointmentRoutes = require('./routes/appointments');
const messageRoutes = require('./routes/messages');
const patientAuthRoutes = require('./routes/patientAuth');
const patientRoutes     = require('./routes/patientRoutes');
const bookingRoutes     = require('./routes/bookingRoutes');

const app = express();

if (!fs.existsSync('./public/uploads')) fs.mkdirSync('./public/uploads', { recursive: true });
if (!fs.existsSync('./public/uploads/reports')) fs.mkdirSync('./public/uploads/reports', { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => res.redirect('/login.html'));

app.use('/api/doctor/auth', doctorAuthRoutes);
app.use('/api/doctor', doctorProfileRoutes);
app.use('/api/doctor', appointmentRoutes);
app.use('/api/doctor', messageRoutes);
app.use('/api/patient/auth', patientAuthRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/patient', bookingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
