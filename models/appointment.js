const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    // add more fields as necessary
});

module.exports = mongoose.model('Appointment', appointmentSchema);
