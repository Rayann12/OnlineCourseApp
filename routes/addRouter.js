var express = require("express");
var router = express.Router();
var { verifyTokenMiddleware } = require("../middlewares");
var User = require("../models/userModel");
var Course = require("../models/coursesModel");
var jwt = require("jsonwebtoken");
require("dotenv").config();
var { createStatement } = require("../xAPI/StatementCreation.js");
var { sendStatement } = require("../xAPI/StatementSending.js");

router.post("/", verifyTokenMiddleware, async (req, res) => {
  try {
    // Get the user ID from the decoded JWT token
    const token=req.cookies.access_token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const courseId = req.body.id;

    let user=await User.findById(userId);
    let course=await Course.findById(courseId);

    let contextData={
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
                'en-US': 'A Category of course is used for '+course.title
              }
            }
          }
        ]
      }
      }
    let statement=createStatement({actor:user,verb:"added",object:course,context:contextData});
    console.log(statement);
    let status = sendStatement(statement,req.cookies.xAPItoken);

    res.json({status:"Done"});
  } catch (error) {
    console.error(error);
    // res.status(500).send("Server Error");
  }
});
module.exports = router;
