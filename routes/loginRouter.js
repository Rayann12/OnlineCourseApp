var express = require('express');
var router = express.Router();
var { authenticateMiddleware } = require('../middlewares')
require('dotenv').config()

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', { title: 'Express' });
});

router.post('/', authenticateMiddleware, function (req, res, next) {
    const token = req.token
    console.log(`This is theeeee ${token}`)
    res.cookie("access_token", token, { secure: false, httpOnly: false })
    res.send({ message: "okay" })
})

module.exports = router;