const app = require("./App");
const http=require("http");
const server= http.createServer(app);
const dotenv = require("dotenv");
dotenv.config();
const mongoose= require("mongoose");

process.on("uncaughtException",(err)=>{
   console.log(err);
   process.exit(1);
})
process.on("unhandledRejection",(err)=>{
   console.log(err);
   server.close(()=>
   process.exit(1)
   )
})

mongoose.connect(process.env.ConUrl).then(()=>{
   console.log("Connected successfully with Database");
}).catch((err)=>{
console.log(err);
})


 server.listen(process.env.PORT,()=>{
    console.log("Server Successfully started");
 })