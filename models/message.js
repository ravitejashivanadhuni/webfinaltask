// models/Message.js

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true  // 'from' field is required
    },
    content: {
        type: String,
        required: true  // 'content' field is required
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
