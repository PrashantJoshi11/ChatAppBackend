const route = require("express").Router();
const authController= require("../Controller/Auth");
route.post("/login",authController.login);
route.post("/register",authController.register);
route.post("/send-otp",authController.sendOtp);
route.post("/verify-otp",authController.verifyotp);
route.post("/forgot-password",authController.forgotPassword);
route.post("/reset-password",authController.resetPassword);


module.exports = route;