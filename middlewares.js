const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel.js');
const bcrypt = require('bcrypt');
const Activation = require('./models/activationModel.js')
require('dotenv').config()
const nodemailer = require('nodemailer')
const transporter = require('./transporter')

const generateToken = (user, remember) => {
    const expiresIn = remember ? undefined : '3h'; // Set to undefined for indefinite expiration or '3h' for 3 hours
    return jwt.sign({ userId: user._id, email: user.email, isInstructor: user.isInstructor }, process.env.JWT_SECRET, { expiresIn });
};


// Authentication Middleware with JWT
const authenticateMiddleware = async (req, res, next) => {
    console.log("Logging in")
    const { email, password, remember, asInstructor } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        console.log(user)
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(password, user.password)
        console.log("passwordMatch", passwordMatch)
        if (!passwordMatch) {
            return res.status(403).json({ message: 'Invalid credentials' });
        }
        console.log("Lets see:  ", asInstructor, user.isInstructor)
        // Generate a JWT token and attach it to the response
        console.log("a, ", asInstructor)
        console.log("b, ", user.isInstructor)
        if (asInstructor && !user.isInstructor) {
            console.log("Helloooodosaodosdoso")
            return res.status(401).json({ message: 'Only instructors can log in as instructors' });
        }
        else {
            const token = generateToken(user, remember);
            req.token = token; // Attach token to the request object for future use

            next(); // Move to the next middleware or route handler
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Middleware to verify JWT token for protected routes
const verifyTokenMiddleware = (req, res, next) => {
    console.log("Checking Token", req.cookies)
    let token = req.cookies.access_token
    if (!token) {
        return res.status(401).json({ message: 'Incorrect Credentials' });
    }
    console.log("here we are")
    token = token.replace(/^Bearer\s+/, "");
    console.log("Token is ")
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Hello")
            return res.status(403).json({ message: 'Forbidden' });
        }
        console.log("Hereeeeeeeesadasdx", user.isInstructor)
        req.user = user;
        req.token = token;
        console.log("jjl")
        next();
    });
};



const registerMiddleware = async (req, res, next) => {
    try {
        const { name, email, password, isInstructor } = req.body;
        console.log(name, email, password, isInstructor);
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const activationToken = Array.from({ length: 20 }, () => Math.random().toString(36)[2]).join('');
        const activation = new Activation({
            token: activationToken,
            user: {
                name,
                email,
                password, // Note: Storing password in plain text is not recommended. Consider hashing it before saving.
                isInstructor
            }
        });

        // Save the activation document to the database
        await activation.save();

        // Send activation email and handle response
        await sendMail(email, activationToken);

        res.status(201).json({ message: 'User registered. Please check your email to activate your account.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};


const checkInstructor = async (req, res, next) => {
    const decryptedToken = jwt.verify(req.token, process.env.JWT_SECRET);
    if (decryptedToken.isInstructor) {
        next()
    }
    else {
        res.render("error", { message: "Only instructors can add a course.", status: 401 })
    }
}

// Function to send activation email
const sendMail = async (email, activationToken) => {
    // Email content
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Activate Your Account',
        html: `
        <p>Dear user,</p>
        <p>Click the following link to activate your account:</p>
        <a href="http://13.201.67.252/activate/${activationToken}">Activate Account</a>
      `
    };

    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Activation email sent successfully.');
    } catch (error) {
        console.error('Error sending activation email:', error);
    }
};

module.exports = { authenticateMiddleware, verifyTokenMiddleware, registerMiddleware, checkInstructor, sendMail };