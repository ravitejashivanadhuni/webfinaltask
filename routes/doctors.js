// routes/doctors.js
const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');

// Add a Doctor
router.post('/add', async (req, res) => {
    const { name, specialty } = req.body;

    // Check for missing fields
    if (!name || !specialty) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const doctor = new Doctor({ name, specialty });
        await doctor.save();
        res.status(201).json({ success: true, message: 'Doctor added successfully' });
    } catch (error) {
        console.error('Doctor addition error:', error);
        res.status(500).json({ message: 'Failed to add doctor. Please try again.' });
    }
});

// View All Doctors
router.get('/all', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Failed to fetch doctors. Please try again.' });
    }
});

module.exports = router;
