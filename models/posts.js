const mongoose = require('mongoose');

const PostsSchema = new mongoose.Schema({
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
  creator: {
    type: String,
    required: false,
    trim: true,
  },
  creatorEmail: {
    type: String,
    required: false,
    trim: true,
  },
  creatorLink: {
    type: String,
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

module.exports = mongoose.model('Post', PostsSchema);
