const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  status: {
    type: String,
    default: 'NotPaid',
  },
  total: {
    type: Number,
    required: false,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  products: {
    type: Array,
    required: false,
    trim: true,
  },
});

module.exports = mongoose.model('Order', OrdersSchema);
