var express = require('express');
var router = express.Router();
var { authenticateMiddleware } = require('../middlewares')
require('dotenv').config()

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', { title: 'Express' });
});

router.post('/', authenticateMiddleware, async function (req, res, next) {
    const token = req.token
    console.log(`This is theeeee ${token}`)
    res.cookie("access_token", token, { secure: false, httpOnly: false })
    const response = await fetch('http://demo.darwinboxlocal.com/xAPI/oauth/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'clientId': process.env.CLIENT_ID,
                'clientSecret': process.env.CLIENT_SECRET
            })
        });
        const data = await response.json();
        res.cookie("xAPItoken", data.access_token, { secure: false, httpOnly: false })
        console.log("response is : ", data);
    // const data = await response.json();
    // console.log("respone is :  ", data);
    res.send({ message: "okay" })
})

module.exports = router;