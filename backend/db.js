const mongoose = require('mongoose');

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo Successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectToMongo;