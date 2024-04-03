const moment=require('moment')

// function createStatement(actor,verb,object,result=null,context=null,attachments=null)
function createStatement(obj)
{
    console.log("Creating started statement")
    // process.exit; 
    var time=moment(new Date()).format('YYYY-MM-DDTHH:mm:ssZ');

    var statement={};
    statement["timestamp"]=time;
    statement["actor"]=addActor(obj.actor);
    statement["verb"]=addVerb(obj.verb);
    statement["object"]=addObject(obj.object);
    if(obj.result){
        statement["result"]=addResult(obj.result);
    }
    if(obj.context){
        statement["context"]=addContext(obj.context);
    }
    if(obj.attachments){
        statement["attachments"]=addAttachments(obj.attachments);
    }

    return statement;

    // return {
    // "timestamp": `"${time}"`,
    // "actor": {
    // "objectType": "Agent",
    // "name": `"${actor.name}"`,
    // "openid": `https://www.darwinbox.com/view/${actor._id}`
    // },
    // "verb": {
    // "id": "http://adlnet.gov/expapi/verbs/started",
    // "display": {
    // "en-US": "sent"
    // }
    // },
    // "context": {
    // "contextActivities": {
    // "category": [
    // {
    // "id": "http://adlnet.gov/expapi/activities/module",
    // "objectType": "Activity"
    // },
    // {
    // "id": "http://adlnet.gov/expapi/activities/abcd",
    // "objectType": "Activity"
    // }
    // ]
    // }
    // },
    // "object": {
    // "definition": {
    // "name": {
    // "en-US": "Course1"
    // },
    // "description": {
    // "en-US": "A simple Experience API statement. Note that the LRS does not need to have any prior information about the Actor (learner), the verb, or the Activity/object."
    // }
    // },
    // "id": "http://example.com/xapi/activity/Course1"
    // }
    // }
}

function addActor(actor){
    var actorObj={}
    actorObj['name']=actor.name;
    actorObj['objectType']='Agent';
    actorObj['openid']=`https://www.darwinbox.com/view/${actor._id}`;
    return actorObj;
}
function addVerb(verb){
    var verbObj={};
    verbObj['id']=`http://adlnet.gov/expapi/verbs/${verb}`;
    verbObj['display']={
        'en-US': verb
    };
    return verbObj;
}
function addObject(object){
    var objectObj = {};
    console.log(object);
    objectObj['definition'] = {
        'name': {
        'en-US':   `${object.title}`
        },
        'description': {
            'en-US': `${object.description}`
        }
    }
    objectObj['id'] = `http://example.com/xapi/activity/${object._id}`
    return objectObj;
}
function addResult(result){}
function addContext(context){
    var contextObj=context;
    return contextObj;
}
function addAttachments(attachments){
    var attachmentsObj = {}

    attachmentsObj=attachments;

    return attachmentsObj;
}

// exports.createStatement = createStatement;
module.exports={
createStatement
}