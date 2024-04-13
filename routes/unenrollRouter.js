var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware, checkInstructor } = require('../middlewares')
var Course = require('../models/coursesModel')
var User = require('../models/userModel')
var jwt = require('jsonwebtoken')
require('dotenv').config()
var {createStatement}=require('../xAPI/StatementCreation.js')
var {sendStatement}=require('../xAPI/StatementSending.js')

router.post('/', verifyTokenMiddleware, async (req,res)=>{
    try{
        const tocken=req.cookies.access_token;
        const decoded=jwt.verify(tocken,process.env.JWT_SECRET);
        const userId=decoded.userId;

        let user=await User.findById(userId);
        let courseId=req.body.courseId;
        let course=await Course.findById(courseId);
        let verb="unenrolled";
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
                    'en-US': 'A Category of course is used for '+course.title
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
        var statement=createStatement({actor:user,verb:verb,object:course,context:contextData});

        var status=sendStatement(statement);

        res.json({status:"Success"});
    }catch(err){
        console.log(err);
    }
})

module.exports=router;