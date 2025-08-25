const express = require("express");
const upload = require("../utils/multer");
const {
  createProduct,
  getProduct,
  getProductsByCategory,
  updateProduct,
  softdeleteProduct,
  getAllProduct,
} = require("../controllers/productController");
const { authentication } = require("../middleware/authMiddleware");
const route = express.Router();
route.post("/product", authentication, upload.array("image", 6), createProduct);
route.get("/product/:productId", getProduct);
route.get("/products", getAllProduct);
route.put(
  "/product/:productId",
  upload.array("image", 6),
  authentication,
  updateProduct
);
route.put("/softdeleteproduct/:productId", authentication, softdeleteProduct);
module.exports = route;
