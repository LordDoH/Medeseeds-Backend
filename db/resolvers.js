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

  const { id, name, email, role } = user;

  return jwt.sign({ id, name, email, role }, secret, { expiresIn });
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
    getUsers: async () => {
      try {
        const users = await User.find({});
        return users;
      } catch (error) {
        // console.log(error);
      }
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
    getLatestProducts: async () => {
      try {
        const products = await Product.find({}).sort({ created: -1 }).limit(5);
        return products;
      } catch (error) {
        // console.log(error);
      }
    },
    getProductsByCategory: async (_, { categoryId }) => {
      try {
        const products = await Product.find({ category: categoryId });
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
    getOrdersByUser: async (_, __, ctx) => {
      try {
        const orders = await Order.find({ user: ctx.user.id });
        return orders;
      } catch (error) {
        // console.log(error);
      }
    },
    getOrdersByUserEmail: async (_, { userEmail }) => {
      try {
        const user = await User.findOne({ email: userEmail });
        const orders = await Order.find({ user: user.id });
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
        const posts = await Post.find({}).sort({ created: -1 });
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
    getPostsByPage: async (_, { page }) => {
      try {
        const posts = await Post.find({})
          .sort({ created: -1 })
          .limit(10)
          .skip((page - 1) * 10);
        return posts;
      } catch (error) {
        // console.log(error);
      }
    },

    // Answers
    getAnswers: async () => {
      try {
        const answers = await Answer.find({}).sort({ created: -1 });
        return answers;
      } catch (error) {
        // console.log(error);
      }
    },
    getAnswersByPost: async (_, { postId }) => {
      try {
        const answers = await Answer.find({ post: postId }).sort({
          created: -1,
        });
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
    updateUser: async (_, { id, input }, ctx) => {
      if (ctx.user.id === id || ctx.user.role === 'admin') {
        const user = await User.findById(id);
        if (!user) {
          throw new Error('User does not exist');
        }
        const updatedUser = await User.findByIdAndUpdate({ _id: id }, input, {
          new: true,
        });
        return updatedUser;
      }
      throw new Error('Unauthorized');
    },
    // Delete participation in orders, post and answers
    deleteUser: async (_, { id }, ctx) => {
      if (ctx.user.id === id || ctx.user.role === 'admin') {
        const user = await User.findById(id);
        // check if user exists
        if (!user) {
          throw new Error('User does not exist');
        }
        // delete user orders
        const orders = await Order.find({ user: id });
        console.log(orders);
        const answers = await Answer.find({ user: id });
        console.log(answers);
        const posts = await Post.find({ user: id });
        console.log(posts);

        // await User.findOneAndDelete({ _id: id });

        return 'User deleted';
      }
      throw new Error('Unauthorized');
    },

    // Categories
    newCategory: async (_, { input }, ctx) => {
      // Save new Category
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const categoryExists = await Category.findOne({ title: input.title });
        if (categoryExists) {
          throw new Error('The category already exists');
        }
        try {
          const category = new Category(input);
          const savedCategory = await category.save();
          return savedCategory;
        } catch (error) {
          // console.log(error);
        }
      }
      throw new Error('Unauthorized');
    },
    updateCategory: async (_, { id, input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
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
      }
      throw new Error('Unauthorized');
    },
    deleteCategory: async (_, { id }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const category = await Category.findById(id);
        if (!category) {
          throw new Error('Category does not exist');
        }
        await Category.findOneAndDelete({ _id: id });

        return 'Category deleted';
      }
      throw new Error('Unauthorized');
    },

    // Products
    newProduct: async (_, { input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const productExists = await Product.findOne({ title: input.title });
        if (productExists) {
          throw new Error('The product already exists');
        }
        // Save new product
        try {
          const product = new Product(input);
          const savedProduct = await product.save();
          return savedProduct;
        } catch (error) {
          // console.log(error);
        }
      }
      throw new Error('Unauthorized');
    },
    updateProduct: async (_, { id, input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
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
      }
      throw new Error('Unauthorized');
    },
    deleteProduct: async (_, { id }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const product = await Product.findById(id);
        if (!product) {
          throw new Error('Product does not exist');
        }
        await Product.findOneAndDelete({ _id: id });

        return 'Product deleted';
      }
      throw new Error('Unauthorized');
    },

    // Orders
    newOrder: async (_, { input, email }, ctx) => {
      let orderUserId = ctx.user.id;
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const user = await User.findOne({ email });
        orderUserId = user.id;
      }
      // Check product availability
      // eslint-disable-next-line
      for await (const art of input.products) {
        console.log(art);
        const { product } = art;
        console.log(product);
        const findProduct = await Product.findById(product);
        console.log(findProduct);
        if (art.quantity > findProduct.stock) {
          throw new Error(`Not enough stock of ${findProduct.title}`);
        }
      }

      // Save new Order
      try {
        const fullInput = input;
        fullInput.user = orderUserId;
        const order = new Order(fullInput);
        const savedOrder = await order.save();
        // Discount products from stock
        // eslint-disable-next-line
        for await (const art of input.products) {
          const { product } = art;
          const findProduct = await Product.findById(product);
          const discount = findProduct.stock - art.quantity;
          await Product.findByIdAndUpdate(
            { _id: product },
            { stock: discount },
            {
              new: true,
            }
          );
        }
        return savedOrder;
      } catch (error) {
        // console.log(error);
      }
    },
    updateOrder: async (_, { id, input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const order = await Order.findById(id);
        if (!order) {
          throw new Error('Order does not exist');
        }
        const updatedOrder = await Order.findByIdAndUpdate({ _id: id }, input, {
          new: true,
        });
        return updatedOrder;
      }
      throw new Error('Unauthorized');
    },
    deleteOrder: async (_, { id }, ctx) => {
      const order = await Order.findById(id);
      if (
        ctx.user.role === 'admin' ||
        ctx.user.role === 'sales' ||
        ctx.user.id === order.user
      ) {
        if (!order) {
          throw new Error('Order does not exist');
        }
        await Order.findOneAndDelete({ _id: id });

        return 'Order deleted';
      }
      throw new Error('Unauthorized');
    },

    // Posts
    newPost: async (_, { input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        // Save new Post
        try {
          const fullInput = input;
          fullInput.user = ctx.user.id;
          const post = new Post(fullInput);
          const savedPost = await post.save();
          return savedPost;
        } catch (error) {
          // console.log(error);
        }
      }
      throw new Error('Unauthorized');
    },
    updatePost: async (_, { id, input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post does not exist');
        }
        const updatedPost = await Post.findByIdAndUpdate({ _id: id }, input, {
          new: true,
        });
        return updatedPost;
      }
      throw new Error('Unauthorized');
    },
    deletePost: async (_, { id }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post does not exist');
        }
        await Post.findOneAndDelete({ _id: id });

        return 'Post deleted';
      }
      throw new Error('Unauthorized');
    },

    // Answers
    newAnswer: async (_, { input, postId }, ctx) => {
      // Save new Answer
      try {
        const fullInput = input;
        fullInput.user = ctx.user.id;
        fullInput.post = postId;
        const answer = new Answer(fullInput);
        const savedAnswer = await answer.save();
        return savedAnswer;
      } catch (error) {
        // console.log(error);
      }
    },
    updateAnswer: async (_, { id, input }, ctx) => {
      const answer = await Answer.findById(id);
      if (ctx.user.id === answer.user || ctx.user.role === 'admin') {
        if (!answer) {
          throw new Error('Answer does not exist');
        }
        const updatedAnswer = await Answer.findByIdAndUpdate(
          { _id: id },
          input,
          {
            new: true,
          }
        );
        return updatedAnswer;
      }
      throw new Error('Unauthorized');
    },
    deleteAnswer: async (_, { id }, ctx) => {
      const answer = await Answer.findById(id);
      if (ctx.user.id === answer.user.toString() || ctx.user.role === 'admin') {
        if (!answer) {
          throw new Error('Answer does not exist');
        }
        await Answer.findOneAndDelete({ _id: id });

        return 'Answer deleted';
      }
      throw new Error('Unauthorized');
    },

    // Brands
    newBrand: async (_, { input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const brandExists = await Brand.findOne({ name: input.name });
        if (brandExists) {
          throw new Error('The Brand already exists');
        }
        // Save new Brand
        try {
          const brand = new Brand(input);
          const savedBrand = await brand.save();
          return savedBrand;
        } catch (error) {
          // console.log(error);
        }
      }
      throw new Error('Unauthorized');
    },
    updateBrand: async (_, { id, input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const brand = await Brand.findById(id);
        if (!brand) {
          throw new Error('Brand does not exist');
        }
        const updatedBrand = await Brand.findByIdAndUpdate({ _id: id }, input, {
          new: true,
        });
        return updatedBrand;
      }
      throw new Error('Unauthorized');
    },
    deleteBrand: async (_, { id }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const brand = await Brand.findById(id);
        if (!brand) {
          throw new Error('Brand does not exist');
        }
        await Brand.findOneAndDelete({ _id: id });

        return 'Brand deleted';
      }
      throw new Error('Unauthorized');
    },

    // SImages
    newSImage: async (_, { input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const imageExists = await Slider.findOne({ image: input.image });
        if (imageExists) {
          throw new Error('The Image already exists');
        }
        // Save new SImage
        try {
          const sImage = new Slider(input);
          const savedSImage = await sImage.save();
          return savedSImage;
        } catch (error) {
          // console.log(error);
        }
      }
      throw new Error('Unauthorized');
    },
    updateSImage: async (_, { id, input }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const sImage = await Slider.findById(id);
        if (!sImage) {
          throw new Error('SImage does not exist');
        }
        const updatedSImage = await Slider.findByIdAndUpdate(
          { _id: id },
          input,
          {
            new: true,
          }
        );
        return updatedSImage;
      }
      throw new Error('Unauthorized');
    },
    deleteSImage: async (_, { id }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const sImage = await Slider.findById(id);
        if (!sImage) {
          throw new Error('SImage does not exist');
        }
        await Slider.findOneAndDelete({ _id: id });

        return 'SImage deleted';
      }
      throw new Error('Unauthorized');
    },
  },
};

module.exports = resolvers;
