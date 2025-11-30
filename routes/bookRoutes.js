const express = require("express")
const route = express.Router()
const bookModelSchema = require("../models/bookModel");

//middleware
const { validate_book_fields } = require("../middleware/bookMiddleware");
/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Retrieve all books
 *     tags: ["Books"]
 *     description: Returns a list of all books sorted by newest first
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           example: "Mystery"
 *         description: Filter books by genre
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filter books by availability
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: Successfully retrieved all books
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OK: Successfully Retrieved all of the Books"
 *                 check_books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */
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
/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Retrieve book by ID
 *     tags: ["Books"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 101
 *         description: Numeric Book ID to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the book
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OK: Successfully Retrieved the Book"
 *                 check_book:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found: BookID Doesn't Exist!"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */

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
/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Create a new book
 *     tags: ["Books"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - genre
 *               - publisher
 *               - publication_date
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Book Title
 *               author:
 *                 type: string
 *                 example: John Smith
 *               genre:
 *                 type: string
 *                 example: Fiction
 *               publisher:
 *                 type: string
 *                 example: ABC Press
 *               publication_date:
 *                 type: string
 *                 example: 2023-10-25
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Created: Successfully Added a Book!'
 *                 add_book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: BookID already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Bad Request: BookID already exists!'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Internal Error'
 */

// add book
route.post("/books", validate_book_fields, async (req, res)=>{
    try{
        const { title, author, genre, publisher, publication_date } = req.body;

        const check_book = await bookModelSchema.find({}, { bookID: 1, _id: 0 });
        let all_bookIDs = check_book.map(book => book.bookID);
        let newBookID = 1;

        while (all_bookIDs.includes(newBookID)) {
            newBookID++;
        }

        let isBookCreated = await bookModelSchema.create({ bookID: newBookID, title: title, author: author, genre: genre, publisher: publisher, publication_date: publication_date, is_available: true })

        if(!isBookCreated){
            return res.status(400).json({ message: "Book creation failed, try again"})
        }
        return res.status(201).json({ message: "Created book successfully", add_books: isBookCreated })
    }
    catch(err){
        return res.status(500).json({ message: "Internal Error", logs: err })
    }
});
/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: ["Books"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 101
 *         description: Numeric Book ID to delete
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully Deleted a Book!"
 *       404:
 *         description: Book not found
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found: BookID Doesn't Exist!"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */
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
/**
 * @swagger
 * /api/v1/books/{id}:
 *   patch:
 *     summary: Update a book by ID
 *     tags: ["Books"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - genre
 *               - publisher
 *               - publication_date
 *               - is_available
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Book Title
 *               author:
 *                 type: string
 *                 example: John Smith
 *               genre:
 *                 type: string
 *                 example: Fiction
 *               publisher:
 *                 type: string
 *                 example: ABC Press
 *               publication_date:
 *                 type: string
 *                 example: 2023-10-25
 *               is_available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully Updated a Book!"
 *                 content:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found: BookID Doesn't Exist!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */


// update book
route.patch("/books/:id", validate_book_fields, async (req, res)=>{
    try{
        const { title, author, genre, publisher, publication_date, is_available } = req.body;
        const availability = typeof is_available === "boolean" ? is_available : false;
  
        const update_book = await bookModelSchema.findOneAndUpdate(
            { bookID: Number(req.params.id) },
            { $set: { title: title, author: author, publisher: publisher, genre: genre, publication_date: publication_date, is_available: availability }},
            { new: true }
        );

        if(!update_book){
            return res.status(404).json({ message: "Not Found: BookID Doesn't Exist!" })
        }
        res.status(200).json({message: "Successfully Updated a book", content: update_book})
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ message: "Internal Error"})
    }
});
/**
 * @swagger
 * /api/books/bulk:
 *   delete:
 *     summary: Delete multiple books by IDs
 *     tags: ["Books"]
 *     requestBody:
 *       required: true
 *       content:
 *         "application/json":
 *           schema:
 *             type: object
 *             required:
 *               - book_ids
 *             properties:
 *               book_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   format: int32
 *                 minItems: 1
 *                 maxItems: 50
 *                 example: [101, 102, 103]
 *           example:
 *             book_ids: [101, 102, 103]
 *     responses:
 *       200:
 *         description: Books deleted successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully Deleted Books!"
 *                 deleted_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [101, 102, 103]
 *                 no_of_books_deleted:
 *                   type: object
 *                   properties:
 *                     acknowledged:
 *                       type: boolean
 *                     deletedCount:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid book_ids array
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad Request: Provide an array of bookIDs"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */

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
/**
 * @swagger
 * /api/v1/books/bulk/borrow:
 *   patch:
 *     summary: Borrow multiple books by IDs
 *     tags: ["Books"]
 *     requestBody:
 *       required: true
 *       content:
 *         "application/json":
 *           schema:
 *             type: object
 *             required:
 *               - book_ids
 *             properties:
 *               book_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   format: int32
 *                 minItems: 1
 *                 maxItems: 20
 *                 example: [101, 102, 103]
 *           example:
 *             book_ids: [101, 102, 103]
 *     responses:
 *       200:
 *         description: Books borrowed successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully borrowed books"
 *                 no_of_books_borrowed:
 *                   type: integer
 *                   example: 3
 *                 borrowed_book_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [101, 102, 103]
 *       400:
 *         description: Invalid book_ids array
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad Request: Provide an array of bookIDs"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */

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
/**
 * @swagger
 * /api/v1/books/bulk/return:
 *   patch:
 *     summary: Return multiple borrowed books by IDs
 *     tags: ["Books"]
 *     requestBody:
 *       required: true
 *       content:
 *         "application/json":
 *           schema:
 *             type: object
 *             required:
 *               - book_ids
 *             properties:
 *               book_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   format: int32
 *                 minItems: 1
 *                 maxItems: 20
 *                 example: [101, 102, 103]
 *           example:
 *             book_ids: [101, 102, 103]
 *     responses:
 *       200:
 *         description: Books returned successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully returned books"
 *                 no_of_books_returned:
 *                   type: integer
 *                   example: 3
 *                 returned_book_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [101, 102, 103]
 *       400:
 *         description: Invalid book_ids array
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad Request: Provide an array of bookIDs"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */
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
/**
 * @swagger
 * /api/v1/books/{id}/borrow:
 *   patch:
 *     summary: Borrow a single book by ID
 *     tags: ["Books"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 101
 *         description: Numeric Book ID to borrow
 *     responses:
 *       200:
 *         description: Book borrowed successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book successfully borrowed"
 *                 content:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found: BookID Doesn't Exist!"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */

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
/**
 * @swagger
 * /api/v1/books/{id}/return:
 *   patch:
 *     summary: Return a single borrowed book by ID
 *     tags: ["Books"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 101
 *         description: Numeric Book ID to return
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book successfully returned"
 *                 content:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not Found: BookID Doesn't Exist!"
 *       500:
 *         description: Internal server error
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Error"
 */

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
