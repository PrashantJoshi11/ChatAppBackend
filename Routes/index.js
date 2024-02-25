const route= require("express").Router();
const authRouter= require("./Auth");
const userRouter= require("./User");


route.use("/auth",authRouter);
route.use("/user",userRouter);


module.exports=route
