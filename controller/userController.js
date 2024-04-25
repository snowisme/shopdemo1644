const userCollection = require("../models/userModels.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../services/sendOTP.js");
const categoryCollection = require("../models/categoryModel.js");
const productCollection = require("../models/productModels.js");
const cartCollection = require("../models/cartModel.js");

module.exports = {
  //signup-login
  landingPage: async (req, res) => {
    try {
      const categoryData = await categoryCollection.find({ isListed: true });
      const productData = await productCollection.find({ isListed: true });
      const cartData= await cartCollection.find({ userId: req.session?.currentUser?._id }).populate('productId')

      res.render("userViews/landingPage", {
        currentUser: req.session.currentUser,
        categoryData,
        productData,
        cartData
      });
    } catch (error) {
      console.error(error);
    }
  },
  signupLoginPage: async (req, res) => {
    try {
      if (!req.cookies.userToken) {
        res.render("userViews/signupLoginPage", {
          currentUser: req.session.currentUser,
          invalidCredentials: req.session.invalidCredentials,
          passwordResetSucess: req.session.passwordResetSucess,
        });
        req.session.passwordResetSucess = null;
        req.session.invalidCredentials = null;
      } else {
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
    }
  },
  userDetailsInModel: async (req, res, next) => {
    try {
      let {email , phonenumber}= req.body;
      let exisitingUser = await userCollection.findOne({
        $or: [{ email }, { phonenumber }],
      });
      if (!exisitingUser) {
        let encryptedPassword = bcrypt.hashSync(req.body.password, 10);
        req.session.tempUserData = {
          username: req.body.username,
          email: req.body.email,
          phonenumber: req.body.phonenumber,
          password: encryptedPassword,
        };
        next();
      } else {
        res.render("userViews/signupLoginPage", { emailPhoneExists: true });
      }
    } catch (error) {
      console.error(error);
    }
  },
  sendOTP: async (req, res) => {
    try {
      req.session.emailOfNewUser = req.body.email || req.session.emailOfNewUser;

      const otp = Math.floor(1000 + Math.random() * 9000);
      req.session.otp = otp;
      await transporter.sendMail({
        from: `${process.env.GMAIL_ID}`,
        to: `${req.session.emailOfNewUser}`,
        subject: "OTP Đăng ký",
        text: `Mã OTP của bạn là ${otp}`,
      });
      res.render("userViews/otpPage", { currentOTP: req.session.otp });
    } catch (error) {
      console.error(error);
    }
  },
  signup: async (req, res) => {
    try {
      await userCollection.create(req.session.tempUserData);
      const userToken = jwt.sign(req.body, process.env.MY_SECRET_KEY, {
        expiresIn: "7d",
      });
      res.cookie("userToken", userToken, { httpOnly: true });
      req.session.currentUser = await userCollection.findOne({ email: req.session.tempUserData.email});

      res.redirect("/");
    } catch (error) {
      console.error(error);
    }
  },
  login: async (req, res) => {
    try {
      let exisitingUser = await userCollection.findOne({
        email: req.body.email,
        isBlocked: false
      });
      if (exisitingUser) {
        let passwordMatch = bcrypt.compareSync(
          req.body.password,
          exisitingUser.password
        );
        if (passwordMatch) {
          req.session.currentUser = exisitingUser;
          const userToken = jwt.sign(req.body, process.env.MY_SECRET_KEY, {
            expiresIn: "7d",
          });
          res.cookie("userToken", userToken, { httpOnly: true });
          res.redirect("back");
        } else {
          req.session.invalidCredentials = true;
          res.redirect("/signupLoginPage");
        }
      } else {
        req.session.invalidCredentials = true;
        res.redirect("/signupLoginPage");
      }
    } catch (error) {
      console.error(error);
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("userToken");
      req.session.destroy();
      res.redirect("/");
    } catch (error) {
      console.error(error);
    }
  },

  //product details
  productDetails: async (req, res) => {
    try {
      const currentProduct = await productCollection.findOne({
        _id: req.params.id,
      });
      var cartProductQuantity=0
      if(req.session?.currentUser?._id){
        const cartProduct = await cartCollection.findOne({ userId: req.session.currentUser._id, productId: req.params.id })
        if(cartProduct){
          var cartProductQuantity= cartProduct.productQuantity
        }
      }     
      let productQtyLimit= [],i=0
      while(i<(currentProduct.productStock - cartProductQuantity )){
        productQtyLimit.push(i+1)
        i++
      }
      const cartData= await cartCollection.find({ userId: req.session?.currentUser?._id }).populate('productId')
      res.render("userViews/productDetails", { currentUser: req.session.currentUser, currentProduct, productQtyLimit, cartData });
    } catch (error) {
      console.error(error);
    }
  },
};