const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    isInstructor: {
        type: Boolean,
        required: true,
        default: false // Set default value to false
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', unique: true }],
    coursesOngoing: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', unique: true }],
    coursesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', unique: true }]
    // You can add more fields as needed
});

const User = mongoose.model('User', userSchema);

module.exports = User;
