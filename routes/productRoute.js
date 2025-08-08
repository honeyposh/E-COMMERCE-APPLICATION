const express = require("express");
const {
  createProduct,
  getProduct,
  getProductsByCategory,
  updateProduct,
  softdeleteProduct,
} = require("../controllers/productController");
const { authentication } = require("../middleware/authMiddleware");
const route = express.Router();
route.post("/product", authentication, createProduct);
route.get("/product/:productId", getProduct);
route.get("/products/:categoryId", getProductsByCategory);
route.put("/product/:productId", authentication, updateProduct);
route.put("/softdeleteproduct/:productId/", authentication, softdeleteProduct);
module.exports = route;
