var express = require('express');
var router = express.Router();
var { verifyTokenMiddleware } = require('../middlewares')
// var Course = require('../models/coursesModel')
var User = require('../models/userModel')
var Activation = require('../models/activationModel')
var jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
require('dotenv').config()

var Razorpay = require("razorpay")

// This razorpayInstance will be used to 
// access any resource from razorpay 
const razorpayInstance = new Razorpay({ 
  
  // Replace with your key_id 
  key_id: process.env.KEY_ID, 

  // Replace with your key_secret 
  key_secret: process.env.KEY_SECRET
}); 

router.get('/', (req, res) => {
  res.redirect('/login')
})

router.get('/index', verifyTokenMiddleware, function (req, res, next) {
  res.render('index', { title: 'Express', isInstructor: req.user.isInstructor });
});


router.get('/logout', function (req, res, next) {
  res.clearCookie('access_token')
  res.redirect('/login')
})

router.get('/myCourses', verifyTokenMiddleware, async (req, res) => {
  try {
    // Get the user ID from the decoded JWT token
    const decodedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Find the user by their ID and populate the 'coursesOngoing' field
    const user = await User.findById(userId).populate('courses');

    // Extract the enrolled courses from the user object
    const myCourses = user.courses;
    console.log(myCourses)
    // Render the 'enrolled.ejs' view with the enrolled courses
    res.render('myCourses', { myCourses: myCourses, isInstructor: req.user.isInstructor });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/activate/:activationToken', async (req, res) => {
  try {
    const activationToken = req.params.activationToken;

    // Find the activation document
    const activation = await Activation.findOne({ token: activationToken });

    if (!activation) {
      return res.status(404).json({ message: 'Activation token not found' });
    }

    // Create a new user
    let user = await User.findOne({ email: activation.user.email })
    if (!user) {
      user = new User({
        name: activation.user.name,
        email: activation.user.email,
        password: await bcrypt.hash(activation.user.password, 10),
        isInstructor: activation.user.isInstructor
      });

      await user.save();
    }
    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the JWT token as a cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10800000 // 1 hour in milliseconds
    });

    res.redirect('/index'); // Redirect to dashboard or any other page
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//Inside app.js 
router.post('/createOrder', (req, res)=>{ 

	// STEP 1: 
	const {amount,currency,receipt, notes} = req.body;	 
		
	// STEP 2:	 
	razorpayInstance.orders.create({amount, currency, receipt, notes}, 
		(err, order)=>{ 
		
		//STEP 3 & 4: 
		if(!err) 
			res.json(order) 
		else
			res.send(err); 
		} 
	) 
}); 

//Inside app.js 
router.post('/verifyOrder', (req, res)=>{ 
	
	// STEP 7: Receive Payment Data 
	const {order_id, payment_id} = req.body;	 
	const razorpay_signature = req.headers['x-razorpay-signature']; 

	// Pass yours key_secret here 
	const key_secret = YAEUthsup8SijNs3iveeVlL1;	 

	// STEP 8: Verification & Send Response to User 
	
	// Creating hmac object 
	let hmac = crypto.createHmac('sha256', key_secret); 

	// Passing the data to be hashed 
	hmac.update(order_id + "|" + payment_id); 
	
	// Creating the hmac in the required format 
	const generated_signature = hmac.digest('hex'); 
	
	
	if(razorpay_signature===generated_signature){ 
		res.json({success:true, message:"Payment has been verified"}) 
	} 
	else
	res.json({success:false, message:"Payment verification failed"}) 
});

coursesRouter = require('./coursesRouter')
coursesFormRouter = require('./coursesFormRouter')
completedRouter = require('./completedRouter')
enrolledRouter = require('./enrolledRouter')
loginRouter = require('./loginRouter')
registerRouter = require('./registerRouter')
viewedRouter=require('./viewedRouter')
unenrolledRouter=require('./unenrollRouter');
addRouter = require('./addRouter')

router.use('/courses', coursesRouter)
router.use('/coursesForm', coursesFormRouter);
router.use('/completed', completedRouter);
router.use('/enrolled', enrolledRouter);
router.use('/login', loginRouter);
router.use('/register', registerRouter);
router.use('/viewed', viewedRouter);
router.use('/unenrolled', unenrolledRouter);
router.use('/add', addRouter);

module.exports = router;
