const route = require("express").Router();
const authController= require("../Controller/Auth");
const userController= require("../Controller/User");
route.patch("/update-me",authController.protect,userController.updateMe);

module.exports = route;