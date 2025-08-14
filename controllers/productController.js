const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
exports.createProduct = async (req, res, next) => {
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
  try {
    if (!req.user.admin) {
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
exports.getAllProduct = async (req, res, next) => {
  const { keyword, sort, category } = req.query;
  let queryObject = {};
  if (keyword) {
    queryObject.name = { $regex: keyword, $options: "i" };
  }
  if (category) {
    queryObject.category = category;
  }
  let result = productModel.find(queryObject);
  if (sort) {
    result = result.sort(sort);
  } else {
    result = result.sort("-createdAt");
  }
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);
  const products = await result;
  res.status(200).json({ products });
};
exports.updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      image,
      size,
      color,
      gender,
      discountPrice,
    } = req.body;
    const { productId } = req.params;
    if (!req.user.admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const product = await productModel.findById(productId);
    console.log(typeof product.category);
    if (!product) {
      const error = new Error("ptoduct Not found");
      error.status = 404;
      return next(error);
    }
    await productModel.findByIdAndUpdate(
      productId,
      {
        name,
        category: product.category,
        description,
        price,
        image,
        size,
        color,
        gender,
        discountPrice,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ message: "product updated successfully" });
  } catch (error) {
    next(error);
  }
};
exports.softdeleteProduct = async (req, res, next) => {
  console.log("hello");
  try {
    const { productId } = req.params;
    if (!req.user.admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const product = await productModel.findById(productId);
    if (!product) {
      const error = new Error("ptoduct Not found");
      error.status = 404;
      return next(error);
    }
    product.isDeleted = true;
    product.inStock = false;
    await product.save();
    return res
      .status(200)
      .json({ message: "product softdeleted successfully" });
  } catch (error) {
    return next(error);
  }
};
