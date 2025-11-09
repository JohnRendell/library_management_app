const mongoose = require("mongoose")

const user_model = new mongoose.Schema({
    userID: { type: Number, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }, 
});

module.exports = mongoose.model("account", user_model)