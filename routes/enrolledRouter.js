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
        const user = await User.findById(userId).populate('coursesOngoing');

        // Extract the enrolled courses from the user object
        const enrolledCourses = user.coursesOngoing;

        // Render the 'enrolled.ejs' view with the enrolled courses
        res.render('enrolled', { enrolled: enrolledCourses, isInstructor: req.user.isInstructor });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;