// routes/users.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const Message = require('../models/message');

// Get User Appointments
router.get('/appointments', async (req, res) => {
    const userId = req.user._id; // Assuming user is authenticated
    try {
        const appointments = await Appointment.find({ user: userId }).populate('doctor');
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).json({ message: 'Failed to fetch user appointments. Please try again.' });
    }
});

// Send Message to Admin or Doctor
router.post('/send-message', async (req, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user._id; // Assuming user is authenticated

    // Check for missing fields
    if (!recipientId || !content) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const message = new Message({ sender: senderId, recipient: recipientId, content });
        await message.save();
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again.' });
    }
});

module.exports = router;
