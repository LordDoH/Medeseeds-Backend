const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UsersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: false,
    trim: true,
  },
  telephone: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false,
    trim: true,
  },
  photo: {
    type: String,
    required: false,
    default:
      'https://res.cloudinary.com/zupport/image/upload/v1643327449/autor-desconocido_iubczi.png',
  },
  orders: {
    type: Array,
    required: false,
  },
  role: {
    type: String,
    default: 'user',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

// eslint-disable-next-line
UsersSchema.pre("save", async function (next) {
  const user = this;
  try {
    if (!user.isModified('password')) {
      return next();
    }

    const hash = await bcrypt.hash(user.password, 10);

    user.password = hash;
  } catch (error) {
    next(error);
  }
});

// eslint-disable-next-line
UsersSchema.methods.comparePassword = async function (candidatePassword) {
  const user = this;
  // eslint-disable-next-line
  return await bcrypt.compare(candidatePassword, user.password);
};

module.exports = mongoose.model('User', UsersSchema);
