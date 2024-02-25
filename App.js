const express = require("express");
const morgon = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize")
const bodyParser=require("body-parser");
const helmet =require("helmet");
const xss=require("xss");
const cors=require("cors");
const routes  = require("./Routes");
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
})

const app = express();

app.use(express.json({limit:"10kb"}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use("/",limiter)
app.use(helmet());
app.use(mongoSanitize());
// app.use(xss());
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}))

app.use(routes)
module.exports = app;