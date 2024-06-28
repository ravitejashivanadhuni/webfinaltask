const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const User = require('../models/user');
const Message = require('../models/message');

// View all appointments
router.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('user').populate('doctor');
        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Set appointment status
router.patch('/api/appointments/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// View all doctors
router.get('/api/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' });
        res.json(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// View all messages
router.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().populate('user');
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
