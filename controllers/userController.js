const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isoDateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w]).{8,}$/;
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);
exports.signup = async (req, res, next) => {
  const { email, password, dateOfBirth, firstName, lastName } = req.body;
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    return next(error);
  }
  if (!passwordRegex.test(password)) {
    const error = new Error(
      "Password must be at least 8 characters and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
    );
    error.status = 400;
    return next(error);
  }
  try {
    const emailExist = await userModel.findOne({ email });
    if (emailExist) {
      const error = new Error("email exist please login");
      error.status = 400;
      return next(error);
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    const user = await userModel.create({
      email,
      password: hashPassword,
      dateOfBirth: new Date(dateOfBirth),
      firstName,
      lastName,
    });
    return res.status(201).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    next(error);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      return next(error);
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = new Error("user doesnt exist please signup");
      error.status = 404;
      return next(error);
    }
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      const error = new Error("Please provide a valid password");
      error.status = 401;
      return next(error);
    }
    const token = jwt.sign(
      { id: user.id, admin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60,
      secure: true,
      httpOnly: true,
    });
    return res.status(200).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    next(error);
  }
};
exports.deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({ message: "userprofile deleted" });
  } catch (error) {
    next(error);
  }
};
exports.updateprofile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const acceptedField = ["firstName", "lastName", "dateOfBirth"];
    const updates = {};
    for (const key of acceptedField) {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        updates[key] = req.body[key];
      }
    }
    const user = await userModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
exports.getprofile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
exports.forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    const error = new Error("Email not found please signup");
    error.status = 404;
    return next(error);
  }
  const token = jwt.sign({ id: user.id }, process.env.forgetpassword_secret, {
    expiresIn: "2m",
  });
  try {
    await transporter.sendMail({
      from: "horneyposh@gmail.com",
      to: email,
      subject: "Password reset",
      html: `
    <h1> Please click on the given link to reset your password</h1>
    <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
    `,
    });
    user.resetPasswordLink = token;
    await user.save();
    return res.status(200).json({ message: "Link sent to your email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "We couldn't send the reset email. Please try again later.",
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const payload = jwt.verify(token, process.env.forgetpassword_secret);
    const user = await userModel.findOne({ resetPasswordLink: token });
    if (!user) {
      const error = new Error("user not found");
      error.status = 404;
      return next(error);
    }
    if (!passwordRegex.test(password)) {
      const error = new Error(
        "Password must be at least 8 characters and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
      );
      error.status = 400;
      return next(error);
    }
    const newPassword = bcrypt.hashSync(password, 10);
    user.password = newPassword;
    user.resetPasswordLink = "";
    await user.save();
    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    next(error);
  }
};
