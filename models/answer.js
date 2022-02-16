const mongoose = require('mongoose');

const AnswersSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  likes: {
    type: Array,
    required: false,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: false,
  },
});

module.exports = mongoose.model('Answer', AnswersSchema);
