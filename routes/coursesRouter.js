var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware } = require('../middlewares')
var Course = require('../models/coursesModel')
var User = require('../models/userModel')
var jwt = require('jsonwebtoken')
require('dotenv').config()
var {createStatement}=require('../xAPI/StatementCreation.js')
var {sendStatement}=require('../xAPI/StatementSending.js')

// Perform a search using Atlas Search
async function searchCourses(query) {
  console.log("Searching courses")
  try {
    // Perform the search using the Course model
    let start = query.charAt(0);
    let remain = query.slice(1);
    let ustart = start.toUpperCase();
    let lstart = start.toLowerCase();
    let lremain = remain.toLowerCase();
    let uremain = remain.toUpperCase();
    console.log(ustart, lstart, uremain, lremain);
    const searchResults = await Course.aggregate(
      [
        {
          $search: {
            "index": "default",
            "regex": {
              "query": `(.*)((${ustart}|${lstart})(${uremain}|${lremain}))(.*)`,
              "path": ["title", "description"]
            }
          }
        }
      ]
    )

    // Return the search results
    return searchResults;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error; // Handle or rethrow the error as needed
  }
}

// Route for retrieving all courses
router.get('/', verifyTokenMiddleware, async (req, res) => {
  try {
    let courses = await Course.find();
    console.log(courses)
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Find the user by their ID
    const user = await User.findById(userId);
    res.render('courses', { courses: courses, isInstructor: user.isInstructor, key: process.env.KEY_ID, email: user.email, name: user.name, coursesOngoing: user.coursesOngoing ? user.coursesOngoing : [] }); // Render the courses.ejs template with courses data
  }
  catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get('/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    console.log("Here I am")
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    let userId = req.user.userId
    const user = await User.findOne({ _id: userId })
    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Check if the course is present in the user's coursesOngoing array
    const hasCourseOngoing = user.coursesOngoing.some(course => course.equals(courseId));
    const hasCourse = user.courses.some(course => course.equals(courseId));
    const hasCoursesCompleted = user.coursesCompleted.some(course => course.equals(courseId));
    if (hasCourseOngoing || hasCourse || hasCoursesCompleted) {
      res.render('course', { course: course, hasCourseOngoing: hasCourseOngoing, isInstructor: req.user.isInstructor });
    }
    else { res.send('<script>alert("Please buy this course to access it!");</script>'); }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/start/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    // Get the course ID from the request parameters
    const courseId = req.params.id;

    // Get the user ID from the decoded JWT token
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Find the user by their ID
    const user = await User.findById(userId);
    const courseDetails=await Course.findById(courseId);

    const verb="started";

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
    // process.exit;

    var status=sendStatement(statement);
    console.log("Done");

    // Check if the user is already enrolled in the course
    const alreadyEnrolled = user.coursesOngoing.some(course => course.equals(courseId));

    if (alreadyEnrolled) {
      // If the user is already enrolled, you can redirect them to the course page or display a message
      return res.redirect(`/courses/${courseId}`);
    }

    // Check if the course is present in the user's coursesCompleted array
    const courseIndex = user.coursesCompleted.findIndex(course => course.equals(courseId));

    if (courseIndex !== -1) {
      // If the course is found in coursesCompleted, remove it from there
      user.coursesCompleted.splice(courseIndex, 1);
    }

    // Add the course to the user's coursesOngoing array
    user.coursesOngoing.push(courseId);
    await user.save();

    // Redirect the user to the course page
    return res.redirect(`/courses/${courseId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/search/:query', verifyTokenMiddleware, async (req, res, next) => {
  console.log("Hello hnjkjk")
  const query = req.params.query;
  let relevantCourses = await searchCourses(query)
  console.log(relevantCourses, req.user.isInstructor)
  const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
  const userId = decodedToken.userId;

  // Find the user by their ID
  const user = await User.findById(userId);
  res.render('courses', { courses: relevantCourses, isInstructor: user.isInstructor, key: process.env.KEY_ID, email: user.email, name: user.name, coursesOngoing: user.coursesOngoing ? user.coursesOngoing : [] }); // Render the courses.ejs template with courses data
})

router.delete('/delete/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    // Get the course ID from the request parameters
    const courseId = req.params.id; 
    // Get the user ID from the decoded JWT token
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    // Find the user by their ID
    const user = await User.findById(userId);
    // Check if the course is present in courses array
    const courseIndex = user.courses.findIndex(course => course.equals(courseId));
    if (courseIndex!== -1) {
      // If the course is found in courses, remove it from there
      user.courses.splice(courseIndex, 1);
    } 
    // Remove the course from the courses model
    await Course.findByIdAndDelete(courseId);
    // Save the user
    await user.save();
    res.status(200).send('Course deleted successfully');
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
})

module.exports = router;