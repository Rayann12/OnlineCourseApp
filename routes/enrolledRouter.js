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

router.post('/enroll', verifyTokenMiddleware, async (req, res) => {
    console.log(req.body);

    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const courseId = req.body.courseId;

    const userMain = await User.findById(userId);
    const courseDetails=await Course.findById(courseId);

    const verb="registered";

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

    var statement= createStatement({actor:userMain,verb:verb,object:courseDetails,context:contextData});

    console.log(statement);
    // process.exit;

    var status=sendStatement(statement,req.cookies.xAPItoken);
    console.log(status);

    res.json({ message: "Enrolled Successfully" });
})

module.exports = router;