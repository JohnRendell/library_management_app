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

// ----- Swagger Setup -----
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library Management API",
      version: "1.0.0",
      description: "IT elective 3 Library Management API"
    },
    components: {
      schemas: {
        BookInput: {
          type: "object",
          description: "Schema for creating a new book.",
          required: [
            "bookID", "title", "author", "genre", "publisher", 
            "publication_date", "is_available"
          ],
          properties: {
            bookID: { type: "integer", format: "int32", example: 101 },
            title: { type: "string", example: "The Lost Library" },
            author: { type: "string", example: "Jane Doe" },
            genre: { type: "string", example: "Mystery" },
            publisher: { type: "string", example: "Global Press" },
            publication_date: { type: "string", format: "date", example: "2023-10-25" },
            is_available: { type: "boolean", example: true }
          }
        },
        Book: {
          type: "object",
          description: "The complete Book object returned by the API.",
          properties: {
            _id: { type: "string", readOnly: true, description: "MongoDB unique object ID." },
            bookID: { type: "integer", format: "int32", example: 101 },
            title: { type: "string", example: "The Lost Library" },
            author: { type: "string", example: "Jane Doe" },
            genre: { type: "string", example: "Mystery" },
            publisher: { type: "string", example: "Global Press" },
            publication_date: { type: "string", format: "date", example: "2023-10-25" },
            is_available: { type: "boolean", example: true }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js"] 
});

const options_for_swagger = {
    customCss: '.swagger-ui .topbar { display: none }'
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options_for_swagger));

//connect to mongo db
const mongoose = require("mongoose");
const { options } = require("./routes/userRoutes");
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
app.use("/api/v1", require("./routes/bookRoutes"))


let port = process.env.PORT
expressServer.listen(port, () =>{
    console.log("listening to " + port)
})