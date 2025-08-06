const express = require("express");
const {
  createProduct,
  getProduct,
  getProductsByCategory,
} = require("../controllers/productController");
const { authentication } = require("../middleware/authMiddleware");
const route = express.Router();
route.post("/product", authentication, createProduct);
route.get("/product/:productId", getProduct);
route.get("/products/:categoryId", getProductsByCategory);
module.exports = route;
