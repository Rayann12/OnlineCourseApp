var express = require('express');
var router = express.Router();
var { registerMiddleware } = require('../middlewares')


router.get('/', function (req, res, next) {
    console.log("Hello")
    res.render('register', { title: 'Express' });
});

router.post('/', registerMiddleware, function (req, res, next) {
    console.log("Here we arejsakjdsa")
    res.send({ message: "Registration Link Sent" })
});

module.exports = router;