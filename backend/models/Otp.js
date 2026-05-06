const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    attempts: {
        type: Number,
        default: 1
    },

    blockedUntil: {
        type: Date,
        default: null
    },

    createdAt: {

        type: Date,

        default: Date.now,

        expires: 300
    }
});

module.exports = mongoose.model('otp', OtpSchema);