const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      const error = new Error("name is required");
      error.status = 400;
      return next(error);
    }
    if (!req.user.id || !req.user.admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const categoryExist = await categoryModel.findOne({ name });
    if (categoryExist) {
      const error = new Error("This category already exist");
      error.status = 400;
      return next(error);
    }
    const category = await categoryModel.create({ name });
    return res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.find();
    if (!categories.length) {
      const error = new Error("No category found");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
exports.updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.params;
  try {
    if (!req.user.id || !req.user.admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.status = 404;
      return next(error);
    }
    await categoryModel.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ message: "category updated succesfully" });
  } catch (error) {
    next(error);
  }
};
exports.deleteCatgeory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    if (!req.user.id || !req.user.admin) {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.status = 404;
      return next(error);
    }
    const product = await productModel.find({ category: categoryId });
    if (product.length > 0) {
      const error = new Error("This category has product");
      error.status = 400;
      return next(error);
    }
    await categoryModel.findByIdAndDelete(categoryId);
    return res.status(200).json({ message: " category successfully deleted" });
  } catch (error) {
    return next(error);
  }
};
