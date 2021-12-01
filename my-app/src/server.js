const server = require('express')();
const database = require('mysql');
const fs = require('fs');
const FormData = require('form-data');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()
const token_secret = process.env.token_secret
//require('crypto').randomBytes(64).toString('hex')        ------create token secret 

server.use(require('cors')());
server.use(require('body-parser').json())
server.listen('3001',function(){console.log("awesome")});
const fileUpload = require('express-fileupload');
const { json } = require('express');
server.use(fileUpload());

const rootPath = 'C:/Users/Administrator/Desktop/Inception/'
const Salt = '$2b$04$/NEbZHFVul1z7tS0Dicx6u'
var db = database.createConnection({
    host: "host",
    port: "port",
    user: "user",
    password: "password",
    database: "database"
  });

//connect to database
db.connect((err) => {
    if(err){
     // console.log('Error connecting to Db');
     console.log('error')
     console.log(err)
      return;
    }
    console.log('Connection established');
  });
 
// generate Token based on email that was submitted when email/password mathces
function generateToken(email){
  return jwt.sign(email,token_secret) 
}
// check token to determine user's login status
function tokenCheck(email,token){
    var passed = true
    try{
     email == jwt.verify(token,token_secret)}
    catch(err){
      console.log(err)
      passed = false
    } 
    finally{
      return passed
    }
}

server.post('/signup',function(req,res){
  let Email = req.body.Email
  let Password = req.body.Password
  let check_sql = 'select * from Inception where Email = "' + Email + '"'

  db.query(check_sql,function(err,result){
    if(result.length == 0){
      
      bcrypt.genSalt(2,
        function(err,salt){
          if(err)
            console.log(err)
          bcrypt.hash(Password,Salt,
            function(err1,encrypted){
              if(err1) console.log(err1);
              bcrypt.hash(encrypted,salt,
                function(err2,encrypted_again){
                  if(err2) console.log(err2);
                  db.query('INSERT INTO Inception (Email,Password,Salt) VALUES ("' + Email + '","' + encrypted_again +'","'+salt+'")',
                    function(err3,result){
                        if (err3) console.log(error3);
                        res.send('Account created successfully.')
                    }
                  ) 
                }
              ) // bcrypt.hash
            }
          )  //bcrypt.hash

        }
      ) //bcrypt.genSalt
    }
    else{
      console.log('dkjahkl')
      console.log(result)
      res.send('This Email already existed.')
    }

  })

})


server.post('/login',function(req,res){

  Email = req.body.Email;
  Password = req.body.Password;
  console.log('Email : ' + Email + '\nPassword : ' + Password);
  db.query('Select * from Inception Where Email = "'+ Email +'"'
  ,function(err,result){
    if(result.length!=0){
      result =  JSON.parse( JSON.stringify(result) )[0]
      bcrypt.hash(Password,Salt,function(err,encrypted){
        bcrypt.hash(encrypted,result['Salt'],function(err2,encrypted_again){
          console.log(encrypted_again)
          console.log(result['Password'])
          console.log(result)
          if(encrypted_again === result['Password']){
            console.log('log in successfully')
            res.send(generateToken(Email))
          }
          else
            res.status(400).send({
              message:"There is something wrong with Email/Password"
            })

        })
    
      })
    }
    else
      res.status(400).send({
        message:"There is something wrong with Email/Password"
      })
  })


})


server.post('/newMovie',function(req,res){
 // console.log(req.body)
 // console.log(req.files)
 // console.log(req.files.Movie == null)
  Title = req.body.Title
  Description = req.body.Description
  Email =  req.body.Email
  Category = req.body.Category
  Format = req.body.Format
  Path =  Email + '/' + Title + '.' + Format
  Token = req.headers.auth
  //console.log(req.headers)
  directory =  Email
 /* console.log(req.body)
  console.log(Path)
  console.log(req.files)               
  console.log(req.files.image)
  console.log(req.files.image.data)*/
  
  if(tokenCheck(Email,Token)){
  if(!fs.existsSync(directory))
    fs.mkdirSync(directory)
  var date = new Date();
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); 
  var yyyy = date.getFullYear();
  var time = date.getTime();
  date = yyyy + '/' + mm + '/' + dd;
  if(req.files.Movie == null)
  db.query('Insert into Content (Email , Title, Description, Path, Email_Title, addDate, addTime,Category) values ("' 
    + Email + '", "'
    + Title + '","'
    + Description + '","'
    + Path + '","'
    + Email + ":" +Title + '","'
    + date + '","'
    + time + '","'
    + Category + '")'
    , function(err,result){
      if (err) 
      {
        console.log(err)
        res.send('There is a error happens')
      }
      else
        {fs.writeFile(rootPath+Path, req.files.Image.data, function(s)
          {
          res.send(req.files)
          }
                      )
        };
    }   //db.query callback
    )   //db.query

    else{
    let Path2 =  Email + '/' + Title + '.mp4' 
    db.query('Insert into Content (Email , Title, Description, Path, Email_Title, addDate, addTime,Category,Video) values ("' 
    + Email + '", "'
    + Title + '","'
    + Description + '","'
    + Path + '","'
    + Email + ":" +Title + '","'
    + date + '","'
    + time + '","'
    + Category + '","'
    + Path2 + '")'
    , function(err,result){
      if (err) 
      {
        console.log(err)
        res.send('There is a error happens')
      }
      else
        {fs.writeFile(rootPath+Path, req.files.Image.data, function(s)
          {
          res.send(req.files)
          }
                      )
         fs.writeFile(rootPath+Path2,req.files.Movie.data,function(){
                        console.log('done')
                      })
                       
        };

    }   //db.query callback
    )   //db.query
  }
  } // tokenCheck

  else 
    {
      console.log('herehere')
    res.send('Token Verification failed')
    }
})

server.post('/getMovies',function(req,res){

  Email  = req.body.Email
  db.query('select * from Content where Email = "' + Email + '"',async function(err,result){
    console.log(result)
    res.send(result);

  })


})

server.post('/checkMovie',function(req,res){
  console.log('dddd')
  Email  = req.body.Email
  Title = req.body.Title
  db.query('select * from Content where Email = "' + Email + '" and Title = "' + Title + '"',async function(err,result){
    console.log(result)
    console.log(JSON.parse(JSON.stringify(result)))
    console.log(Object.values(JSON.parse(JSON.stringify(result))))
    Path = Object.values(JSON.parse(JSON.stringify(result)))[0].Path
    let info = JSON.parse(JSON.stringify(result))[0]
   // res.sendFile(Path,{headers:{'content-type':'image/gif'}})
    fs.readFile(rootPath+Path,function(err,data){
      if (err){
        console.log(err)
        res.send(err)
        return
      }
      console.log(data)
      console.log(info)
      let f = new FormData()
      f.append('image',data)
      f.append('info',JSON.stringify(info))
      res.send(f)
      

    })
    
  }
    )


})



server.get('/audio&video_play',function(req,res){
   
  let path = rootPath + req.query.path
  console.log("djashjk")
  size = fs.statSync(path).size
  console.log(size)
  const range = req.headers.range;
  const CHUNK_SIZE = 10 ** 8; // 1MB = 10 ** 6
  const start = Number(range.replace(/\D/g, ""));
  
  const end = Math.min(start + CHUNK_SIZE, size - 1);
  console.log("start : " + start)
  console.log("end : " + end)
  console.log("range : " + range)
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": size,
    "Content-Type": "video/mp4;charset=UTF-8",
  };
  res.writeHead(206,headers)
 // fs.createReadStream(music,{start,end}).pipe(res)
  fs.createReadStream(path,{start,end}).pipe(res)



})


server.post('/delete',function(req,res){

 Email = req.body.Email
 Title = req.body.Title
 db.query('Delete from Content where Email = "' + Email + '" and Title = "' + Title+ '"',function(err,result){
    if(err){
      console.log(err)
    }
    else{
      console.log(result)
      res.send("delete successfully")
    }

 })

})


server.post("/addNewMovie",function(req,res){
  let anime = req.files.movie
  let Email = req.body.Email
  let Category = req.body.Category
  console.log(movie)
  let path = rootPath + Email + '/' + Title + '.mp4' 
  fs.writeFile(path,movie.data,function(){
    console.log('done')
  })
  })