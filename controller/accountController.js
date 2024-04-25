const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const userCollection = require("../models/userModels");
const formatDate = require("../helpers/formatDateHelper.js");

module.exports = {
  //account
  accountPage: async (req, res) => {
    try {
      let userData = await userCollection.findOne({
        _id: req.session.currentUser._id,
      });

      res.render("userViews/account", {
        currentUser: req.session.currentUser,
        userData,
      });
    } catch (error) {
      console.error(error);
    }
  },
  //account-orderList
  orderList: async (req, res) => {
    try {
      let orderData = await orderCollection.find({
        userId: req.session.currentUser._id,
      });

      //sending the formatted date to the page
      orderData = orderData.map((v) => {
        v.orderDateFormatted = formatDate(v.orderDate);
        return v;
      });

      res.render("userViews/orderList", {
        currentUser: req.session.currentUser,
        orderData,
      });
    } catch (error) {
      console.error(error);
    }
  },
  orderStatus: async (req, res) => {
    try {
      let orderData = await orderCollection
        .findOne({ _id: req.params.id })
        .populate("addressChosen");
      let isCancelled = orderData.orderStatus == "Đã hủy";
      res.render("userViews/orderStatus", {
        currentUser: req.session.currentUser,
        orderData,
        isCancelled,
      });
    } catch (error) {
      console.error(error);
    }
  },
  cancelOrder: async (req, res) => {
    try {
      await orderCollection.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { orderStatus: "Đã hủy" } }
      );

      res.json({ success: true });
    } catch (error) {
      console.error(error);
    }
  },
  //account-address
  myAddress: async (req, res) => {
    try {
      const addressData = await addressCollection.find({
        userId: req.session.currentUser._id,
      });
      res.render("userViews/myAddress", {
        currentUser: req.session.currentUser,
        addressData,
      });
    } catch (error) {
      console.error(error);
    }
  },
  // render add address page
  addAddress: async (req, res) => {
    try {
      res.render("userViews/addAddress", {
        currentUser: req.session.currentUser,
      });
    } catch (error) {
      console.error(error);
    }
  },
  // add address
  addAddressPost: async (req, res) => {
    try {
      const address = {
        userId: req.session.currentUser._id,
        addressTitle: req.body.addressTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        phone: req.body.phone,
      };
      await addressCollection.insertMany([address]);

      if (req.session.addressPageFrom == "cart") {
        req.session.addressPageFrom = null;
        return res.redirect("/cart");
      }

      return res.redirect("/account");
    } catch (error) {
      console.error(error);
    }
  },
  // render edit address page
  editAddress: async (req, res) => {
    try {
      const existingAddress = await addressCollection.findOne({
        userId: req.session.currentUser._id,
        _id: req.params.id,
      });
      res.render("userViews/editAddress", {
        currentUser: req.session.currentUser,
        existingAddress,
      });
    } catch (error) {
      console.error(error);
    }
  },
  // edit address
  editAddressPost: async (req, res) => {
    try {
      const address = {
        addressTitle: req.body.addressTitle,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        phone: req.body.phone,
      };
      await addressCollection.updateOne({ _id: req.params.id }, address);

      res.redirect("back");
    } catch (error) {
      console.error(error);
    }
  },
  deleteAddress: async (req, res) => {
    try {
      await addressCollection.deleteOne({ _id: req.params.id });
      res.redirect("/account/myAddress");
    } catch (error) {
      console.log(error);
    }
  },
};
