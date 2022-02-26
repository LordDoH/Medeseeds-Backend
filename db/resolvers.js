const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary');
const User = require('../models/user');
const Product = require('../models/products');
const Category = require('../models/categories');
const Order = require('../models/orders');
const Post = require('../models/posts');
const Answer = require('../models/answer');
const Brand = require('../models/brands');
const Slider = require('../models/sliderimages');
const { payMercadoPago } = require('../utils/payment');
const { sendEmail } = require('../utils/email');

require('dotenv').config();

const createToken = (user, secret, expiresIn) => {
  // console.log(user);

  const { id, name, lastName, email, role, photo, address, telephone } = user;

  return jwt.sign(
    { id, name, lastName, email, role, photo, address, telephone },
    secret,
    { expiresIn }
  );
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
    getUserByEmail: async (_, { email }) => {
      const user = await User.findOne({ email });
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
    getCategoryTitleByProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      const category = await Category.findOne({ _id: product.category });
      if (!category) {
        throw new Error('Category does not exist');
      }
      return category.title;
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
    getLikedProducts: async () => {
      try {
        const products = await Product.find({}).sort({ stock: -1 }).limit(5);
        return products;
      } catch (error) {
        // console.log(error);
      }
    },
    getProductsByCategory: async (_, { categoryTitle }) => {
      try {
        const category = await Category.findOne({ title: categoryTitle });
        // eslint-disable-next-line
        const products = await Product.find({ category: category._id });
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
        const orders = await Order.find({ user: ctx.user.id }).sort({
          created: -1,
        });
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
        const newUser = input;

        const hash = crypto
          .createHash('sha256')
          .update(newUser.email)
          .digest('hex');

        newUser.passwordResetToken = hash;
        newUser.passwordResetExpires = Date.now() + 3600000 * 24;
        const user = await new User(newUser);
        user.save();
        const emailVer = {
          to: user.email, // Change to your recipient
          from: 'No Reply<medeseeds@gmail.com>', // Change to your verified sender
          template_id: 'd-becfee670308409992383b11d6f6aa02',
          dynamic_template_data: {
            subjecto: `Please activate your account ${user.name}!`,
            fullname: user.name,
            username: user.name,
            urlx: `${
              process.env.FRONT_HOST || 'http://localhost:3000/'
            }activate/${hash}`,
          },
        };

        sendEmail(emailVer);

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
    authenticateUserVer: async (_, { input }) => {
      // Check if user exists
      const { email } = input;
      const userExists = await User.findOne({ email });
      if (!userExists) {
        throw new Error('The user has not registered yet.');
      }
      // Check password
      if (userExists.verified === false) {
        throw new Error('User has not verified email');
      }

      // Generate Token
      return {
        token: createToken(userExists, process.env.PALABRA_SECRETA, '24h'),
        verified: userExists.verified,
      };
    },
    updateUser: async (_, { id, input }, ctx) => {
      if (ctx.user.id === id || ctx.user.role === 'admin') {
        const data = input;
        if (ctx.user.role === 'user') {
          data.role = 'user';
        }
        const user = await User.findById(id);
        if (!user) {
          throw new Error('User does not exist');
        }
        const updatedUser = await User.findByIdAndUpdate({ _id: id }, data, {
          new: true,
        });
        return {
          token: createToken(updatedUser, process.env.PALABRA_SECRETA, '24h'),
        };
      }
      throw new Error('Unauthorized');
    },
    validateUser: async (_, { input }) => {
      const { passwordResetToken } = input;
      const user = await User.findOne({ passwordResetToken });
      if (!user) {
        throw new Error('Invalid token');
      }
      if (Date.now() > user.passwordResetExpires) {
        throw new Error('Token expired');
      }
      user.verified = true;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      return user;
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
    // Images
    uploadPhoto: async (_, { photo }, ctx) => {
      if (ctx.user.role) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        try {
          const resulting = await cloudinary.v2.uploader.upload(
            photo.path,
            {
              allowed_formats: ['jpg', 'png'],
              public_id: '',
              folder: 'Uploaded-Pictures',
            },
            (error, result) => {
              console.log(result, error);
            }
          );
          return resulting.url;
        } catch (e) {
          return `Image could not be uploaded:${e.message}`;
        }
      }
    },
    deletePhoto: async (_, { photo }, ctx) => {
      if (ctx.user.role) {
        const photoid = photo.split('/').pop().split('.')[0];
        console.log(photoid);
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        try {
          await cloudinary.v2.uploader.destroy(photoid, (error, result) => {
            console.log(result, error);
          });
        } catch (e) {
          return `Image could not be erased:${e.message}`;
        }
      }
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
    newProduct: async (_, { input, title }, ctx) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'sales') {
        const category = await Category.findOne({ title });
        const data = input;
        data.category = category.id;
        const productExists = await Product.findOne({ title: input.title });
        if (productExists) {
          throw new Error('The product already exists');
        }
        // Save new product
        try {
          const product = new Product(data);
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
        const { productId } = art;
        const findProduct = await Product.findOne({ _id: productId });
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
          const { productId } = art;
          const findProduct = await Product.findOne({ _id: productId });
          const discount = findProduct.stock - art.quantity;
          await Product.findByIdAndUpdate(
            { _id: productId },
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
    newPayment: async (_, { input }) => {
      const preference = {
        items: input.products.map((e) => ({
          title: e.title,
          quantity: e.quantity,
          unit_price: e.unit_price,
        })),
        back_urls: {
          success: `${
            process.env.FRONT_HOST || 'http://localhost:3000/'
          }orderresume/success`,
          failure: `${
            process.env.FRONT_HOST || 'http://localhost:3000/'
          }orderresume/failed`,
          pending: `${
            process.env.FRONT_HOST || 'http://localhost:3000/'
          }orderresume/pending`,
        },
      };

      const response = await payMercadoPago(preference);
      console.log('Respuest mercadopago: ', response.body.id);
      return response.body.id;
    },
    updateOrder: async (_, { id, input }, ctx) => {
      const order = await Order.findById(id);
      console.log(order.user.toString());
      console.log(ctx.user.id);
      if (
        ctx.user.role === 'admin' ||
        ctx.user.role === 'sales' ||
        ctx.user.id === order.user.toString()
      ) {
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
    updateOrders: async (_, __, ctx) => {
      const orders = await Order.find({ user: ctx.user.id });
      if (orders) {
        for (let i = 0; i < orders.length; i += 1) {
          if (orders[i].status === 'InProcess') {
            try {
              console.log(orders[i].mercadoPagoId);
              fetch(
                `https://api.mercadopago.com/v1/payments/${orders[i].mercadoPagoId}`,
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                  },
                }
              )
                .then((res) => res.json())
                .then(async (json) => {
                  console.log(json.status, orders[i].id);
                  if (json.status === 'approved') {
                    try {
                      await Order.findOneAndUpdate(
                        { _id: orders[i].id },
                        { status: 'Paid' },
                        { new: true }
                      );
                    } catch (e) {
                      console.log(e);
                    }
                  }
                });
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
      return orders;
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
