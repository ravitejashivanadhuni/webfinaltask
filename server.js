const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Added for generating reset tokens
const nodemailer = require('nodemailer'); // Added for sending emails
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

// Forgot Password Functionality

// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'shivanadhuniraviteja@gmail.com', // Replace with your email
        pass: 'sdpa kkkl bkva glng'         // Replace with your email password or an app-specific password
    }
});

// Route to handle forgot password
app.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'No user with that email address' });
        }

        // Generate a reset token and hash it before saving
        const resetToken = crypto.randomBytes(20).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = resetPasswordExpires;

        await user.save();

        // Send reset email
        const resetURL = `http://${req.headers.host}/auth/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: 'shivanadhuniraviteja@gmail.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${resetURL}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('Error sending reset email:', err);
                return res.status(500).json({ message: 'Failed to send reset email' });
            }

            res.status(200).json({ message: 'Password reset email sent successfully' });
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Route to render reset password page
app.get('/auth/reset-password/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        res.sendFile(path.join(__dirname, '..', 'reset-password.html')); // Assuming you have a reset-password.html file
    } catch (error) {
        console.error('Error rendering reset password page:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Route to handle password reset
app.post('/auth/reset-password/:token', async (req, res) => {
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// API routes

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

// Route to remove a doctor (accessible only by admins)
app.delete('/api/doctors', ensureAuthenticated, async (req, res) => {
    const { email } = req.body;

    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const result = await User.deleteOne({ email, role: 'doctor' });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ success: true, message: 'Doctor removed successfully' });
    } catch (error) {
        console.error('Error removing doctor:', error);
        res.status(500).json({ message: 'Failed to remove doctor' });
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

// Route to remove an admin (accessible only by admins)
app.delete('/api/admins', ensureAuthenticated, async (req, res) => {
    const { email } = req.body;

    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        const result = await User.deleteOne({ email, role: 'admin' });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ success: true, message: 'Admin removed successfully' });
    } catch (error) {
        console.error('Error removing admin:', error);
        res.status(500).json({ message: 'Failed to remove admin' });
    }
});

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

// Route to send a message
app.post('/api/send-message', ensureAuthenticated, async (req, res) => {
    const { recipient, content } = req.body;

    // Ensure sender is obtained from the logged-in user
    const sender = req.user._id;

    if (!recipient || !content) {
        return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }

    try {
        const newMessage = new Message({ sender, recipient, content });
        const savedMessage = await newMessage.save();
        res.status(201).json({ success: true, message: 'Message sent successfully', data: savedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
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

// Route to accept an appointment (accessible by authenticated users)
app.patch('/api/appointments/:id/accept', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = 'Accepted';
        await appointment.save();
        res.status(200).json({ success: true, message: 'Appointment accepted' });
    } catch (error) {
        console.error('Error accepting appointment:', error);
        res.status(500).json({ message: 'Failed to accept appointment' });
    }
});

// Route to reject an appointment (accessible by authenticated users)
app.patch('/api/appointments/:id/reject', ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = 'Rejected';
        await appointment.save();
        res.status(200).json({ success: true, message: 'Appointment rejected' });
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        res.status(500).json({ message: 'Failed to reject appointment' });
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
const port = process.env.PORT || 7999;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
