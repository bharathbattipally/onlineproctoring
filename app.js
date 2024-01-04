const express=require('express')
const app=express()
var bodyParser=require('body-parser')
const mongoose=require('mongoose')
const path=require('path')
const multer = require('multer');
const upload = multer();
const devuser=require("./signupschema")
const devcreatetest=require("./createtestschema")
const devquestions=require("./questionschema")
const session = require('express-session');

app.use(session({secret:"shh",cookie:{maxAge:60000}}));
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set("views","views1")
app.set("view engine","ejs")
app.use(upload.array());

mongoose.connect('mongodb://localhost:27017/exam',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
var db=mongoose.connection
db.on('open',function(){
    console.log("DB connected")
})
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+"/public/HTML HOME.html"))
})


//teacherform

app.post('/teachersignup',async(req,res)=>{
    try{
            const {fname,emailid,signuppass,confirmpass} =req.body;
            const exist= await devuser.findOne({emailid});
            if(exist){
                res.redirect('/')
            }
           
            else{
            let newUser=new devuser({fname,emailid,signuppass,confirmpass})
            newUser.save() 
            console.log('Register Successfull')
            res.render("Teacherdash",{username:fname})} 
            app.get("/teacherdash",function(req,res){
                res.render("Teacherdash",{username:fname})
            })
        }
    catch{  
            console.log("ERROR OCCURRED")
        }
})
app.post('/teacherlogin',async(req,res)=>{
    const {emailid,password}=req.body;
    const user= await devuser.findOne({emailid});
    if(user.signuppass===password){
        res.render('Teacherdash',{username:user.fname})
        app.get("/teacherdash",function(req,res){
            res.render("Teacherdash",{username:user.fname})
        })
    }
    else{
        res.redirect('/')
    }
})
//createstform
app.post('/createtest',async(req,res)=>{ 
    const testdetails=req.body;     
    const test=await devcreatetest.create(testdetails); 
    console.log("Test Created")
    res.sendFile('./public/addquesns.html', { root: __dirname });
    app.post('/addquestions',async(req,res)=>{
        const {question,optionA,optionB,optionC,optionD,correctopt,marks}=req.body;
        var quesnmarks=Number(marks)
        const quesn=await devcreatetest.findByIdAndUpdate(test._id,
            {  
                 
                $push:{
                    questions:{question,optionA,optionB,optionC,optionD,correctopt,quesnmarks}
                }
            },
            {new:true,useFindAndModify:false},
            )
        return res.sendFile('./public/addquesns.html', { root: __dirname });
    })
    app.get("/preview",function(req,res){
        devcreatetest.findById(test._id,function(err,data){
            res.render("teacherpreview",{questionslist:data.questions,testdata:data})
        })
    }) 
    app.get('/:id',function(req,res){
        const index=req.params.id;
        devcreatetest.findByIdAndUpdate(test._id,{$pull:{questions:index}},function(err,data){
            res.render("teacherpreview",{questionslist:data.questions,testdata:data})
        })
    })
    
})

//studentside

app.post('/studentsignup',async(req,res)=>{
    try{
            const {fname,emailid,signuppass,confirmpass} =req.body;
            const exist= await devuser.findOne({emailid});
            if(exist){
                res.redirect('/')
            }
            else if(signuppass!=confirmpass){
                res.render("HTML HOME",{message:"password doesnt match"})
            }
            else{
            let newUser=new devuser({fname,emailid,signuppass,confirmpass})
            newUser.save() 
            console.log('Register Successfull')
            res.render("studentdash",{username:fname})}
            app.get('/dashboard',function(req,res){
            res.render("studentdash",{username:exist.fname})
            })
        }
    catch{  
            console.log("ERROR OCCURRED")
        }
    
})
app.post('/studentlogin',async(req,res)=>{
    try{
    const {emailid,password}=req.body;
    const user= await devuser.findOne({emailid});
    if(!user){
        res.redirect('/')
    }
    else if(user.signuppass===password){
        res.render('studentdash',{username:user.fname})
        app.post('/instructions',function(req,res){
            const {testid,testpass}=req.body
                devcreatetest.findById(testid,function(err,data){
                    if(!data){
                        res.send("NO TEST AVAILABLE")
                    }
                    else{
                    res.render("instructions",{testdetails:data})
                    app.get('/results',function(req,res){
                        
                        res.render("studentresults",{data:data,details:data.questions})
                    })
                }
                })
        })
        app.get('/test/:id',function(req,res){
            devcreatetest.findById(req.params.id,function(err,data){
                if(err){
                    res.redirect('/dashboard')
                }
                else{
                    var perpage = 100;
                    var pagenumber = Number((req.query.page == null) ? 1 : req.query.page);
                    var startfrom = (pagenumber - 1) * perpage;
                    devcreatetest.findById(req.params.id,function(err,data){
                        var total = data.questions.length
                        var pages = Math.ceil(total / perpage);
                        var pagequesns=data.questions.slice(startfrom,startfrom+perpage)
                        res.render("mcq",{questionslist:pagequesns,pageno:pagenumber,data:data.questions,time:data})
                    })
                }
            })
        })
        app.get('/dashboard',function(req,res){
            res.render("studentdash",{username:user.fname})
        })
        
    }
    else{
        res.redirect('/')
    }
    
}
    catch{
        res.send("ERROR OCCURED :(")
    }
})



app.listen(8000)

