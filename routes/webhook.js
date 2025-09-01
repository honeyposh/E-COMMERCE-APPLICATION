const express = require("express");
const Stripe = require("stripe");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const stripe = new Stripe(process.env.STRIPE_KEY);
const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(400).json(`Webhook Error: ${err.message}`);
    }
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        await orderModel.findByIdAndUpdate(orderId, {
          isPaid: true,
          orderStatus: "Paid",
          paidAt: new Date(),
          sessionId: session.id,
        });
        await cartModel.findOneAndUpdate(
          { user: session.metadata.userId },
          { $set: { cartItems: [], subtotal: 0 } }
        );
        console.log(` Order ${orderId} marked as paid`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ received: true, error: error.message });
    }
  }
);

module.exports = router;
