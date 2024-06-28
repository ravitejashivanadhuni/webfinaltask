const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    specialty: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
