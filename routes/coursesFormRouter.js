var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware, checkInstructor } = require('../middlewares')
var Course = require('../models/coursesModel')
var User = require('../models/userModel')
var jwt = require('jsonwebtoken')
require('dotenv').config()

router.get('/', verifyTokenMiddleware, checkInstructor, (req, res) => {
    res.render('coursesForm', { isInstructor: req.user.isInstructor, course: false })
})

router.post('/', verifyTokenMiddleware, checkInstructor, async (req, res, next) => {
    console.log("Reached")
    try {
        // Extract the user ID from the JWT token
        const token = req.cookies.access_token;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        // Find the user
        let instructorOb = await User.findOne({ _id: userId })

        // Create a new course data object
        console.log(req.body.sections)
        const courseData = {
            title: req.body.title,
            description: req.body.description,
            sections: req.body.sections,
            cost: req.body.cost,
            instructor: instructorOb.name
        };
        if (req.body.id) {
            // Update the course or insert a new one if it doesn't exist
            var updatedCourse = await Course.findOneAndUpdate(
                { _id: req.body.id }, // Find course by ID
                courseData, // Update with new data
                { upsert: true, new: true } // Create new course if it doesn't exist, and return the updated document
            );
        }
        // If the course didn't exist and was created, update the user's courses array
        else {
            var updatedCourse = new Course(courseData);
            const user = await User.findById(userId);
            user.courses.push(updatedCourse._id);
            await user.save();
            await updatedCourse.save();
        }

        res.status(201).send({ message: 'Course created/updated successfully', course: updatedCourse });
    } catch (error) {
        console.error("Error: ", error)
        res.status(500).send({ message: "Failed" });
    }
});

router.get('/:id', verifyTokenMiddleware, checkInstructor, async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    res.render('coursesForm', { course: course, isInstructor: req.user.isInstructor })
});

module.exports = router;