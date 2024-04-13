var express = require("express");
var router = express.Router();
var { verifyTokenMiddleware } = require("../middlewares.js");
var User = require("../models/userModel.js");
var Course = require("../models/coursesModel.js");
var jwt = require("jsonwebtoken");
require("dotenv").config();
var { createStatement } = require("../xAPI/StatementCreation.js");
var { sendStatement } = require("../xAPI/StatementSending.js");
 
router.post("/", verifyTokenMiddleware, async (req, res) => {
  try {
    // Get the user ID from the decoded JWT token
    const token = req.cookies.access_token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const courseId = req.body.id;
    console.log(courseId);
    let user = await User.findById(userId);
    let course = await Course.findById(courseId);
    console.log("Here11")
    console.log(course);
    let contextData = {
      contextActivities: {
        category: [
          {
            id: "http://adlnet.gov/expapi/activities/course",
            objectType: "Activity",
            definition: {
              name: {
                "en-US": "Course",
              },
              description: {
                "en-US": "A Category of course is used for " + course.title,
              },
            },
          },
        ],
      },
    };
    let statement = createStatement({
      actor: user,
      verb: "deleted",
      object: course,
      context: contextData,
    });
    console.log(statement);
    let status = sendStatement(statement);
 
    res.json({ status: "Success" });
  } catch (error) {
    console.error(error);
    // res.status(500).send("Server Error");
  }
});
 
module.exports = router;