const mongoose = require('mongoose');

// Define the schema for the Course model
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    sections: [{
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['video', 'text'],
            default: 'text'
        }
    }],
    instructor: { type: String, ref: 'User' },
    cost: {type: Number, required: true}
});

// Create the Course model
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
