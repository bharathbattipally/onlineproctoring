const mongoose=require("mongoose")
const devuser=new mongoose.Schema({
fname:{
type:String,
required:true
},
emailid:{
type:String,
required:true
},
signuppass:{
type:String,
required:true
},
confirmpass:{
type:String,
required:true
}
})
module.exports=mongoose.model("devuser",devuser)