var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware } = require('../middlewares')
var User = require('../models/userModel')
var Course = require('../models/coursesModel')
var jwt = require('jsonwebtoken')
require('dotenv').config()
var {createStatement}=require('../xAPI/StatementCreation.js')
var {sendStatement}=require('../xAPI/StatementSending.js')

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

        const user = await User.findById(userId);
        const courseDetails=await Course.findById(courseId);

        const verb="completed";
        const contextData={
            'contextActivities': {
            'category':[
              {
                'id':'http://adlnet.gov/expapi/activities/course',
                'objectType':'Activity',
                'definition':{
                  'name':{
                    'en-US': 'Course',
                  },
                  'description':{
                    'en-US': 'A Category of course is used for '+courseDetails.title
                  }
                }
              },
              {
                'id':'http://adlnet.gov/expapi/activities/abcd',
                'objectType':'Activity'
              }
            ]
          }
          }

        var statement= createStatement({actor:user,verb:verb,object:courseDetails,context:contextData});

        console.log(statement);

        var status=sendStatement(statement,req.cookies.xAPItoken);
        console.log("Done");

        // Redirect to the completed page
        res.redirect('/completed');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;