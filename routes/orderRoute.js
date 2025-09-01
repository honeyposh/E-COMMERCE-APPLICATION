const express = require("express");
const { authentication } = require("../middleware/authMiddleware");
const {
  checkout,
  getAllOrders,
  myOrder,
  cancelMyOrder,
  updateOrderStatus,
  createOrder,
  updateOrderToDeliver,
} = require("../controllers/orderController");
const route = express.Router();
route.post("/createorder", authentication, createOrder);
route.post("/checkout/:orderId", authentication, checkout);
route.get("/orders", authentication, getAllOrders);
route.get("/order", authentication, myOrder);
route.put("/cancelorder/:orderId", authentication, cancelMyOrder);
route.put("/order/:orderId", authentication, updateOrderStatus);
route.put("/order/:orderId/deliver", authentication, updateOrderToDeliver);
module.exports = route;
