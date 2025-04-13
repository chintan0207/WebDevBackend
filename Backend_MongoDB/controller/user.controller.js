import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const registerUser = async (req, res) => {
  // get data
  //validate
  // check if user already exists
  // create a user in database
  //create a verification token
  // save token in database
  // send token as email to user
  // send success status to user

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    await user.save();

    //send mail
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL, // sender address
      to: user.email, // list of receivers
      subject: "Verify your email", // Subject line
      text: `please click on the following link:
    ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    };

    await transporter.sendMail(mailOption);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "User not registered",
      error,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  //get token from url
  //validate
  // find user based on token
  //if not
  // set isVerified field to true
  // remove verification token
  // save
  //return response

  const { token } = req.params;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "User verified",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "User not verified",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are Required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: "User not logged in",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error in get details ${error}`,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {});
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Internal server error`,
    });
  }
};

const forgotPassword = async (req, res) => {
  //get email
  // find user based on email
  // reset token + reset expiry => Date.now() + 10 * 60 * 1000 => user.save()
  // send mail => design url
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    //send mail
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Reset your password",
      text: `please click on the following link:
    ${process.env.BASE_URL}/api/v1/users/resetpassword/${token}`,
    };

    await transporter.sendMail(mailOption);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const resetPassword = async (req, res) => {
  //collect token from params
  // password from req.body
  // set password in user
  // resetToken, resetExpiry => reset
  // save
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "your token is expired",
      });
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  registerUser,
  login,
  verifyUser,
  getMe,
  logoutUser,
  forgotPassword,
  resetPassword,
};
