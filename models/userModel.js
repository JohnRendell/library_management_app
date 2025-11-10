const mongoose = require("mongoose");
const database = require("./database_config")

const userModelSchema = new mongoose.Schema({
    userID: { type: Number, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }, 
    borrowedBooks: { type: Array, required: true }
});

module.exports = database.model("account", userModelSchema)