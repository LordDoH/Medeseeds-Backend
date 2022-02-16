const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/products');
require('dotenv').config();

const createToken = (user, secret, expiresIn) => {
  console.log(user);

  const { name, email } = user;

  return jwt.sign({ name, email }, secret, { expiresIn });
};

// Resolvers
const resolvers = {
  Query: {
    // User
    getUserByToken: async (_, { token }) => {
      const userEmail = await jwt.verify(token, process.env.PALABRA_SECRETA);

      return userEmail;
    },

    // Products
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product does not exist');
      }
      return product;
    },
  },
  Mutation: {
    // User
    newUser: async (_, { input }) => {
      const { email } = input;
      // Check if user is registered
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error('The user is already registered');
      }

      // Save new user
      try {
        const user = new User(input);
        user.save();
        return user;
      } catch (error) {
        console.log(error);
      }
    },
    authenticateUser: async (_, { input }) => {
      // Check if user exists
      const { email, password } = input;
      const userExists = await User.findOne({ email });
      if (!userExists) {
        throw new Error('The user has not registered yet.');
      }

      // Check password
      const isMatch = await userExists.comparePassword(password);
      if (!isMatch) {
        throw new Error('Wrong password.');
      }

      // Generate Token
      return {
        token: createToken(userExists, process.env.PALABRA_SECRETA, '24h'),
      };
    },

    // Products
    newProduct: async (_, { input }) => {
      // Save new product
      try {
        const product = new Product(input);
        const savedProduct = await product.save();
        return savedProduct;
      } catch (error) {
        console.log(error);
      }
    },
    updateProduct: async (_, { id, input }) => {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product does not exist');
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: id },
        input,
        { new: true }
      );
      return updatedProduct;
    },
    deleteProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product does not exist');
      }
      await Product.findOneAndDelete({ _id: id });

      return 'Product deleted';
    },
  },
};

module.exports = resolvers;
