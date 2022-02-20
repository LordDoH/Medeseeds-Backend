const jwt = require('jsonwebtoken');
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
require('dotenv').config();

const connectDB = require('./config/database');

// Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      try {
        const user = jwt.verify(token, process.env.PALABRA_SECRETA);
        return { user };
      } catch (error) {
        // console.log(error)
      }
    }
  },
});

// Initialize server
server.listen().then(({ url }) => {
  console.log(`Server listen on ${url}`);
});

// Connect DB
connectDB();
