const addressCollection = require("../models/addressModel.js");
const cartCollection = require("../models/cartModel.js");
const orderCollection = require("../models/orderModel.js");

//updating totalCostPerProduct and grand total in cart-page
async function grandTotal(req) {
  try {
    let userCartData = await cartCollection
      .find({ userId: req.session.currentUser._id })
      .populate("productId");
    let grandTotal = 0;
    for (const v of userCartData) {
      grandTotal += v.productId.productPrice * v.productQuantity;
      await cartCollection.updateOne(
        { _id: v._id },
        {
          $set: {
            totalCostPerProduct: v.productId.productPrice * v.productQuantity,
          },
        }
      );
    }
    userCartData = await cartCollection
      .find({ userId: req.session.currentUser._id })
      .populate("productId");
    req.session.grandTotal = grandTotal;
    return JSON.parse(JSON.stringify(userCartData));
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  //product page - add to cart option
  addToCart: async (req, res) => {
    try {
      let existingProduct = await cartCollection.findOne({
        userId: req.session.currentUser._id,
        productId: req.params.id,
      });
      if (existingProduct)
        await cartCollection.updateOne(
          { _id: existingProduct._id },
          { $inc: { productQuantity: req.body.productQuantity } }
        );
      else
        await cartCollection.insertMany([
          {
            userId: req.session.currentUser._id,
            productId: req.params.id,
            productQuantity: req.body.productQuantity,
          },
        ]);
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
    }
  },
  //cart page - show cart page
  cart: async (req, res) => {
    try {
      let cartData = await grandTotal(req);
      res.render("userViews/cart", {
        currentUser: req.session.currentUser,
        cartData,
        grandTotal: req.session.grandTotal,
      });
    } catch (error) {
      console.error(error);
    }
  },
  //cart page - delete cart page
  deleteFromCart: async (req, res) => {
    try {
      await cartCollection.findOneAndDelete({ _id: req.params.id });
      res.send("hello ur cart is deleted");
    } catch (error) {
      console.error(error);
    }
  },
  decQty: async (req, res) => {
    try {
      let cartProduct = await cartCollection
        .findOne({ _id: req.params.id })
        .populate("productId");
      if (cartProduct.productQuantity > 1) {
        cartProduct.productQuantity--;
      }
      cartProduct.totalCostPerProduct = cartProduct.productId.productPrice * cartProduct.productQuantity;
      cartProduct = await cartProduct.save();
      await grandTotal(req);
      res.json({ cartProduct, grandTotal: req.session.grandTotal });
    } catch (error) {
      console.error(error);
    }
  },
  incQty: async (req, res) => {
    try {
      let cartProduct = await cartCollection
        .findOne({ _id: req.params.id })
        .populate("productId");
      if (cartProduct.productQuantity < cartProduct.productId.productStock) {
        cartProduct.productQuantity++;
      }
      cartProduct.totalCostPerProduct = cartProduct.productId.productPrice * cartProduct.productQuantity;
      cartProduct = await cartProduct.save();
      await grandTotal(req);
      res.json({ cartProduct, grandTotal: req.session.grandTotal });
    } catch (error) {
      console.error(error);
    }
  },
  //checkout
  checkoutPage: async (req, res) => {
    try {
      let addressData = await addressCollection.find({
        userId: req.session.currentUser._id,
      });
      await grandTotal(req);
      if (addressData.length > 0) {
        res.render("userViews/checkoutPage", {
          currentUser: req.session.currentUser,
          grandTotal: req.session.grandTotal,
          addressData,
        });
      } else {
        req.session.addressPageFrom = "cart";
        res.redirect("/account/addAddress");
      }
    } catch (error) {
      console.error(error);
    }
  },
  orderPlacedEnd: async (req, res) => {
    let cartData = await cartCollection
      .find({ userId: req.session.currentUser._id })
      .populate("productId");

    //reducing from stock qty
    cartData.map(async (v) => {
      v.productId.productStock -= v.productQuantity;
      await v.productId.save();
      return v;
    });

    let addressData = await addressCollection.find({
      userId: req.session.currentUser._id,
    });

    const currentOrder = await orderCollection.create({
        userId: req.session.currentUser._id,
        orderNumber: (await orderCollection.countDocuments()) + 1,
        orderDate: new Date(),
        addressChosen: JSON.parse(JSON.stringify(addressData[0])), //default address
        cartData: await grandTotal(req),
        grandTotalCost: req.session.grandTotal,
      });

    res.render("userViews/orderPlacedPage", {
      currentUser: req.session.currentUser,
      orderCartData: cartData,
      orderData: currentOrder,
    });

    //delete the cart- since the order is placed
    await cartCollection.deleteMany({ userId: req.session.currentUser._id });
    console.log("deleting finished");
  },
};
