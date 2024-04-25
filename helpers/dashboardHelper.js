const categoryCollection = require("../models/categoryModel.js");
const orderCollection = require("../models/orderModel");
const productCollection = require("../models/productModels.js");

module.exports = {
  productsCount: async () => {
    try {
      return await productCollection.countDocuments();
    } catch (error) {
      console.error(error);
    }
  },

  categoryCount: async () => {
    try {
      return await categoryCollection.countDocuments();
    } catch (error) {
      console.error(error);
    }
  },

  pendingOrdersCount: async () => {
    try {
      return await orderCollection.countDocuments({
        orderStatus: { $ne: "Đã nhận", $ne: "Đã hủy" },
      });
    } catch (error) {
      console.error(error);
    }
  },

  completedOrdersCount: async () => {
    try {
      return await orderCollection.countDocuments({ orderStatus: "Đã nhận" });
    } catch (error) {
      console.error(error);
    }
  },

  currentDayRevenue: async () => {
    try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const result = await orderCollection.aggregate([
        { $match: { orderDate: { $gte: yesterday, $lt: today }, orderStatus: { $ne: "Đã hủy" } } },
        { $group: { _id: "", totalRevenue: { $sum: "$grandTotalCost" } } },
      ]);
      return result.length>0?result[0].totalRevenue: 0;
    } catch (error) {
      console.error(error);
    }
  },
};
