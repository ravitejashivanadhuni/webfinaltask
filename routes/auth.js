const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// POST /auth/login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Login failed. Please try again.' });
        }
        if (!user) {
            return res.status(400).json({ message: info.message });
        }
        req.logIn(user, err => {
            if (err) {
                return res.status(500).json({ message: 'Login failed. Please try again.' });
            }
            return res.status(200).json({ success: true, message: 'Login successful' });
        });
    })(req, res, next);
});

// POST register user route
router.post('/register-user', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check for missing fields
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ name, email, password, role });

        newUser.password = await bcrypt.hash(password, 10);

        await newUser.save();
        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
});

// POST register doctor route
router.post('/register-doctor', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check for missing fields
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newDoctor = new User({ name, email, password, role });

        newDoctor.password = await bcrypt.hash(password, 10);

        await newDoctor.save();
        res.status(201).json({ success: true, message: 'Doctor registration successful' });
    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({ message: 'Doctor registration failed. Please try again.' });
    }
});

module.exports = router;
