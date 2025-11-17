const mongoose = require("mongoose");
const database = require("./database_config")


const bookModelSchema = new mongoose.Schema({
    bookID: { type: Number, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true }, 
    genre: { type: String, required: true }, 
    publisher: { type: String, required: true }, 
    // "YYYY-MM-DD"
    publication_date: { type: String, required: true},
    is_available: { type: Boolean, required: true}
});


module.exports = database.model("book", bookModelSchema)