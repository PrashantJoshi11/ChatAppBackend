const mongoose= require("mongoose");
const bcrypt=require('bcrypt');
var CryptoJS = require("crypto-js");

const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        require:[true,"First name is required"]
    },
    lastName:{
        type:String,
        require:[true,"LastName is required"],
     
    },
    avatar:{
        type:String
    },
    email:{
        type:String,
        require:[true,"Email is required"],
        validate:{
            validator:function (email){
                return String(email).toLowerCase().match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
            }
        },
        message : (props)=> `Email ${props} is invalid`
    },
    otp:{
        type:Number,
    
    },
    otp_expiry_time:{
        type:Date,

    },
    verified:{
        type:Boolean,
        default:false,
    },
    password:{
        type:String
    },
    confirmPassword:{
        type:String
    },
    passwordChangedAt:{
        type:Date
    },
    passwordResetToken:{
        type:Date
    },
    passwordTokenExpire:{
        type:Date
    }
},
{
    timestamps:true
}
)
userSchema.pre("save", async function(next){
    if(!this.isModified("otp")){
        return next();  
    }
this.otp = await bcrypt.hash(this.otp,12)
next();
})

 userSchema.methods.checkotp= async function (candidateOtp,userOtp){
    return await bcrypt.compare(candidateOtp,userOtp);
 }

 userSchema.methods.CheckPassword= async function (candidatepass,userpass){
    return await bcrypt.compare(candidatepass,userpass);
 }


 userSchema.methods.CreateResetToken= async function (){
    const randomNumber = CryptoJS.lib.WordArray.random(16);
    const resettoken = randomBytes.toString(CryptoJS.enc.Hex);
    this.passwordResetToken = CryptoJS.AES.encrypt(resettoken, process.env.secretkey ).toString();

    this.passwordTokenExpire= Date.now()+10*60*1000;
    return resettoken;
   
 }
 userSchema.methods.afterPasswordChange= function (time){
  
   return time < this.passwordChangedAt;
 }

const User= new mongoose.model("User",userSchema);
module.exports=User;
