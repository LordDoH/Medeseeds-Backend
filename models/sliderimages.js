const mongoose = require('mongoose');

const SlidersSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model('Slider', SlidersSchema);
