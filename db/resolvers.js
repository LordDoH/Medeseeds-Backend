const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Product = require('../models/products');
const Category = require('../models/categories');
const Order = require('../models/orders');
const Post = require('../models/posts');
const Answer = require('../models/answer');
const Brand = require('../models/brands');
const Slider = require('../models/sliderimages');
require('dotenv').config();

const createToken = (user, secret, expiresIn) => {
  // console.log(user);

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
    getUser: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User does not exist');
      }
      return user;
    },

    // Categories
    getCategories: async () => {
      try {
        const categories = await Category.find({});
        return categories;
      } catch (error) {
        // console.log(error);
      }
    },
    getCategory: async (_, { id }) => {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Category does not exist');
      }
      return category;
    },

    // Products
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        // console.log(error);
      }
    },
    getProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product does not exist');
      }
      return product;
    },

    // Orders
    getOrders: async () => {
      try {
        const orders = await Order.find({});
        return orders;
      } catch (error) {
        // console.log(error);
      }
    },
    getOrder: async (_, { id }) => {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order does not exist');
      }
      return order;
    },

    // Posts
    getPosts: async () => {
      try {
        const posts = await Post.find({});
        return posts;
      } catch (error) {
        // console.log(error);
      }
    },
    getPost: async (_, { id }) => {
      const post = await Post.findById(id);
      if (!post) {
        throw new Error('Post does not exist');
      }
      return post;
    },

    // Answers
    getAnswers: async () => {
      try {
        const answers = await Answer.find({});
        return answers;
      } catch (error) {
        // console.log(error);
      }
    },
    getAnswer: async (_, { id }) => {
      const answer = await Answer.findById(id);
      if (!answer) {
        throw new Error('Answer does not exist');
      }
      return answer;
    },

    // Brands
    getBrands: async () => {
      try {
        const brands = await Brand.find({});
        return brands;
      } catch (error) {
        // console.log(error);
      }
    },
    getBrand: async (_, { id }) => {
      const brand = await Brand.findById(id);
      if (!brand) {
        throw new Error('Brand does not exist');
      }
      return brand;
    },

    // SliderImages
    getSImages: async () => {
      try {
        const sImages = await Slider.find({});
        return sImages;
      } catch (error) {
        // console.log(error);
      }
    },
    getSImage: async (_, { id }) => {
      const sImage = await Slider.findById(id);
      if (!sImage) {
        throw new Error('SImage does not exist');
      }
      return sImage;
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
        // console.log(error);
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
    updateUser: async (_, { id, input }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User does not exist');
      }
      const updatedUser = await User.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updatedUser;
    },
    deleteUser: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User does not exist');
      }
      await User.findOneAndDelete({ _id: id });

      return 'User deleted';
    },

    // Categories
    newCategory: async (_, { input }) => {
      // Save new Category
      try {
        const category = new Category(input);
        const savedCategory = await category.save();
        return savedCategory;
      } catch (error) {
        // console.log(error);
      }
    },
    updateCategory: async (_, { id, input }) => {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Category does not exist');
      }
      const updatedCategory = await Category.findByIdAndUpdate(
        { _id: id },
        input,
        { new: true }
      );
      return updatedCategory;
    },
    deleteCategory: async (_, { id }) => {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Category does not exist');
      }
      await Category.findOneAndDelete({ _id: id });

      return 'Category deleted';
    },

    // Products
    newProduct: async (_, { input }) => {
      // Save new product
      try {
        const product = new Product(input);
        const savedProduct = await product.save();
        return savedProduct;
      } catch (error) {
        // console.log(error);
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

    // Orders
    newOrder: async (_, { input, userId }) => {
      // Save new Order
      try {
        const fullInput = input;
        fullInput.user = userId;
        const order = new Order(fullInput);
        const savedOrder = await order.save();
        return savedOrder;
      } catch (error) {
        // console.log(error);
      }
    },
    updateOrder: async (_, { id, input }) => {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order does not exist');
      }
      const updatedOrder = await Order.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updatedOrder;
    },
    deleteOrder: async (_, { id }) => {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order does not exist');
      }
      await Order.findOneAndDelete({ _id: id });

      return 'Order deleted';
    },

    // Posts
    newPost: async (_, { input, userId }) => {
      // Save new Post
      try {
        const fullInput = input;
        fullInput.user = userId;
        const post = new Post(fullInput);
        const savedPost = await post.save();
        return savedPost;
      } catch (error) {
        // console.log(error);
      }
    },
    updatePost: async (_, { id, input }) => {
      const post = await Post.findById(id);
      if (!post) {
        throw new Error('Post does not exist');
      }
      const updatedPost = await Post.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updatedPost;
    },
    deletePost: async (_, { id }) => {
      const post = await Post.findById(id);
      if (!post) {
        throw new Error('Post does not exist');
      }
      await Post.findOneAndDelete({ _id: id });

      return 'Post deleted';
    },

    // Answers
    newAnswer: async (_, { input, userId, postId }) => {
      // Save new Answer
      try {
        const fullInput = input;
        fullInput.user = userId;
        fullInput.post = postId;
        const answer = new Answer(fullInput);
        const savedAnswer = await answer.save();
        return savedAnswer;
      } catch (error) {
        // console.log(error);
      }
    },
    updateAnswer: async (_, { id, input }) => {
      const answer = await Answer.findById(id);
      if (!answer) {
        throw new Error('Answer does not exist');
      }
      const updatedAnswer = await Answer.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updatedAnswer;
    },
    deleteAnswer: async (_, { id }) => {
      const answer = await Answer.findById(id);
      if (!answer) {
        throw new Error('Answer does not exist');
      }
      await Answer.findOneAndDelete({ _id: id });

      return 'Answer deleted';
    },

    // Brands
    newBrand: async (_, { input }) => {
      // Save new Brand
      try {
        const brand = new Brand(input);
        const savedBrand = await brand.save();
        return savedBrand;
      } catch (error) {
        // console.log(error);
      }
    },
    updateBrand: async (_, { id, input }) => {
      const brand = await Brand.findById(id);
      if (!brand) {
        throw new Error('Brand does not exist');
      }
      const updatedBrand = await Brand.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updatedBrand;
    },
    deleteBrand: async (_, { id }) => {
      const brand = await Brand.findById(id);
      if (!brand) {
        throw new Error('Brand does not exist');
      }
      await Brand.findOneAndDelete({ _id: id });

      return 'Brand deleted';
    },

    // SImages
    newSImage: async (_, { input }) => {
      // Save new SImage
      try {
        const sImage = new Slider(input);
        const savedSImage = await sImage.save();
        return savedSImage;
      } catch (error) {
        // console.log(error);
      }
    },
    updateSImage: async (_, { id, input }) => {
      const sImage = await Slider.findById(id);
      if (!sImage) {
        throw new Error('SImage does not exist');
      }
      const updatedSImage = await Slider.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return updatedSImage;
    },
    deleteSImage: async (_, { id }) => {
      const sImage = await Slider.findById(id);
      if (!sImage) {
        throw new Error('SImage does not exist');
      }
      await Slider.findOneAndDelete({ _id: id });

      return 'SImage deleted';
    },
  },
};

module.exports = resolvers;
