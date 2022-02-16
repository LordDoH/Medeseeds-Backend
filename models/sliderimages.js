const mongoose = require('mongoose');

const SlidersSchema = new mongoose.Schema({
  images: {
    type: Array,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model('Slider', SlidersSchema);
