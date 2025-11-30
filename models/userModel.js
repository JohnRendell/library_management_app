const mongoose = require("mongoose");
const database = require("./database_config")
const bookModelSchema = require("../models/bookModel");
const { Schema } = mongoose;

const userModelSchema = new mongoose.Schema({
    userID: { type: Number, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }, 
    borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }]
});

module.exports = database.model("account", userModelSchema)