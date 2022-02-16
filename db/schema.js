const { gql } = require("apollo-server");

// Schema
const typeDefs = gql`
  type User {
    name: String
    lastName: String
    email: String
    created: String
  }

  type Token {
    token: String
  }

  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  input AuthenticateInput {
    email: String!
    password: String!
  }

  type Query {
    getUserByToken(token: String!): User
  }

  type Mutation {
    newUser(input: UserInput): User
    authenticateUser(input: AuthenticateInput): Token
  }
`;

module.exports = typeDefs;
