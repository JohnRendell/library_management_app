const express = require("express")
const app = express()
const { createServer } = require("http");
const expressServer = createServer(app)
const path = require("path")

app.use(express.json())

if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({ path: path.join(__dirname, "../keys.env") })
}

app.get("/", (req, res)=>{
    res.send("Server is alive")
})

//routers
app.use("/api/v1", require("./routes/userRoutes"))

let port = process.env.PORT
expressServer.listen(port, () =>{
    console.log("listening to " + port)
})