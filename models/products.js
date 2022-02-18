const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  secondaryImages: {
    type: Array,
    required: false,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    trim: true,
  },
  purchased: {
    type: Number,
    required: false,
    trim: true,
  },
  tags: {
    type: Array,
    required: false,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Product', ProductsSchema);
