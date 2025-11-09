const express = require("express")
const app = express()
const { createServer } = require("http");
const expressServer = createServer(app)
const path = require("path")
const cors = require("cors");

app.use(cors());
app.use(express.json())

if(process.env.NODE_ENV !== "production"){
    require("dotenv").config({ path: path.join(__dirname, "./keys.env") })
}

//connect to mongo db
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    console.log("DB name: " + mongoose.connection.name)
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

connectDB();

app.get("/", (req, res)=>{
    res.json({ message: "message is alive", database_name: mongoose.connection.name })
})

//routers
app.use("/api/v1", require("./routes/userRoutes"))

let port = process.env.PORT
expressServer.listen(port, () =>{
    console.log("listening to " + port)
})