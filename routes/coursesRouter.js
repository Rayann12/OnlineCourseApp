var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware } = require('../middlewares')
var Course = require('../models/coursesModel')
var User = require('../models/userModel')
var jwt = require('jsonwebtoken')
require('dotenv').config()

// Perform a search using Atlas Search
async function searchCourses(query) {
  try {
    // Perform the search using the Course model
    const searchResults = await Course.aggregate(
      [
        {
          $search: {
            "index": "default",
            "wildcard": {
              "query": `*${query}*`,
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
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    let userId = req.user.userId
    const user = await User.findOne({ _id: userId })
    if (!course) {
      return res.status(404).send('Course not found');
    }

    // Check if the course is present in the user's coursesOngoing array
    const hasCourseOngoing = user.coursesOngoing.some(course => course.equals(courseId));
    if (hasCourseOngoing) {
      res.render('course', { course: course, hasCourseOngoing: hasCourseOngoing, isInstructor: req.user.isInstructor });
    }
    else { res.redirect('/index') }
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
  const query = req.params.query;
  relevantCourses = await searchCourses(query)
  res.render('courses', { courses: relevantCourses, isInstructor: req.user.isInstructor })
})

module.exports = router;