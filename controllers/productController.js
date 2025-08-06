const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
exports.createProduct = async (req, res, next) => {
  try {
    const {
      categoryName,
      name,
      description,
      price,
      image,
      size,
      color,
      gender,
      discountPrice,
    } = req.body;
    if (!req.user.id || !req.user.admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const category = await categoryModel.findOne({ name: categoryName });
    if (!category) {
      const error = new Error("catogory doesnt exisst");
      error.status = 404;
      return next(error);
    }
    // console.log(category);
    const product = await productModel.create({
      name,
      category: category.id,
      description,
      price,
      image,
      size,
      color,
      gender,
      discountPrice,
    });
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
};
exports.getProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const product = await productModel
      .findById(productId)
      .populate("category", "name");
    if (!product) {
      const error = new Error("product doesnt exist");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({ product });
  } catch (error) {
    return next(error);
  }
};
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel
      .find({ category: categoryId })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    if (!products.length) {
      const error = new Error("No product in this category");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};
