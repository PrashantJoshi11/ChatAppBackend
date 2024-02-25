const { json } = require("body-parser");
const User = require("../model/User");

exports.updateMe= async(req,res,next)=> {
  const {user}=req;
  const filteredBody= filterObj(req.body,"firstname","lastname","about","avatar");
  const updatedUser = await User.findByIdAndUpdate(user._id,filteredBody,{new:true,validateModifiedOnly:true})
  res.status(400),json({
    status:"success",
    message:"Profile updated successfully",
    data:updatedUser
  })
}
