const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  gender:       { type: String, enum: ['Male', 'Female'], required: true },
  mobile:       { type: String },
  experience:   { type: Number, default: 0 },   // years
  speciality:   { type: String, default: 'General Nursing' },
  photo:        { type: String },
  isAvailable:  { type: Boolean, default: true },
  availableSlots: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Nurse', nurseSchema);
