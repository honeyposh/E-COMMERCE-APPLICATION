const express = require("express");
const {
  createCategory,
  deleteCatgeory,
  getAllCategories,
  updateCategory,
} = require("../controllers/categoryController");
const { authentication } = require("../middleware/authMiddleware");
const route = express.Router();
route.post("/category", authentication, createCategory);
route.put("/category/:categoryId", authentication, updateCategory);
route.delete("/catgegory/:categoryId", authentication, deleteCatgeory);
route.get("/allcategories", getAllCategories);
module.exports = route;
