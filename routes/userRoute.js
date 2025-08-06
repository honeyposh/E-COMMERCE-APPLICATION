const express = require("express");
const {
  signup,
  login,
  logout,
  deleteProfile,
  updateprofile,
  getprofile,
} = require("../controllers/userController");
const { authentication } = require("../middleware/authMiddleware");
const { validatedob } = require("../middleware/validateDateOfBirth");
const route = express.Router();
route.post("/signup", validatedob, signup);
route.post("/login", login);
route.post("/logout", logout);
route.delete("/profile", authentication, deleteProfile);
route.put("/profile", authentication, validatedob, updateprofile);
route.get("/profile", authentication, getprofile);
module.exports = route;
