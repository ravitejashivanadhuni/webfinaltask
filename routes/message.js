const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// GET all messages
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new message
router.post('/', async (req, res) => {
    const { from, content } = req.body;

    try {
        const newMessage = new Message({ from, content });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
