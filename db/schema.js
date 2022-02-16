const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
  # Types

  # User
  type User {
    name: String
    lastName: String
    email: String
    created: String
  }

  type Token {
    token: String
  }

  #Products
  type Product {
    id: ID
    title: String
    description: String
    brand: String
    image: String
    secondaryImages: String
    price: Float
    stock: Int
    tags: [String]
  }

  # Inputs

  # User
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

  # Products
  input ProductInput {
    title: String!
    description: String!
    brand: String!
    image: String!
    secondaryImages: [String]
    price: Float!
    stock: Int!
    tags: [String]
  }

  # Queries

  type Query {
    # User
    getUserByToken(token: String!): User

    # Products
    getProducts: [Product]
    getProduct(id: ID!): Product
  }

  # Mutations

  type Mutation {
    # Users
    newUser(input: UserInput): User
    authenticateUser(input: AuthenticateInput): Token

    # Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String
  }
`;

module.exports = typeDefs;
