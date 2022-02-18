const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
  # Types

  # User
  type User {
    id: ID
    name: String
    lastName: String
    email: String
    created: String
    address: String
    telephone: String
  }

  type Token {
    token: String
  }

  type Order {
    order: ID
  }

  type Profile {
    id: ID
    name: String
    lastName: String
    email: String
    created: String
    photo: String
    orders: [Order]
    role: Roles
  }

  enum Roles {
    user
    sales
    admin
  }

  # Categories
  type ProductId {
    id: ID
  }

  type Category {
    id: ID
    title: String
    description: String
    brands: [String]
    image: String
    products: [ProductId]
  }

  # Products
  type Product {
    id: ID
    title: String
    description: String
    brand: String
    image: String
    secondaryImages: [String]
    price: Float
    stock: Int
    tags: [String]
  }

  # Orders
  type ProductCart {
    product: ID
    quantity: Float
  }

  type Order {
    id: ID
    user: ID
    status: Status
    total: Float
    products: [ProductCart]
  }

  enum Status {
    NotPaid
    InProcess
    Sent
    Finished
  }

  # Posts
  type Post {
    id: ID
    title: String
    description: String
    creator: String
    creatorEmail: String
    creatorLink: String
    image: String
    user: ID
  }

  # Answers
  type Like {
    like: ID
  }

  type Answer {
    id: ID
    content: String
    likes: [Like]
    user: ID
    post: ID
  }

  # Brands
  type Brand {
    id: ID
    name: String
    logo: String
  }

  # Sliderimages
  type SImage {
    id: ID
    image: String
  }

  # Inputs

  # User
  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  input PurchasedInput {
    order: ID
  }

  input ProfileInput {
    name: String
    lastName: String
    email: String
    created: String
    active: Boolean
    photo: String
    orders: [PurchasedInput]
    role: Roles
    address: String
    telephone: String
  }

  input AuthenticateInput {
    email: String!
    password: String!
  }

  # Categories
  input ProductIdInput {
    id: ID
  }

  input CategoryInput {
    title: String
    description: String
    brands: [String]
    image: String
    products: [ProductIdInput]
  }

  # Products
  input ProductInput {
    title: String
    description: String
    brand: String
    image: String
    secondaryImages: [String]
    price: Float
    stock: Int
    tags: [String]
  }

  # Orders
  input ProductCartInput {
    product: ID
    quantity: Float
  }
  input OrderInput {
    status: Status
    total: Float
    products: [ProductCartInput]
  }

  # Posts
  input PostInput {
    title: String
    description: String
    creator: String
    creatorEmail: String
    creatorLink: String
    image: String
  }

  # Answers
  input LikeInput {
    like: ID
  }
  input AnswerInput {
    content: String
    likes: [LikeInput]
  }

  # Brands
  input BrandInput {
    name: String
    logo: String
  }

  # SliderImages
  input SImageInput {
    image: String
  }

  # Queries

  type Query {
    # User
    getUsers: [User]
    getUserByToken(token: String!): User
    getUser(id: ID!): Profile

    # Categories
    getCategories: [Category]
    getCategory(id: ID!): Category

    # Products
    getProducts: [Product]
    getLatestProducts: [Product]
    getProductsByCategory(categoryId: ID!): [Product]
    getProduct(id: ID!): Product

    # Orders
    getOrders: [Order]
    getOrdersByUser: [Order]
    getOrdersByUserEmail(userEmail: String!): [Order]
    getOrder(id: ID!): Order

    # Posts
    getPosts: [Post]
    getPostsByPage(page: Int!): [Post]
    getPost(id: ID!): Post

    # Answers
    getAnswers: [Answer]
    getAnswersByPost(postId: ID!): [Answer]
    getAnswer(id: ID!): Answer

    # Brands
    getBrands: [Brand]
    getBrand(id: ID!): Brand

    # SliderImages
    getSImages: [SImage]
    getSImage(id: ID!): SImage
  }

  # Mutations

  type Mutation {
    # Users
    newUser(input: UserInput): User
    updateUser(id: ID!, input: ProfileInput): Profile
    deleteUser(id: ID!): String
    authenticateUser(input: AuthenticateInput): Token

    # Categories
    newCategory(input: CategoryInput): Category
    updateCategory(id: ID!, input: CategoryInput): Category
    deleteCategory(id: ID!): String

    # Products
    newProduct(input: ProductInput): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Orders
    newOrder(input: OrderInput, email: String): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String

    # Posts
    newPost(input: PostInput): Post
    updatePost(id: ID!, input: PostInput): Post
    deletePost(id: ID!): String

    # Answers
    newAnswer(input: AnswerInput, postId: ID!): Answer
    updateAnswer(id: ID!, input: AnswerInput): Answer
    deleteAnswer(id: ID!): String

    # Brands
    newBrand(input: BrandInput): Brand
    updateBrand(id: ID!, input: BrandInput): Brand
    deleteBrand(id: ID!): String

    # SliderImages
    newSImage(input: SImageInput): SImage
    updateSImage(id: ID!, input: SImageInput): SImage
    deleteSImage(id: ID!): String
  }
`;

module.exports = typeDefs;
