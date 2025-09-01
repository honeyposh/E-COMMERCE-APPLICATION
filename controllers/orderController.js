const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_KEY);
exports.createOrder = async (req, res, next) => {
  const {
    taxPrice,
    shippingPrice,
    address,
    city,
    state,
    country,
    phone,
    paymentMethod,
  } = req.body;
  try {
    const { id } = req.user;
    const existingOrder = await orderModel.findOne({ user: id, isPaid: false });
    if (existingOrder) {
      const error = new Error("You already have an unpaid order.");
      error.status = 400;
      return next(error);
    }
    const cart = await cartModel
      .findOne({ user: id })
      .populate("cartItems.productId", "name price");
    if (!cart || cart.cartItems.length <= 0) {
      const error = new Error("No Item in cart");
      error.status = 404;
      return next(error);
    }
    let subtotal = 0;
    for (const item of cart.cartItems) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        const error = new Error(`Product not found`);
        error.status = 404;
        return next(error);
      }
      if (product.inStock == false || product.isDeleted == true) {
        const error = new Error(`Product ${product.name} is unavailable`);
        error.status = 400;
        return next(error);
      }
      subtotal += product.price * item.quantity;
    }
    const order = await orderModel.create({
      user: id,
      cartItems: cart.cartItems.map((item) => ({
        productId: item.productId,
        price: item.productId.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        address,
        city,
        state,
        country,
        phone,
      },
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalItemPrice: subtotal + shippingPrice + taxPrice,
    });
    return res.status(201).json({
      order,
    });
  } catch (error) {
    return next(error);
  }
};

exports.checkout = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const { id } = req.user;
    const order = await orderModel
      .findById(orderId)
      .populate("cartItems.productId", "name price image");
    //.lean();
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      return next(error);
    }
    if (order.isPaid) {
      const error = new Error("Order already paid");
      error.status = 400;
      return next(error);
    }
    if (order.orderStatus !== "Pending") {
      const error = new Error("Order cannot be checked out");
      error.status = 400;
      return next(error);
    }

    const line_items = [
      ...order.cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productId.name,
            images: [item.productId.image[0].url],
          },
          unit_amount: item.productId.price * 100, // cents
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping Fee" },
          unit_amount: order.shippingPrice * 100,
        },
        quantity: 1,
      },

      {
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: order.taxPrice * 100,
        },
        quantity: 1,
      },
    ];
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      line_items,
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      metadata: {
        orderId: order._id.toString(),
        userId: id,
      },
    });
    return res.status(201).json({
      url: session.url,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
exports.getAllOrders = async (req, res, next) => {
  const { admin } = req.user;
  const { sort } = req.query;
  const queryObject = {};
  try {
    if (!admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    let result = orderModel
      .find(queryObject)
      .populate("user", "name email")
      .populate("cartItems.productId", "name price");
    if (sort) {
      sortList = sort.split(",").join(" ");
      result = result.sort(sortList);
    } else {
      result = result.sort("-createdAt");
    }
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);
    const orders = await result;
    res.status(200).json({ orders, totalOrder: orders.length });
  } catch (error) {
    return next(error);
  }
};
exports.myOrder = async (req, res, next) => {
  try {
    const order = await orderModel
      .find({ user: req.user.id })
      .populate("cartItems.productId", "name price");
    if (!order) {
      const error = new Error("no order");
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ order, totalOrder: order.length });
  } catch (error) {
    return next(error);
  }
};
exports.cancelMyOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) {
      const error = new Error("order not found");
      error.status = 404;
      return next(error);
    }
    if (order.user.toString() !== req.user.id) {
      const error = new Error("Not authorized");
      error.status = 403;
      return next(error);
    }
    if (order.orderStatus !== "Pending") {
      const error = new Error("you cannot cancel this order at this stage");
      error.status = 400;
      return next(error);
    }
    order.orderStatus = "Cancelled";
    await order.save();
    res.status(200).json({ message: "Order successfully cancelled" });
  } catch (error) {
    next(error);
  }
};
exports.updateOrderStatus = async (req, res, next) => {
  const { admin } = req.user;
  try {
    const { orderStatus } = req.body;
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    if (!order) {
      const error = new Error("No order");
      error.status = 404;
      return next(error);
    }
    await orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true, runValidators: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "order status updated" });
  } catch (error) {
    return next(error);
  }
};
