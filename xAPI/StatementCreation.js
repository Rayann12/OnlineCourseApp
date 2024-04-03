const moment=require('moment')

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
    if(verb=='unenrolled'){
    verbObj['id']=`http://adlnet.gov/expapi/verbs/${verb}`;
    }else{
        verbObj['id']='http://id.tincanapi.com/verb/unregistered'
    }
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