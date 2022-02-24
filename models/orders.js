const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  mercadoPagoId: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: 'NotPaid',
  },
  note: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  telephone: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
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
