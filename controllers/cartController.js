const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const { id } = req.user;
    if (!id) {
      const error = new Error("Please login");
      error.status = 400;
      return next(error);
    }
    const product = await productModel.findById(productId);
    if (!product) {
      const error = new Error("product doesnt exist");
      error.status = 400;
      return next(error);
    }
    let cart = await cartModel.findOne({ user: id });
    if (!cart) {
      cart = await cartModel.create({ user: id, cartItems: [], subtotal: 0 });
    }
    const existingItemIndex = cart.cartItems.findIndex(
      (item) => item.productId == productId
    );
    console.log(existingItemIndex);
    if (existingItemIndex !== -1) {
      cart.cartItems[existingItemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({ productId, quantity });
    }
    let subtotal = 0;
    for (let item of cart.cartItems) {
      const prod = await productModel.findById(item.productId);
      subtotal += prod.price * item.quantity;
    }
    cart.subtotal = subtotal;
    await cart.save();
    await userModel.findByIdAndUpdate(
      id,
      { $push: { cart: cart.id } },
      { new: true }
    );
    return res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};
exports.getAllCartItem = async (req, res, next) => {
  try {
    const cart = await cartModel
      .find({ user: req.user.id })
      .populate("cartItems.productId", "name price image");
    if (!cart.length) {
      const error = new Error("No cart");
      error.status = 400;
      return next(error);
    }
    return res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
};
exports.getSingleProductFromCart = async (req, res, next) => {
  try {
    const { cartId, productId } = req.params;
    const { id } = req.user;
    const cart = await cartModel.findById(cartId).populate({
      path: "cartItems.productId",
      select: "name price image",
    });
    if (!cart) {
      const error = new Error("cart doesnt exist");
      error.status = 404;
      return next(error);
    }
    if (id != cart.user) {
      const error = new Error("unathorized");
      error.status = 403;
      return next(error);
    }
    const item = cart.cartItems.find(
      (item) => item.productId._id.toString() === productId
    );

    if (!item) {
      const error = new Error("No product");
      error.status = 404;
      return next(error);
    }
    console.log(item);
    return res.status(200).json({ product: item.productId });
  } catch (error) {
    next(error);
  }
};
exports.removeitemFromCart = async (req, res, next) => {
  try {
    const { cartId, productId } = req.params;
    const { id, admin } = req.user;
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      const error = new Error("No cart");
      error.status = 404;
      return next(error);
    }
    if (id != cart.user && !admin) {
      const error = new Error("you cant delete this post");
      error.status = 401;
      return next(error);
    }
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.productId == productId
    );
    if (itemIndex === -1) {
      const error = new Error("Product not in cart");
      error.status = 400;
      return next(error);
    }
    const item = cart.cartItems[itemIndex];
    // console.log(item);
    if (item.quantity > 1) {
      cart.cartItems[itemIndex].quantity -= 1;
    } else {
      cart.cartItems.splice(itemIndex, 1);
    }
    let subtotal = 0;
    for (const cartItem of cart.cartItems) {
      const product = await productModel.findById(cartItem.productId);
      subtotal += product.price * cartItem.quantity;
      console.log(subtotal);
    }
    cart.subtotal = subtotal;
    await cart.save();
    return res.status(200).json({ message: "cart removed", cart });
  } catch (error) {
    next(error);
  }
};
