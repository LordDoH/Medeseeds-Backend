const mongoose = require('mongoose');

const CategoriesSchema = new mongoose.Schema({
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
  brands: {
    type: Array,
    required: false,
    trim: true,
  },
  image: {
    type: String,
    required: true,
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

module.exports = mongoose.model('Category', CategoriesSchema);
