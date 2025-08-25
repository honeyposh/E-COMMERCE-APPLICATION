const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs/promises");
exports.createProduct = async (req, res, next) => {
  let filePath = [];
  let uploadedImages = [];
  const {
    categoryName,
    name,
    description,
    price,
    size,
    color,
    gender,
    discountPrice,
  } = req.body;
  if (req.files) {
    for (const x of req.files) {
      filePath.push(x.path);
    }
  }
  const cleanup = async () => {
    for (let path of filePath) {
      try {
        await fs.unlink(path);
      } catch (error) {
        console.log(error);
      }
    }
    for (const img of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (error) {
        console.log(error);
      }
    }
  };
  try {
    if (!req.user.admin) {
      await cleanup();
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const category = await categoryModel.findOne({ name: categoryName });
    if (!category) {
      // clean up before returning
      await cleanup();
      const error = new Error("catogory doesnt exisst");
      error.status = 404;
      return next(error);
    }
    for (const x of req.files) {
      const response = await cloudinary.uploader.upload(x.path, {
        folder: "Posh",
      });
      uploadedImages.push(response);
      await fs.unlink(x.path);
    }
    const product = await productModel.create({
      name,
      category: category.id,
      description,
      price,
      image: uploadedImages.map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      })),
      size,
      color,
      gender,
      discountPrice,
    });
    return res.status(201).json({ product });
  } catch (error) {
    await cleanup();
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
  try {
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
  } catch (error) {
    next(error);
  }
};
exports.updateProduct = async (req, res, next) => {
  let filePath = [];
  let uploadedImages = [];
  if (req.files) {
    for (const x of req.files) {
      filePath.push(x.path);
    }
  }
  const cleanup = async () => {
    for (let path of filePath) {
      try {
        await fs.unlink(path);
      } catch (error) {
        console.log(error);
      }
    }
    for (const img of uploadedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (error) {
        console.log(error);
      }
    }
  };
  try {
    const { name, description, price, size, color, gender, discountPrice } =
      req.body;
    const { productId } = req.params;
    if (!req.user.admin) {
      await cleanup();
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }
    const product = await productModel.findById(productId);
    if (!product) {
      await cleanup();
      const error = new Error("product Not found");
      error.status = 404;
      return next(error);
    }
    if (req.files && req.files.length > 0) {
      for (const x of req.files) {
        const response = await cloudinary.uploader.upload(x.path, {
          folder: "Posh",
        });
        uploadedImages.push(response);
        await fs.unlink(x.path);
      }
      for (const oldImg of product.image) {
        await cloudinary.uploader.destroy(oldImg.public_id);
      }
    }

    await productModel.findByIdAndUpdate(
      productId,
      {
        name,
        category: product.category,
        description,
        price,
        image:
          uploadedImages.length > 0
            ? uploadedImages.map((img) => ({
                url: img.secure_url,
                public_id: img.public_id,
              }))
            : product.image,
        size,
        color,
        gender,
        discountPrice,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json({ message: "product updated successfully" });
  } catch (error) {
    await cleanup();
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
