const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: Number,
      price: Number,
    },
  ],
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    country: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    enum: ["Card", "Cash", "Paystack", "Flutterwave"],
    required: true,
  },
  taxPrice: {
    type: Number,
  },
  shippingPrice: {
    type: Number,
  },
  totalItemPrice: {
    type: Number,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
  orderStatus: {
    type: String,
    enum: [
      "Pending",
      "Paid",
      "Shipped",
      "Processing",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },
  sessionId: { type: String },
});
const orderModel = mongoose.model("Order", orderSchema);
module.exports = orderModel;
