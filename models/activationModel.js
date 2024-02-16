const mongoose = require('mongoose');

// Define the Activation schema
const activationSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        name: String,
        email: String,
        password: String,
        isInstructor: Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Automatically remove the document after 1 hour (optional)
    }
});

// Create the Activation model
const Activation = mongoose.model('Activation', activationSchema);

module.exports = Activation;
