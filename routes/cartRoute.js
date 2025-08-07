const express = require("express");
const {
  addToCart,
  getAllCartItem,
  getSingleProductFromCart,
  removeitemFromCart,
} = require("../controllers/cartController");
const { authentication } = require("../middleware/authMiddleware");
const route = express.Router();
route.post("/cart", authentication, addToCart);
route.get("/cart", authentication, getAllCartItem);
route.get(
  "/cart/:cartId/product/:productId",
  authentication,
  getSingleProductFromCart
);
route.delete(
  "/cart/:cartId/product/:productId",
  authentication,
  removeitemFromCart
);
module.exports = route;
