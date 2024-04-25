const adminRouter= require('express').Router()
const adminController= require('../controller/adminController.js')
const categoryController = require('../controller/categoryController.js')
const orderController = require('../controller/orderController.js')
const productController = require('../controller/productController.js')
const adminAuth = require('../middlewares/adminAuth.js')
const upload= require('../services/multer.js')

//login and logout 
adminRouter.get('/', adminController.loginPage )
adminRouter.post('/', adminController.login)
adminRouter.post('/logout', adminController.logout )

//dashboard
adminRouter.get('/dashboard', adminAuth, adminController.dashboard)
adminRouter.get('/dashboardData', adminAuth, adminController.dashboardData )

//user management
adminRouter.get('/userManagement', adminAuth, adminController.userManagement)
adminRouter.patch('/userManagement/block/:id', adminAuth, adminController.blockUser )
adminRouter.patch('/userManagement/unBlock/:id', adminAuth, adminController.unBlockUser)

//category management
adminRouter.get('/categoryManagement', adminAuth, categoryController.categoryManagement)
adminRouter.post('/categoryManagement/add', adminAuth, categoryController.addCategory)
adminRouter.post('/categoryManagement/edit/:id', adminAuth, categoryController.editCategory)
adminRouter.patch('/categoryManagement/unList/:id', adminAuth, categoryController.unlistCategory)
adminRouter.patch('/categoryManagement/list/:id', adminAuth, categoryController.listCategory)
adminRouter.get('/categoryManagement/delete/:id', adminAuth, categoryController.deleteCategory)

//product management
adminRouter.get('/productManagement', adminAuth, productController.productManagement)
adminRouter.post('/productManagement/add', adminAuth, upload.any(), productController.addProduct)
adminRouter.post('/productManagement/edit/:id', adminAuth, upload.any(), productController.editProduct)
adminRouter.post('/productManagement/unList/:id', adminAuth, productController.unListProduct)
adminRouter.post('/productManagement/list/:id', adminAuth, productController.listProduct)
adminRouter.get('/productManagement/delete/:id', adminAuth, productController.deleteProduct)

//product management
adminRouter.get('/orderManagement', adminAuth, orderController.orderManagement)
adminRouter.get('/orderManagement/status/pending/:id', adminAuth, orderController.changeStatusPending)
adminRouter.get('/orderManagement/status/delivered/:id', adminAuth, orderController.changeStatusDelivered)
adminRouter.get('/orderManagement/status/cancelled/:id', adminAuth, orderController.changeStatusCancelled)
adminRouter.get('/orderManagement/orderStatus/:id', adminAuth, orderController.orderStatusPage)

module.exports= adminRouter