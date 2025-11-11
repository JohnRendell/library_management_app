const express = require("express")
const route = express.Router()
const bookModelSchema = require("../models/bookModel");

route.get("/books", async (req, res)=>{
    try{
        const check_books = await bookModelSchema.find().sort({ bookID })
        
        let message = "OK: Successfully Retrieved all of the Books";
        let status = 200;

        if(check_books && check_books.length > 0){
            res.status(status).json({ message: message, check_books })
        }
        else{
            res.status(404).json({ message: "Not Found: Requested Resource Doesn't Exist" })
        }
        
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

route.post("/books", async (req, res)=>{
    try{
        const add_book = new bookModelSchema(req.body);
        const check_book = await bookModelSchema.find();
        let all_bookIDs = check_book.map(book => book.bookID);

        let message = "Created: Successfully Added a Book!";
        let status = 201;

        if (all_bookIDs.includes(add_book.bookID)) {
        res.status(400).json({ message: "Bad Request: BookID already exists!" });
        }
        else{
            await add_book.save();
            res.status(status).json({ message: message, add_book })
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

route.delete("/books/:id", async (req, res)=>{
    try{
        const delete_book = await bookModelSchema.findOneAndDelete({ bookID: Number(req.params.id) });
        let message = "Successfully Deleted a Book!";

        if(delete_book){
            res.status(200).json({ message: message })
        }
        else{
            res.status(400).json({ message: "Bad Request: Invalid Input!" })
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

route.patch("/books/:id", async (req, res)=>{
    try{
        const update_book = await bookModelSchema.findOneAndUpdate(
            { bookID: req.params.id },
            {   $set: {
                title: newTitle,
                author: newAuthor,
                genre: newGenre,
                publisher: newPublisher,
                publication_date: newDate,
                availability: newAvailability }},
            { new: true }
        );
        let message = "Successfully Updated a Book!";

        if(update_book){
            res.status(200).json({ message: message })
        }
        else{
            res.status(400).json({ message: "Bad Request: Invalid Input!" })
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

route.patch("/books/bulk", async (req, res) => {
    try {
        const { bookIDs, title, author, genre, publisher, publication_date, availability } = req.body;

        // sa curl "bookIDs": [1, 3, 5], "title": "New_Title"
        const updateResult = await bookModelSchema.updateMany(
            { bookID: { $in: bookIDs } },
            { $set: { title, author, genre, publisher, publication_date, availability } }
        );

        if (updateResult.matchedCount > 0) {
            res.status(200).json({ 
                message: "OK: Successfully Updated Selected Books!", 
                matched: updateResult.matchedCount, 
                modified: updateResult.modifiedCount 
            });
        } else {
            res.status(400).json({ message: "Bad Request: No matching books found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Error" });
    }
});
















module.exports = route