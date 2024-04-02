const moment=require('moment')

function createStatement(actor,verb,object){
console.log("Creating started statement")
// process.exit; 
var time=moment(new Date()).format('YYYY-MM-DDTHH:mm:ssZ');

return {
"timestamp": `"${time}"`,
"actor": {
"objectType": "Agent",
"name": `"${actor.name}"`,
"openid": `https://www.darwinbox.com/view/${actor._id}`
},
"verb": {
"id": "http://adlnet.gov/expapi/verbs/started",
"display": {
"en-US": "sent"
}
},
"context": {
"contextActivities": {
"category": [
{
"id": "http://adlnet.gov/expapi/activities/module",
"objectType": "Activity"
},
{
"id": "http://adlnet.gov/expapi/activities/abcd",
"objectType": "Activity"
}
]
}
},
"object": {
"definition": {
"name": {
"en-US": "Course1"
},
"description": {
"en-US": "A simple Experience API statement. Note that the LRS does not need to have any prior information about the Actor (learner), the verb, or the Activity/object."
}
},
"id": "http://example.com/xapi/activity/Course1"
}
}
}

// exports.createStatement = createStatement;
module.exports={
createStatement
}