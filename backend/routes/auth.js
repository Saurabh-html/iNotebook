const express = require('express');
const User = require('../models/User')
const router = express.Router()
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET;


const transporter = nodemailer.createTransport({
  service: 'gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
        otp
      });
    }

    // SEND PROFESSIONAL EMAIL
    await transporter.sendMail({

      from: `"iNotebook Security" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Verify your iNotebook account",

      html: `
      <div style="
        font-family: Arial, sans-serif;
        background: #f4f7fb;
        padding: 40px;
      ">

        <div style="
          max-width: 500px;
          margin: auto;
          background: white;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        ">

          <div style="
            background: linear-gradient(135deg,#4f46e5,#7c3aed);
            padding: 30px;
            text-align: center;
            color: white;
          ">

            <h1 style="margin:0;">iNotebook</h1>

            <p style="margin-top:10px;">
              Secure Email Verification
            </p>

          </div>

          <div style="padding:35px;">

            <h2>Hello 👋</h2>

            <p>
              Thank you for creating your iNotebook account.
            </p>

            <p>
              Please use the OTP below to verify your email address:
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
              This OTP will expire in <b>5 minutes</b>.
            </p>

            <p>
              If you did not request this, you can safely ignore this email.
            </p>

          </div>

        </div>

      </div>
      `
    });

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
        const data={
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success, authtoken})
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
        const data={
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authtoken})
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

// ROUTE 4: Forgot Password
router.post('/forgotpassword', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        user.password = secPass;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 5: Update Password (Logged in user)
router.post('/updatepassword', fetchuser, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        let user = await User.findById(req.user.id);

        // Compare old password
        const passwordCompare = await bcrypt.compare(oldPassword, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success: false, error: "Incorrect current password" });
        }

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

module.exports = router;