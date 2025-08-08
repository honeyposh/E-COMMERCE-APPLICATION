const express = require("express");
const {
  addToCart,
  getAllCartItem,
  getSingleItemFromCartItem,
  updateCartItem,
  removeSingleCartItem,
  deleteCart,
} = require("../controllers/cartController");
const { authentication } = require("../middleware/authMiddleware");
const route = express.Router();
route.post("/cart", authentication, addToCart);
route.get("/cart", authentication, getAllCartItem);
route.get(
  "/cart/:cartId/product/:productId",
  authentication,
  getSingleItemFromCartItem
);
route.put("/cart/:cartId/item/:itemId", authentication, updateCartItem);
route.delete(
  "/deletecartItem/:cartId/item/:itemId",
  authentication,
  removeSingleCartItem
);
route.delete("/cart/:cartId", authentication, deleteCart);
module.exports = route;
