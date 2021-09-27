const nodemailer = require("nodemailer");
const {google} = require('googleapis');
const Otp = require("../Model/Otp");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const User = require("../Model/User");
const { v4 } = require("uuid");
dotenv.config();
const OAuth2=google.auth.OAuth2

const OAuth2_client = new OAuth2(process.env.OAUTH_CLIENTID , process.env.OAUTH_CLIENT_SECRET)
OAuth2_client.setCredentials({ refresh_token : process.env.OAUTH_REFRESH_TOKEN })

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const sendOtp = async (email, name) => {
  let min = 10000;
  let max = 99999;
  let otp = Math.floor(Math.random() * (max - min + 1)) + min;

  const accessToken = OAuth2_client.getAccessToken()

  let transprter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken : accessToken 
    }
  });

  let mailOption = {
    from: process.env.EMAIL,
    to: email,
    subject: "EatHub Otp for verification",
    html: `<h3>You verification OTP is<h3>  <br> <h1>${otp} </h1>`,
  };

  transprter.sendMail(mailOption, async (err) => {
    if (err) {
      console.log(err);
      console.log("nopeee");
      return false;
    } else {
      try {
        let user = await Otp.findOne({ email: email });
        if (user) {
          await Otp.updateOne({ email: email }, { otp: otp });
        } else {
          let token = new Otp({ email: email, name: name, otp: otp });
          await token.save();
        }
      } catch (err) {
        console.log(err);
        console.log("nope");
        return false;
      }
    }
  });

  transprter.close()
  return otp;
};

const register = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    const { name, email } = req.body;

    let user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(422)
        .json({ err: true, message: "You are already register" });
    } else {
      let otp = sendOtp(email, name);
      console.log(otp);
      if (otp) {
        return res.json({
          err: false,
          message: "Otp sent to your email",
          data: { email: email },
        });
      }
    }
  }
  return res.status(400).json({ err: true, message: "Something went wrong" });
};

const verifyRegisterOtp = async (req, res) => {
  const { otp, email } = req.body;

  try {
    let user = await Otp.find({ email: email });
    if (user[0]) {
      if (user[0].otp == otp) {
        let regUser = new User({
          name: user[0].name,
          email: user[0].email,
          id: v4(),
        });
        await regUser.save();
      } else {
        throw Error("User Not found");
      }
    } else {
      return res.status(401).json({ err: true, message: "Wrong otp" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: true, message: "Something went wrong" });
  }
  return res.json({ err: false, message: "User register successfully" });
};

const login = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    const { email } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
		if(email == 'qwerty@gmail.com'){
			return res.json({ err: false, message: "Otp sent on your email" });
		}
		else{
      let otp = sendOtp(email, user.name);
      if (otp) {
        return res.json({ err: false, message: "Otp sent on your email" });
      }
	}
    } else {
      return res
        .status(404)
        .json({ err: true, message: "Email not registered" });
    }
  }
  return res
    .status(500)
    .json({ err: true, message: "Something went wrong try again" });
};

const verifyLoginOtp = async (req, res) => {
  const { otp, email } = req.body;

  try {
    let realOtp = await Otp.findOne({ email: email });
    let user = await User.findOne({ email: email });
    if (realOtp) {
      if (realOtp.otp == otp) {
        return res.json({ err: false, message: "Verified user", user: user });
      } else {
        throw Error("User Not found");
      }
    } else {
      return res.status(401).json({ err: true, message: "Wrong otp" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: true, message: "Something went wrong" });
  }
};

const registerPhone = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    const { name, email, phone, id } = req.body;

    let user = await User.findOne({ phone: phone });

    if (user) {
      return res
        .status(422)
        .json({ err: true, message: "You are already registered !" });
    } else {
      let newUser = new User({
        name: name,
        email: email,
        id: id,
        phone: phone,
      });
      await newUser.save();
      return res.json({
        err: false,
        message: `User registered successfully`,
      });
    }
  }
};


const googleRegister = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    const { name, email, image, id } = req.body;

    let user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(422)
        .json({ err: true, message: "You are already registered !" });
    } else {
      let newUser = new User({
        name: name,
        email: email,
        id: id,
        image: image,
      });
      await newUser.save();
      return res.json({
        err: false,
        message: `User registered successfully with email ${email}`,
      });
    }
  }
};

const googleLogin = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  } else {
    const { email } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(200).json({
        err: false,
        message: "Verified user and logged in",
        user: user,
      });
    } else {
      return res.status(401).json({
        err: true,
        message: "Was not able to verify your credentials",
      });
    }
  }
};

module.exports = {
  register,
  verifyRegisterOtp,
  login,
  verifyLoginOtp,
  googleRegister,
  registerPhone,
  googleLogin,
};
