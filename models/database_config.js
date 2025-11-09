const mongoose = require("mongoose")

const database = mongoose.createConnection(process.env.MONGODB_URI, {
    dbName: "libraryDB",
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = database