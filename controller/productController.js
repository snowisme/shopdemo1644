const path = require("node:path");
const categoryCollection = require("../models/categoryModel");
const productCollection = require("../models/productModels");

module.exports = {
  productManagement: async (req, res) => {
    try {
      let productData = await productCollection.find();
      let categoryList = await categoryCollection.find(
        {},
        { categoryName: true }
      );
      res.render("adminViews/productManagement", {
        productData,
        categoryList,
        productExists: req.session.productAlreadyExists,
      });
      req.session.productAlreadyExists = null;
    } catch (error) {
      console.error(error);
    }
  },
  addProduct: async (req, res) => {
    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
      });
      if (!existingProduct) {
        await productCollection.insertMany([
          {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage1: req.files[0].path,
            productImage2: req.files[1].path,
            productImage3: req.files[2].path,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock
          },
        ]);
        res.redirect("/admin/productManagement");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/productManagement");
      }
    } catch (err) {
      console.log(err);
    }
  },
  editProduct: async (req, res) => {
    try {
      let existingProduct = await productCollection.findOne({
        productName: { $regex: new RegExp(req.body.productName, "i") },
      });
      if (!existingProduct || existingProduct._id == req.params.id) {
        const updateFields = {
          $set: {
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
          },
        };

        // Check and add image to the query
        if (req.files[0]) {
          updateFields.$set.productImage1 = req.files[0].path;
        }

        if (req.files[1]) {
          updateFields.$set.productImage2 = req.files[1].path;
        }

        if (req.files[2]) {
          updateFields.$set.productImage3 = req.files[2].path;
        }

        await productCollection.findOneAndUpdate(
          { _id: req.params.id },
          updateFields
        );
        res.redirect("/admin/productManagement");
      } else {
        req.session.productAlreadyExists = existingProduct;
        res.redirect("/admin/productManagement");
      }
    } catch (error) {
      console.error(error);
    }
  },
  listProduct: async (req, res) => {
    try {
      await productCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: true } }
      );
      res.redirect("/admin/productManagement");
    } catch (error) {
      console.error(error);
    }
  },
  unListProduct: async (req, res) => {
    try {
      await productCollection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { isListed: false } }
      );
      res.redirect("/admin/productManagement");
    } catch (error) {
      console.error(error);
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await productCollection.findOneAndDelete({ _id: req.params.id });
      res.redirect("/admin/productManagement");
    } catch (error) {
      console.error(error);
    }
  },
};
