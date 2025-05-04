const mongoose = require('mongoose');

const connectToMongo = async() =>{
   try{
    mongoose.connect(process.env.MONGO_URI);
    console.log("connected MongoDb successfully");
   } catch (err){
    console.error("Connection error:", err);
   }
};

module.exports = connectToMongo;