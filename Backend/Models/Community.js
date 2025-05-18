 const mongoose = require('mongoose');
 const communitySchema = new mongoose.Schema({
    sender : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    topic: {type: String, required: true},
    likes: {type: Number ,default: 0 },
     
 })
 module.exports = mongoose.model("Community", communitySchema);