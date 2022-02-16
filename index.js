const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");

const connectDB = require("./config/database");

// Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const myContext = "Hola";

    return {
      myContext,
    };
  },
});

// Initialize server
server.listen().then(({ url }) => {
  console.log(`Server listen on ${url}`);
});

// Connect DB
connectDB();
