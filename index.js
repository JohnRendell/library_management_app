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
const uri = process.env.MONGODB_URI

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  catch(err){
    console.error(err)
  }
}
run().catch(console.dir);

app.get("/", (req, res)=>{
    res.json({ message: "message is alive" })
})

//routers
app.use("/api/v1", require("./routes/userRoutes"))

let port = process.env.PORT
expressServer.listen(port, () =>{
    console.log("listening to " + port)
})