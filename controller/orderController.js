const orderCollection = require("../models/orderModel")

module.exports={
    //admin side- orderManagement
    orderManagement: async(req,res)=>{
        try {
            let orderData= await orderCollection.find().populate('userId')            
            res.render('adminViews/orderManagement', { orderData })
        } catch (error) {
            console.error(error)
        }
    },
    changeStatusPending: async(req,res)=>{
        try {
            await orderCollection.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { orderStatus: 'Chờ giao' } }
            )
            res.redirect('/admin/orderManagement')
        } catch (error) {
            console.error(error)
        }
    },
    changeStatusDelivered: async(req,res)=>{
        try {
            await orderCollection.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { orderStatus: 'Đã nhận' } }
            )
            res.redirect('/admin/orderManagement')
        } catch (error) {
            console.error(error)
        }
    },
    changeStatusCancelled: async(req,res)=>{
        try {
            await orderCollection.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { orderStatus: 'Đã hủy' } }
            )
            
            res.redirect('/admin/orderManagement')
        } catch (error) {
            console.error(error)
        }
    },
    orderStatusPage: async(req,res)=>{
        try {
            let orderData = await orderCollection.findOne({ _id: req.params.id }).populate("addressChosen");
            res.render('adminViews/orderStatus',{ orderData})
        } catch (error) {
            console.error(error)
        }
    }
}