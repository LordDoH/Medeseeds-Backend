const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const createToken = (user, secret, expiresIn) => {
  console.log(user);

  const { name, email } = user;

  return jwt.sign({ name, email }, secret, { expiresIn });
};

// Resolvers
const resolvers = {
  Query: {
    getUserByToken: async (_, { token }) => {
      const userEmail = await jwt.verify(token, process.env.PALABRA_SECRETA);

      return userEmail;
    },
  },
  Mutation: {
    newUser: async (_, { input }) => {
      const { email } = input;
      // Check if user is registered
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error("The user is already registered");
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
        throw new Error("The user has not registered yet.");
      }

      // Check password
      const isMatch = await userExists.comparePassword(password);
      if (!isMatch) {
        throw new Error("Wrong password.");
      }

      // Generate Token
      return {
        token: createToken(userExists, process.env.PALABRA_SECRETA, "24h"),
      };
    },
  },
};

module.exports = resolvers;
