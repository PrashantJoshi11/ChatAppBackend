const filterObj = require("../Utils/util");
const User = require("../model/User");
const jwt=require('jsonwebtoken');
const otpGenerator = require("otp-generator");
var CryptoJS = require("crypto-js");


function signToken(userId){
        return jwt.sign({userId},process.env.jwtToken,{expiresIn:"1d"});
}

exports.register= async(req,res,next) => {

  const {firstname,lastname,email,password} = req.body;
  const existingUser= User.findOne({email: email});
  const filteredBody= filterObj(req.body,"firstname","lastname","email","password");
  if(existingUser && existingUser.verified){
    res.status(400).json({
      status:"error",
      message:"Email is already in use"
    })
  }

  else if(existingUser){
    const  updateUser= User.findOneAndUpdate({email:email},filteredBody,{new:true,validateModifiedOnly:true});
    req.userId=existingUser._id;
    next();
  
  }

  else {
    const newUser= await User.create(filteredBody);
    req.userId=newUser._id;
    next();

  }

}

exports.sendOtp= async(req,res,next) => {
  const {userId}=req;
  //Generate Otp
  const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets:false});
  otpExpiryTime= Date.now() + 10*60*1000;
await User.findByIdAndUpdate(userId,{
  otp,
  otp_expiry_time:otpExpiryTime,
})

//send mail
 res.status(200).json({
  status:"success",
  message:"Otp sent successfully"
 })

}
exports.verifyotp= async(req,res,next) => {
  const {email,otp}= req.body;
  const userData= await User.findOne(
    {
      email,
      otp_expiry_time:{$gt:Date.now()}
    })

    if(!userData){
      res.status(400).json({
        status:"error",
        message:"Email is not valid or otp expired"
      })
    }
    if(!await userData.checkotp(otp,userData.otp)){
      res.status(400).json({
        status:"error",
        message:"Otp is invalid"
      })
    }
    userData.verified=true;
    userData.otp=undefined;
    await userData.save({new:true,validateModifiedOnly:true});
    const token= signToken(userData._id);

    res.status(200).json({
        status:"success",
        message:"OTP verified successfully",
        token
    })

}

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "Error",
      message: "Both email and password are required",
    });
  }

    const userdata = await User.findOne({ email: email }).select("+password");

   if(!userdata || !(userdata.CheckPassword(password,userdata.password))){
    res.status(400).json({
        status:"Error",
        message:"Email or Password is incorrect"
    })
   }

   const token= signToken(userdata._id);

    res.status(200).json({
        status:"success",
        message:"Login successfull",
        token
    })
};

exports.forgotPassword= async(req,res,next)=>{
  const user= await User.findone({email: req.email});
  if(!user)
  {
    res.status(400).json({
      status:"error",
      message:"There is no user for the given email"
    })
    return;
  }
  const token = await user.CreateResetToken();
  const url=`http://localhost:3000/auth/reset-password/?code=${token}`;
  try {
    // mail to be send 

    res.status(200).json({
      status:"success",
      message:"Reset Password link sent successfully"
    })
    
  } catch (error) {
    user.passwordResetToken=undefined;
    user.passwordTokenExpire=undefined;
    await user.save({validateBeforeSave:false})
    console.log(error);
    res.status(500).json({
      status:"success",
      message:"There is an error in sending the mail",
    })
     
  }

}

exports.resetPassword= async(req,res,next)=>{

  const usertoken =  CryptoJS.AES.encrypt(req.params.code, process.env.secretkey ).toString();

  const user = await User.findOne({passwordResetToken:usertoken,passwordTokenExpire:{$gt:Date.now()}});
  if(!user){
    res.status(400).json({
      status:"error",
      message:"Token is invalid or expired"
    })
    return;
  }
  user.password=req.body.password;
  user.confirmPassword=req.body.confirmPassword;
  user.passwordResetToken=undefined;
  user.passwordTokenExpire=undefined;
  await user.save();

  // mail for password reset 

  const token= signToken(user._id);

  res.status(200).json({
      status:"success",
      message:"Login successfull",
      token
  })
}

exports.protect= async(req,res,next)=>{
  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
    token= req.headers.authorization.split(" ")[1];
  }
  else if(req.cookies.jwt){
    token=req.cookies.jwt;
  }
  else{
    req.status(400).json({
      status:"error",
      message:"You are not logged in please logged in first"
    })
    return;
  }

  const decodedtoken= await promisify(jwt.verify(token, process.env.jwtToken))
   const userdata= await User.findById(decodedtoken.userId)
   if(!userdata){
    req.status(400).json({
      status:"error",
      message:"User does not exist"
    })
    return;
   }
   if(userdata.afterPasswordChange(userdata.iat)){
    req.status(400).json({
      status:"error",
      message:"Password updated recently please log in again"
    })
   }

   req.user=userdata;
   next();


}
