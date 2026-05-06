const express = require('express');
const User = require('../models/User')
const router = express.Router()
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
// const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const axios = require('axios');
const Otp = require('../models/Otp');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


// Token Generator
const generateAccessToken = (user) => {

    return jwt.sign(
        {
            user: {
                id: user.id
            }
        },

        ACCESS_TOKEN_SECRET,

        {
            expiresIn: '15m'
        }
    );
};

const generateRefreshToken = (user) => {

    return jwt.sign(
        {
            user: {
                id: user.id
            }
        },

        REFRESH_TOKEN_SECRET,

        {
            expiresIn: '7d'
        }
    );
};

router.post('/sendotp', async (req, res) => {

  try {

    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
            return res.json({
                success: false,
                message: "Invalid email format"
            });
            }

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered"
      });
    }

    // CHECK OTP LIMIT
    let existingOtp = await Otp.findOne({ email });

    // BLOCK CHECK
    if (
      existingOtp &&
      existingOtp.blockedUntil &&
      new Date(existingOtp.blockedUntil) > new Date()
    ) {

      const minutesLeft = Math.ceil(
        (new Date(existingOtp.blockedUntil) - new Date()) / 60000
      );

      return res.json({
        success: false,
        message: `Too many OTP requests. Try again after ${minutesLeft} minutes`
      });
    }

    // OTP GENERATE
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    // IF EXISTING OTP
    if (existingOtp) {

      // 3 ATTEMPTS LIMIT
      if (existingOtp.attempts >= 3) {

    existingOtp.blockedUntil = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await existingOtp.save();

    return res.json({
      success: false,
      message: "Too many OTP requests. Try again after 30 minutes"
    });

} else {

    existingOtp.attempts += 1;
}

      existingOtp.otp = otp;
      existingOtp.createdAt = new Date();

      await existingOtp.save();

    } else {

      await Otp.create({
    email,
    otp,
    attempts: 1
});

    }

    // SEND PROFESSIONAL EMAIL
    await axios.post(

    'https://api.brevo.com/v3/smtp/email',

    {

        sender: {

            name: 'iNotebook',

            email: process.env.EMAIL_USER
        },

        to: [
            {
                email: email
            }
        ],

        subject: 'Verify Your iNotebook Account',

        htmlContent: `

            <div style="
                font-family: Arial;
                padding: 30px;
            ">

                <h2>Email Verification</h2>

                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>
                    OTP expires in 5 minutes.
                </p>

            </div>
        `
    },

    {

        headers: {

            'accept': 'application/json',

            'api-key': process.env.EMAIL_PASS,

            'content-type': 'application/json'
        }
    }
);

res.json({
    success: true,
    message: "OTP sent successfully"
});

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// SEND OTP FOR PASSWORD UPDATE
router.post('/send-update-otp', fetchuser, async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const email = user.email;

        // GENERATE OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // DELETE OLD OTP
        await Otp.deleteMany({ email });

        // SAVE NEW OTP
        await Otp.create({
    email,
    otp,
    attempts: 1
});

        // SEND EMAIL
        await axios.post(

    'https://api.brevo.com/v3/smtp/email',

    {

        sender: {

            name: 'iNotebook',

            email: process.env.EMAIL_USER
        },

        to: [
            {
                email: email
            }
        ],

        subject: 'Password Update Verification',

        htmlContent: `

            <div style="
                font-family: Arial;
                padding: 30px;
            ">

                <h2>Password Reset</h2>

                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>
                    OTP expires in 5 minutes.
                </p>

            </div>
        `
    },

    {

        headers: {

            'accept': 'application/json',

            'api-key': process.env.EMAIL_PASS,

            'content-type': 'application/json'
        }
    }
);

res.json({
    success: true,
    message: "OTP sent successfully"
});

    } catch (error) {

        console.log(error.message);

        res.status(500).send("Internal Server Error");
    }
});

//ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({min:3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({min:5}),
], async (req, res)=>{
    let success = false;
    //If there are errors return the bad request and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors: errors.array()});
    }
    //Check whether the user with this email exists already
    try{
        const { name, email, password, otp } = req.body;

        let user = await User.findOne({ email });
        if(user){
            return res.status(400).json({success, error: "Sorry a user with this email already exists"})
        }

                    // VERIFY OTP
            const recentOtp = await Otp.findOne({ email });

            if (!recentOtp) {
                return res.status(400).json({
                    success,
                    error: "OTP expired"
                });
            }

            if (recentOtp.otp !== otp) {
                return res.status(400).json({
                    success,
                    error: "Invalid OTP"
                });
            }

            // DELETE OTP AFTER SUCCESS
            await Otp.deleteMany({ email });

        const salt = await bcrypt.genSalt(10);

            const secPass = await bcrypt.hash(password, salt);

            user = await User.create({
                name,
                password: secPass,
                email,
            });
        const accessToken = generateAccessToken(user);

const refreshToken = generateRefreshToken(user);

user.refreshToken = refreshToken;

await user.save();

success = true;

res.json({
    success,
    accessToken,
    refreshToken
});
    } catch (error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res)=>{
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const{email,password} = req.body;
    try{
        let user= await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({success, error: "Please try to login using correct credentials"});
        }
        const passwordCompare= await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, error: "Please try to login using correct credentials"});
        }
        const accessToken = generateAccessToken(user);

const refreshToken = generateRefreshToken(user);

user.refreshToken = refreshToken;

await user.save();

success = true;

res.json({
    success,
    accessToken,
    refreshToken
});
    } catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res)=>{
try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
}
})

// ROUTE: Forgot Password WITH OTP
router.post('/forgotpassword', async (req, res) => {

    const {
        email,
        password,
        otp
    } = req.body;

    try {

        // FIND USER
        let user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({
                success: false,
                error: "Email not found"
            });
        }

        // VERIFY OTP
        const recentOtp = await Otp.findOne({ email });

        if (!recentOtp) {

            return res.status(400).json({
                success: false,
                error: "OTP expired"
            });
        }

        // CHECK OTP MATCH
        if (recentOtp.otp !== otp) {

            return res.status(400).json({
                success: false,
                error: "Invalid OTP"
            });
        }

        // DELETE OTP AFTER SUCCESS
        await Otp.deleteMany({ email });

        // VALIDATE PASSWORD
        if (password.length < 5) {

            return res.status(400).json({
                success: false,
                error: "Password must be at least 5 characters"
            });
        }

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);

        const secPass =
            await bcrypt.hash(password, salt);

        // UPDATE PASSWORD
        user.password = secPass;

        // REMOVE OLD REFRESH TOKEN
        user.refreshToken = null;

        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Update Password (Logged in user)
router.post('/updatepassword', fetchuser, async (req, res) => {
    const { oldPassword, newPassword, otp } = req.body;

    try {
        let user = await User.findById(req.user.id);

        // Compare old password
        const passwordCompare = await bcrypt.compare(oldPassword, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success: false, error: "Incorrect current password" });
        }

        // VERIFY OTP
const recentOtp = await Otp.findOne({ email: user.email });

if (!recentOtp) {
    return res.status(400).json({
        success: false,
        error: "OTP expired"
    });
}

if (recentOtp.otp !== otp) {
    return res.status(400).json({
        success: false,
        error: "Invalid OTP"
    });
}

// DELETE OTP AFTER SUCCESS
await Otp.deleteMany({ email: user.email });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(newPassword, salt);

        user.password = secPass;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// REFRESH ACCESS TOKEN
router.post('/refresh', async (req, res) => {

    const { refreshToken } = req.body;

    if (!refreshToken) {

        return res.status(401).json({
            success: false,
            error: "Refresh token missing"
        });
    }

    try {

        const decoded = jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded.user.id);

        if (
            !user ||
            user.refreshToken !== refreshToken
        ) {

            return res.status(403).json({
                success: false,
                error: "Invalid refresh token"
            });
        }

        const newAccessToken =
            generateAccessToken(user);

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {

        res.status(403).json({
            success: false,
            error: "Refresh token expired"
        });
    }
});

// LOGOUT
router.post('/logout', fetchuser, async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        user.refreshToken = null;

        await user.save();

        res.json({
            success: true
        });

    } catch (error) {

        console.log(error.message);

        res.status(500).send("Internal Server Error");
    }
});

// SEND OTP FOR FORGOT PASSWORD
router.post('/send-forgot-otp', async (req, res) => {

    try {

        console.log("STEP 1");

        const { email } = req.body;

        console.log("EMAIL:", email);

        // CHECK USER
        const user = await User.findOne({ email });

        console.log("STEP 2");

        if (!user) {

            return res.status(400).json({
                success: false,
                message: "Email not registered"
            });
        }

        // GENERATE OTP
        const otp = otpGenerator.generate(6, {

            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        console.log("OTP:", otp);

        // DELETE OLD OTP
        await Otp.deleteMany({ email });

        console.log("STEP 3");

        // SAVE OTP
        await Otp.create({
    email,
    otp,
    attempts: 1
});

        console.log("STEP 4");

        // SEND EMAIL USING BREVO API
        const response = await axios.post(

            'https://api.brevo.com/v3/smtp/email',

            {

                sender: {

                    name: 'iNotebook',

                    email: process.env.EMAIL_USER
                },

                to: [
                    {
                        email: email
                    }
                ],

                subject: 'Reset Password OTP',

                htmlContent: `

                    <div style="
                        font-family: Arial, sans-serif;
                        background: #f4f7fb;
                        padding: 40px;
                    ">

                        <div style="
                            max-width: 500px;
                            margin: auto;
                            background: white;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                        ">

                            <div style="
                                background: linear-gradient(135deg,#4f46e5,#7c3aed);
                                color: white;
                                text-align: center;
                                padding: 30px;
                            ">

                                <h1>iNotebook</h1>

                                <p>Password Reset Verification</p>

                            </div>

                            <div style="padding: 35px;">

                                <h2>Hello 👋</h2>

                                <p>
                                   Use the OTP below to verify your email address.
                                </p>

                                <div style="
                                    text-align:center;
                                    margin:30px 0;
                                ">

                                    <span style="
                                        display:inline-block;
                                        background:#eef2ff;
                                        color:#4f46e5;
                                        padding:16px 28px;
                                        font-size:32px;
                                        font-weight:700;
                                        border-radius:12px;
                                        letter-spacing:8px;
                                    ">
                                        ${otp}
                                    </span>

                                </div>

                                <p>
                                    OTP expires in <b>5 minutes</b>.
                                </p>

                            </div>

                        </div>

                    </div>
                `
            },

            {

                headers: {

                    'accept': 'application/json',

                    'api-key': process.env.EMAIL_PASS,

                    'content-type': 'application/json'
                }
            }
        );

        

        console.log("MAIL SENT");
        console.log(response.data);

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.log("FULL ERROR:");

        if (error.response) {

            console.log(error.response.data);

        } else {

            console.log(error);
        }

        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;