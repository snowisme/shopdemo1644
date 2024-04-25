const mongoose= require('mongoose')

const orderSchema= new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'users'},
    orderNumber: { type: Number, required: true},
    orderDate: { type: Date, required:true, default: new Date().toLocaleString()},
    orderStatus: {type: String, default:'Chờ giao'},
    addressChosen : { type: mongoose.Types.ObjectId, required: true, ref: 'addresses'},
    grandTotalCost: { type: Number},
    cartData: { type: Array},
})

const orderCollection= mongoose.model( 'orders', orderSchema )

module.exports= orderCollection