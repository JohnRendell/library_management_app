const express = require("express")
const route = express.Router()
const bookModelSchema = require("../models/bookModel");



// get all books
route.get("/books", async (req, res)=>{
    try{
        const check_books = await bookModelSchema.find().sort({ createdAt: -1 })
        
        let message = "OK: Successfully Retrieved all of the Books";
        let status = 200;

        if(check_books){
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

// get book by id
route.get("/books/:id", async (req, res)=>{
    try{
        const check_book = await bookModelSchema.findOne({bookID: Number(req.params.id) })
        let message = "OK: Successfully Retrieved the Book";
        let status = 200;

        if(check_book){
            res.status(status).json({ message: message, check_book })
        }
        else{
            res.status(404).json({ message: "Not Found: BookID Doesn't Exist!" })
        }
        
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

// add book
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

// delete multiple book entries
route.delete("/books/bulk", async (req, res) => {
    try {
        console.log("Atleast this works");

        
        const book_ids = req.body.book_ids;

         if (!Array.isArray(book_ids) || book_ids.length === 0) {
            return res.status(400).json({ message: "Bad Request: Provide an array of bookIDs" });
        }

        const delete_book = await bookModelSchema.deleteMany({ bookID: { $in: book_ids } });

        let message = "Successfully Deleted Books!";

        if(delete_book){
            res.status(200).json({
                message: message,
                deleted_ids: book_ids,
                no_of_books_deleted : delete_book
             })
        }

        
    } catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
})  


// delete book
route.delete("/books/:id", async (req, res)=>{
    try {
        const book_id = Number(req.params.id)
        const delete_book = await bookModelSchema.findOneAndDelete({ bookID: book_id });
        let message = "Successfully Deleted a Book!";

        if(delete_book){
            res.status(200).json({ message: message })
        }
        else{
            res.status(400).json({ message: "Bad Request: Invalid Input!" })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({ message: "First delete Internal Error"})
    }
});



// update book
route.patch("/books/:id", async (req, res)=>{
    try{
        const updates = req.body;
        const update_book = await bookModelSchema.findOneAndUpdate(
            { bookID: Number(req.params.id) },
            {   $set: { ...updates }},
            { new: true }
        );
        let message = "Successfully Updated a Book!";

        if(update_book){
            res.status(200).json({
                message: message,
                content: update_book
            })
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

// update multiple books
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



// borrow multiple books
route.patch("/books/bulk/borrow", async (req, res) => {
    try {
        
        const book_ids = req.body.book_ids;
        
        if (!Array.isArray(book_ids) || book_ids.length === 0) {
            res.status(400).json({
                message: "Bad Request: Provide an array of bookIDs"
            })
        } 

        const borrowed_books = await bookModelSchema.updateMany({ bookID: { $in: book_ids } },
            { $set: { is_available : false } },
            { new: true }) 
        
        if (borrowed_books) {
            res.status(200).json({
                message: "Successfully borrowed books",
                no_of_books_borrowed: borrowed_books.matchedCount,
                borrowed_book_ids: book_ids
            })
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});
// return multiple books
route.patch("/books/bulk/return", async (req, res) => {
    try {
        const book_ids = req.body.book_ids
        
        if (!Array.isArray(book_ids) || book_ids.length === 0) {
            res.status(400).json({
                message: "Bad Request: Provide an array of bookIDs"
            })
        }

        const returned_books = await bookModelSchema.updateMany(
            { bookID: { $in: book_ids } },
            { $set: { is_available: true } },
            {new:true}
        )
        if (returned_books) {
            res.status(200).json({
                message: "Successfully borrowed books",
                no_of_books_: borrowed_books.matchedCount,
                returned_book_ids: book_ids
            })
        }

    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
  
});


// borrow a book
route.patch("/books/:id/borrow", async (req, res) => {
    try {
        const book_id = parseInt(req.params.id);

        let update_book = await bookModelSchema.findOneAndUpdate(
            { bookID: book_id },
            { $set: { is_available: false } },
            { new: true }
        )
        if (update_book) {
            res.status(200).json({
                message: "book sucessfully borrowed",
                content: update_book
            })
        };
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Error" })
    }
});

// return a book
route.patch("/books/:id/return", async (req, res) => {
    try {
        const book_id = parseInt(req.params.id);

        let update_book = await bookModelSchema.findOneAndUpdate(
            { bookID: book_id },
            { $set: { is_available: true } },
            { new: true }
        )
        if (update_book) {
            res.status(200).json({
                message: "book sucessfully returned",
                content: update_book
            })
        };
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Error" })
    }
});



module.exports = route
