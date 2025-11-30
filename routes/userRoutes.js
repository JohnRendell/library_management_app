const express = require("express");
const sanitize = require("sanitize-html");
const bcrypt = require('bcrypt')
const route = express.Router()
const userModelSchema = require("../models/userModel");

//middle ware
const { validate_account_create, login_validation } = require("../middleware/userMiddleware");

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: mySecret123
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Failed to create account
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */

//create user
route.post("/users", validate_account_create, async (req, res)=>{
    try{
        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);

        const salt = await bcrypt.genSalt(10)
        const hashed_pass = await bcrypt.hash(password, salt)

        const users = await userModelSchema.find({}, { userID: 1, _id: 0 });
        const existingIDs = users.map(u => u.userID);
        let newUserID = 1;

        while (existingIDs.includes(newUserID)) {
            newUserID++;
        }

        let add_account = await userModelSchema.create({ userID: newUserID, borrowedBooks: [], username: username, password: hashed_pass });

        if(!add_account){
            return res.status(400).json({ message: "Failed to create account" })
        }

        return res.status(201).json({ message: "Account created successfully" })
    }
    catch(err){
        return res.status(500).json({ message: err })
    }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update existing user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: pogiako123
 *               password:
 *                 type: string
 *                 example: pogiako
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       404:
 *         description: UserID not exist
 *       500:
 *         description: Internal server error
 */

//update users
route.patch("/users/:id", async (req, res)=>{
    try{
        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);

        if(!username || !password){
            return res.status(400).json({ message: "Fields are empty" })
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashed_pass = await bcrypt.hash(password, salt)
       
        let update_account = await userModelSchema.findOneAndUpdate(
            { userID: req.params.id },
            { $set: { username: username, password: hashed_pass } },
            { new: true }
        )

        if(update_account){
            return res.status(200).json({ message: "Account updated successfully" })
        }
        return res.status(404).json({ message: "UserID not exist" })

    }
    catch(err){
        return res.status(500).json({ message: err })
    }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete existing user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       404:
 *         description: UserID not exist
 *       500:
 *         description: Internal server error
 */

//delete users
route.delete("/users/:id", async (req, res)=>{
    try{
        let delete_account = await userModelSchema.findOneAndDelete({ userID: req.params.id })

        if(delete_account){
            return res.status(200).json({ message: "Account deleted successfully" })
        }

        return res.status(404).json({ message: "UserID not exist" })

    }
    catch(err){
        return res.status(500).json({ message: err })
    }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User found successfully

 *       404:
 *         description: User not found
 * 
 *       500:
 *         description: Internal server error
 */

//get specific user
route.get("/users/:id", async (req, res)=>{
    try{
        const get_user = await userModelSchema.findOne({ userID: req.params.id })

        if(get_user){
            return res.status(200).json({ message: "Success", username: get_user.username })
        }

        return res.status(404).json({ message: "UserID not found" })
    }
    catch(err){
        return res.status(500).json({ message: err })
    }
});

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Success

 *       404:
 *         description: No account created yet
 * 
 *       500:
 *         description: Internal server error
 */

//get all users
route.get("/users", async (req, res)=>{
    try{
        const get_user = await userModelSchema.find().sort({ createdAt: -1 })

        if(!get_user){
            return res.status(404).json({ message: "No account created yet" })
        }

       return res.status(200).json({ message: "Success", users: get_user})
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ message: err })
    }
});

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login account
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: mySecret123
 *     responses:
 *       201:
 *         description: Success
 *       404:
 *         description: Username or password incorrect
 *       500:
 *         description: Internal server error
 */

//login user account
route.post("/users/login", login_validation, async (req, res)=>{
    try{
        const find_user = await userModelSchema.findOne({ username: sanitize(req.body.username) })

        if(find_user){
            let isPassLegit = await bcrypt.compare(sanitize(req.body.password), find_user.password)

            if(isPassLegit){
                return res.status(200).json({ message: "Success" })
            }
            return res.status(404).json({ message: "Username or password incorrect" })
        }

        return res.status(404).json({ message: "Username or password incorrect" })
    }
    catch(err){
        return res.status(500).json({ message: err })
    }
});

/**
 * @swagger
 * /api/v1/users/borrowedBooks/{id}:
 *   get:
 *     summary: Get a user's info about borrowed books
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Retrieved successfully

 *       404:
 *         description: User doesn't exist
 * 
 *       500:
 *         description: Internal server error
 */
//get user's borrowed books
route.get("/users/borrowedBooks/:userID", async (req, res)=>{
    try{
        const get_book = await userModelSchema.findOne({ userID: req.params.userID });

        if(!get_book){
            return res.status(404).json({ message: "User doesn't exist" })
        }
        return res.status(200).json({ message: "Retrieved successfully", userID: get_book.userID, username: get_book.username, borrowedBooks: get_book.borrowedBooks })
    }
    catch(err){
        return res.status(500).json({ message: err });
    }
})

module.exports = route