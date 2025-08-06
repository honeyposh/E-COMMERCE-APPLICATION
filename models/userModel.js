const mongoose = require("mongoose");
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    firstName: {
      type: String,
      required: [true, "Firstname is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Lastname is required"],
      trim: true,
    },
    dateOfBirth: {
      required: [true, "Date of birth is required"],
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
