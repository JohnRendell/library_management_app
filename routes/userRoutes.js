const express = require("express");
const sanitize = require("sanitize-html");
const bcrypt = require('bcrypt')
const route = express.Router()
const user_model = require("../dummy_test_db/test_user")

//create user
route.post("/users", async (req, res)=>{
    try{
        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);

        const salt = await bcrypt.genSalt(10)
        const hashed_pass = await bcrypt.hash(password, salt)

        const add_account = user_model.add_account(username, hashed_pass)

        let status = 200

        if(add_account.status){
            status = 201
        }

        res.status(status).json({ message: add_account.message })
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
        const update_account = user_model.update_account(req.params.id, username, password)

        let status = 200

        if(update_account.status){
            status = 201
        }

        res.status(status).json({ message: update_account.message })

    }
    catch(err){
        console.log(err)
        res.status(500).json({ message: "Internal Error"})
    }
});

//delete users
route.delete("/users/:id", async (req, res)=>{
    try{
        const delete_account = user_model.delete_account(req.params.id)
        let status = 200

        if(delete_account.status){
            status = 201
        }

        res.status(status).json({ message: delete_account.message })
    }
    catch(err){
        console.error(err)
        res.status(500).json({ message: "Internal Error" })
    }
});

module.exports = route