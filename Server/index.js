const express = require("express")
const app = express()
const { createServer } = require("http");
const expressServer = createServer(app)

app.use(express.json())
//app.use(require("body-parser").json())

app.get("/", (req, res)=>{
    res.send("Server is alive")
})

//routers
app.use("/api/v1", require("./routes/userRoutes"))

let port = 8080
expressServer.listen(port, () =>{
    console.log("listening to " + port)
})