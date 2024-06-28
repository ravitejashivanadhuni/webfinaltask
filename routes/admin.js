const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const User = require('../models/user');
const Doctor = require('../models/doctor');
const Admin = require('../models/admin');
const Message = require('../models/message');

// View all appointments
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// View all doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// View all messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a doctor
router.post('/add-doctor', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newDoctor = new Doctor({ name, email, password });
        await newDoctor.save();
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add an admin
router.post('/add-admin', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newAdmin = new Admin({ name, email, password });
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
