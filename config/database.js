const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Conection to DB is successful 👨‍🚀!');
  } catch (error) {
    console.log('There was an error: ', error);
    process.exit(1); // Stop server
  }
};

module.exports = connectDB;
