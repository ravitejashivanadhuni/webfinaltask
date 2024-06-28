const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Appointment = require('./models/appointment');
const Message = require('./models/message');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware setup
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy for authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        const isMatch = await user.isValidPassword(password);

        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password' });
        }
    } catch (error) {
        return done(error);
    }
}));

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// MongoDB Connection
const dbURI = require('./config/db').mongoURI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process if the connection fails
    });

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Define your routes here
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// API routes

// Route to book an appointment
app.post('/api/book-appointment', ensureAuthenticated, async (req, res) => {
    const { date, time, patientName } = req.body;
    try {
        const appointment = new Appointment({ date, time, patientName });
        await appointment.save();
        res.status(200).json({ success: true, message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ success: false, message: 'Failed to book appointment' });
    }
});

// Route to send a message (placeholder)
app.post('/api/send-message', ensureAuthenticated, async (req, res) => {
    const { message } = req.body;
    try {
        // Implement logic to save message to database or send it
        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Route to add a doctor (accessible only by admins)
app.post('/api/add-doctor', ensureAuthenticated, async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }

        const newDoctor = new User({ name, email, password, role: 'doctor' });

        newDoctor.password = await bcrypt.hash(password, 10);

        await newDoctor.save();
        res.status(201).json({ success: true, message: 'Doctor added successfully' });
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({ message: 'Failed to add doctor' });
    }
});

// Route to add an admin (accessible only by admins)
app.post('/api/add-admin', ensureAuthenticated, async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const newAdmin = new User({ name, email, password, role: 'admin' });

        newAdmin.password = await bcrypt.hash(password, 10);

        await newAdmin.save();
        res.status(201).json({ success: true, message: 'Admin added successfully' });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ message: 'Failed to add admin' });
    }
});

// Route to get all appointments (accessible by authenticated users)
app.get('/api/appointments', ensureAuthenticated, async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
    }
});

// Route to get all messages (accessible by authenticated users)
app.get('/api/messages', ensureAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({});
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Dashboard route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

// Logout route
app.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed. Please try again.' });
        }
        res.redirect('/login');
    });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
