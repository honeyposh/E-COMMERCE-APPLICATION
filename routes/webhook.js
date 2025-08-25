const express = require("express");
const Stripe = require("stripe");
const orderModel = require("../models/orderModel");

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
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata.orderId;
      await orderModel.findByIdAndUpdate(orderId, {
        isPaid: true,
        orderStatus: "paid",
        paidAt: new Date(),
        sessionId: session.id,
      });
      console.log(`✅ Order ${orderId} marked as paid`);
    }
    await cartModel.findOneAndUpdate(
      { user: session.metadata.userId },
      { $set: { cartItems: [], subtotal: 0 } }
    );
    res.json({ received: true });
  }
);

module.exports = router;
