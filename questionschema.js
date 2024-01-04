const mongoose=require("mongoose")
const devquestions=new mongoose.Schema({

question:{
type:String,
required:true
},
optionA:{
type:String,
required:true
},
optionB:{
type:String,
required:true
},
optionC:{
type:String,
required:true
},
optionD:{
type:String,
required:true
},
correctopt:{
type:String,
required:true
},
marks:{
    type:Number,
    required:true
}
})
module.exports=mongoose.model("devquestions",devquestions)