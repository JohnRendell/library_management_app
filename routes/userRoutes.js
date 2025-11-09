const express = require("express");
const sanitize = require("sanitize-html");
const bcrypt = require('bcrypt')
const route = express.Router()
const userModel = require("../models/userModel");

//create user
route.post("/users", async (req, res)=>{
    try{
        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);

        const salt = await bcrypt.genSalt(10)
        const hashed_pass = await bcrypt.hash(password, salt)

        const check_account = await userModel.findOne({ username: username })
        
        let message = "Failed to create account";
        let status = 200;

        if(check_account){
            message = "Username already exist";
        }
        else{
            const users = await userModel.find({}, { userID: 1, _id: 0 });
            const existingIDs = users.map(u => u.userID);
            let newUserID = 1;

            while (existingIDs.includes(newUserID)) {
                newUserID++;
            }

            let add_account = await userModel.create({ userID: newUserID , username: username, password: hashed_pass });

            if(add_account){
                status = 201
                message = "Account Successfully Added"
            }
        }

        res.status(status).json({ message: message })
    }
    catch(err){
        console.error(err)
        res.status(500).json({ message: "Internal Error" })
    }
});

//update users
route.patch("/users/:id", async (req, res)=>{
    try{
        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);
        let status = 404
        let message = "UserID not exist"
       
        let update_account = await userModel.findOneAndUpdate(
            { userID: req.params.id },
            { $set: { username: username, password: password } },
            { new: true }
        )

        if(update_account){
            status = 200
            message = "Account updated successfully"
        }

        res.status(status).json({ message: message })

    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

//delete users
route.delete("/users/:id", async (req, res)=>{
    try{
        let status = 404
        let message = "UserID not exist"
       
        let delete_account = await userModel.findOneAndDelete({ userID: req.params.id })

        if(delete_account){
            status = 200
            message = "Account deleted successfully"
        }

        res.status(status).json({ message: message })

    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

module.exports = route