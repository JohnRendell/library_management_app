const express = require("express")
const route = express.Router()
const bookModelSchema = require("../models/bookModel");
const userModelSchema = require("../models/userModel");

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
    try {
        const book_id = sanitize(req.params.id);
        const check_book = await bookModelSchema.findOne({bookID: Number(book_id) })
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
 *         "application/json":
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *           example:
 *             bookID: 102
 *             title: "New Book Title"
 *             author: "John Smith"
 *             genre: "Fiction"
 *             publisher: "ABC Press"
 *             publication_date: "2023-10-25"
 *             is_available: true
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Created: Successfully Added a Book!"
 *                 add_book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: BookID already exists
 *         content:
 *           "application/json":
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad Request: BookID already exists!"
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
/**
 * @swagger
 * /api/v1/books:
 *   delete:
 *     summary: Delete multiple books
 *     tags: ["Books"]
 *     description: Deletes books based on provided book IDs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_ids
 *             properties:
 *               book_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [101, 102, 103]
 *     responses:
 *       200:
 *         description: Successfully deleted books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deleted_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 no_of_books_deleted:
 *                   type: object
 *       400:
 *         description: Bad request – invalid or missing book IDs
 *       500:
 *         description: Internal server error
 */
// delete one or multiple book entries
route.delete("/books", async (req, res) => {
    try {
        
        let book_ids = req.body.book_ids;

        if ( book_ids.length === 0) {
            return res.status(400).json({ message: "Bad Request: Provide an array of bookIDs" });
        }
        if (!Array.isArray(book_ids)) {
            book_ids = [book_ids]
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
 * /api/v1/books/borrow:
 *   patch:
 *     summary: Borrow one or more books
 *     tags: ["Books"]
 *     description: Marks books as borrowed and adds them to the user’s borrowed list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - book_ids
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 3001
 *               book_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [101, 102]
 *     responses:
 *       200:
 *         description: Successfully borrowed books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 no_of_books_borrowed:
 *                   type: integer
 *                 borrowed_book_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         description: One or more books are not available
 *       500:
 *         description: Internal server error
 */
// borrow one or multiple books
route.patch("/books/borrow", async (req, res) => {
    try {
        const borrower_id = req.body.user_id;
        let book_ids = req.body.book_ids;
       
         // Validation Functions
        if (!Array.isArray(book_ids)) {
            book_ids = [book_ids]
        }

        const books = await bookModelSchema.find(
            { bookID: { $in: book_ids } },
            '_id bookID title is_available',
        );

        const unavailableBooks = books.filter(book => book.is_available === false);

        if (unavailableBooks.length >= 1) {
            return res.status(400).json({
                message: "One or more books are not available",
                BooksNotAvailable: unavailableBooks
            })
        }

        // Update functions
        const book_object_ids = books.map(book => book._id);
        
        const borrowed_books = await bookModelSchema.updateMany(
            { bookID: { $in: book_ids } },
            { $set: { is_available: false } },
            { new: true }) 
        
        if (borrowed_books.acknowledged) {
            const borrower = await userModelSchema.updateMany(
            { userID: borrower_id },
            { $push: { borrowedBooks: book_object_ids } },
            { new: true } 
            );

            if (borrowed_books && borrower) {
            res.status(200).json({
                message: "Successfully borrowed books",
                no_of_books_borrowed: borrowed_books.matchedCount,
                borrowed_book_ids: book_ids
            })
        }
        }

        
    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});
/**
 * @swagger
 * /api/v1/books/return:
 *   patch:
 *     summary: Return borrowed books
 *     tags: ["Books"]
 *     description: Marks books as returned and removes them from the user’s borrowed list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - book_ids
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 3001
 *               book_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [101, 102]
 *     responses:
 *       200:
 *         description: Successfully returned books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 no_of_books_returned:
 *                   type: integer
 *                 returned_book_ids:
 *                   type: array
 *                   items:
 *                     type: integer
 *       400:
 *         description: User did not borrow these books or one is already returned
 *       500:
 *         description: Internal server error
 */
// return one or multiple books
route.patch("/books/return", async (req, res) => {
    try {

        const borrower_id = req.body.user_id;
        let book_ids = req.body.book_ids;

        // Validation Functions
        const user = await userModelSchema.findOne({
            userID : borrower_id
        })

        const userWithBooks = await user.populate("borrowedBooks");

        if (!userWithBooks.borrowedBooks || userWithBooks.borrowedBooks.length === 0) {
        return res.status(400).json({ message: "User has no borrowed books" });
}
        const borrowedBooks = userWithBooks.borrowedBooks;
        const borrowedBooksIds = borrowedBooks.map(book => book.bookID);

        const allExist = book_ids.every(item => borrowedBooksIds.includes(item));

        if (!allExist) {
            return res.status(400).json({
                message: "User is trying to return a book that was not borrowed",
                userId: borrower_id,
                bookIdsToReturn: book_ids,
                borrowedBooks: borrowedBooks
            });
        }


        // Update functions
        if (!Array.isArray(book_ids)) {
            book_ids = [book_ids]
        }

         const books = await bookModelSchema.find(
        { bookID: { $in: book_ids } },    
        '_id bookID title is_available'                             
        );

        const book_object_ids = books.map(book => book._id);
        const availableBooks = books.filter(book => book.is_available === true);

        if (availableBooks.length >= 1) {
            return res.status(400).json({
                message: "One or more books already returned",
                Books: availableBooks
            })
        }

        const returned_books = await bookModelSchema.updateMany(
            { bookID: { $in: book_ids } },
            { $set: { is_available: true } },
            {new:true}
        )
        if (returned_books.acknowledged) {
            const borrower = await userModelSchema.updateMany(
                { userID: borrower_id },
                { $pull: { borrowedBooks: {$in: book_object_ids } } },
                { new: true }
            );
             if (returned_books && borrower) {
                res.status(200).json({
                    message: "Successfully returned books",
                    no_of_books_returned: returned_books.matchedCount,
                    returned_book_ids: book_ids
                })
            }
        }
           
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
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
 *           format: int32
 *           minimum: 1
 *           example: 101
 *         description: Numeric Book ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         "application/json":
 *           schema:
 *             $ref: '#/components/schemas/BookPatch'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           "application/json":
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


module.exports = route
