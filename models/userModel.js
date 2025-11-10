const mongoose = require("mongoose");
const database = require("./database_config")
const bookModelSchema = require("../models/bookModel");

const userModelSchema = new mongoose.Schema({
    userID: { type: Number, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true }, 
    // STORES REFERENCE NG BOOK SA MAY BOOK MODEL SCHEMA NAKA COMMENT MUNA PARA MA CHECK NYO
    // HINDI UNG bookID kinukuha nito bale ung mismong ObjectId ng isang object sa schema ung kinukuha nya ung katulad nito ObjectId("6563f1a1a0b5c3e7a9d12345")
    // borrowedBooks: [{ type: Schema.Types.ObjectId, ref: 'Books' }]
});

const Books = mongoose.model('Books', bookModelSchema);

module.exports = database.model("account", userModelSchema)