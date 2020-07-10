var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const userCtrl = require("./api/user/user.ctrl");
require("dotenv").config();

var app = express();

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Database connected!!");
}).catch((err) => {
    console.log("DB Connect Failed!");
});

// View Engine ejs로 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(userCtrl.checkAuth);

app.get("/", (req, res) => {
    res.render("index");
});

// Routing Module ./api로 설정
app.use("/api", require("./api")); // api/index.js

// Catch 404 -> Forward to Error Handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error Handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
