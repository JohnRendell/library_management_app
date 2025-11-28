const userModelSchema = require("../models/userModel");
const sanitize = require("sanitize-html");

async function validate_account_create(req, res, next){
    try{
        if(!req.body.username || !req.body.password){
            return res.status(400).json({ message: "Fields are empty" })
        }

        const username = sanitize(req.body.username);
        const check_account = await userModelSchema.findOne({ username: username })

        if(check_account){
            return res.status(409).json({ message: "Username already exist" })
        }
        next();
    }
    catch(err){
        return res.status(500).json({ message: err })
    }
}

function login_validation(req, res, next) {
    if(!req.body.username || !req.body.password){
        return res.status(400).json({ message: "Fields are empty" })
    }
    next();
}

module.exports = { validate_account_create, login_validation }