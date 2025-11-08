const path = require("path")
const user_json_path = path.join(__dirname, "/user.json")
const fs = require("fs")

function add_account(username, password){
    let data = []
    const raw_data = fs.readFileSync(user_json_path, "utf8");

    if (raw_data.trim().length > 0) {
        data = JSON.parse(raw_data);
    }

    const check_user = data.some(acc => username == acc.username)

    if(check_user){
        return { message: "Username already taken", status: false }
    }
    else{
        let user = {
            "id": data.length,
            "username": username,
            "password": password
        }
        data.push(user)

        fs.writeFileSync(user_json_path, JSON.stringify(data, null, 2), "utf8")

        return { message: "Success", status: true }
    }
}

function update_account(id, username, password){
    const raw_data = fs.readFileSync(user_json_path, "utf8");
    let data = JSON.parse(raw_data);
    let check_id = data.some(acc => id == acc.id)

    if(check_id){
        const check_user = data.some(acc => username == acc.username)

        if(check_user){
            return { message: "Username already taken", status: false }
        }

        else{
            data[parseInt(id)] = {
                "id": parseInt(id),
                "username": username,
                "password": password
            }

            fs.writeFileSync(user_json_path, JSON.stringify(data, null, 2), "utf8")

            return { message: "Success", status: true }
        }
    }

    else{
        return { message: "Id doesn't exist", status: false }
    }
}

function delete_account(id){
    const raw_data = fs.readFileSync(user_json_path, "utf8");
    let data = JSON.parse(raw_data);
    let check_id = data.some(acc => id == acc.id)

    if(check_id){
        data = data.filter(acc => id != acc.id)
        fs.writeFileSync(user_json_path, JSON.stringify(data, null, 2), "utf8")

        return { message: "Success", status: true }
    }
    else{
        return { message: "Id doesn't exist", status: false }
    }
}

module.exports = { add_account, update_account, delete_account }