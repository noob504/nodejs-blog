require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const connectDB = require('./server/config/db.js');

// initializing express app
const app = express();
const PORT = process.env.PORT || 5000;

// connecting to database
connectDB();


// middleware & template engine
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// serving static files
app.use(express.static("public"));

// routing
app.use("/", require("./server/routes/main"));

// server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
