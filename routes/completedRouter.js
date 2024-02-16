var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware } = require('../middlewares')
var User = require('../models/userModel')
var jwt = require('jsonwebtoken')
require('dotenv').config()

router.get('/', verifyTokenMiddleware, async (req, res) => {
    try {
        // Get the user ID from the decoded JWT token
        const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Find the user by their ID and populate the 'coursesOngoing' field
        const user = await User.findById(userId).populate('coursesCompleted');

        // Extract the enrolled courses from the user object
        const completedCourses = user.coursesCompleted;

        // Render the 'enrolled.ejs' view with the enrolled courses
        res.render('completed', { completed: completedCourses, isInstructor: req.user.isInstructor });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', verifyTokenMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;
        // Get the user ID from the decoded JWT token
        const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Remove the course from coursesOngoing and add it to coursesCompleted
        await User.findByIdAndUpdate(userId, {
            $pull: { coursesOngoing: courseId },
            $addToSet: { coursesCompleted: courseId }
        });

        // Redirect to the completed page
        res.redirect('/completed');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;