const server = require('express')();
const database = require('mysql');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config()
const token_secret = process.env.token_secret;
const public_movies_cover = process.env.public_movies_cover;
const public_movies = process.env.public_movies;
const Salt = process.env.pre_salt;
const Saltround = 5;
//require('crypto').randomBytes(64).toString('hex')        ------create token secret 
//const { resolve } = require('path');

//server.use(require("cookie-parser")());   //interpret cookies from client side
server.use(require('cors')());
server.use(require('body-parser').json())
server.listen('3001',function(){console.log("awesome")});
const fileUpload = require('express-fileupload');

server.use(fileUpload());

var db = database.createConnection({
  host: 'your_host',
  port:"your_port",
  user: "your_username",
  password: "your_password",
  database: "your_database",
  dateStrings: true
});

db.connect((err) => {
    if(err){
     console.log('error')
     console.log(err)
      return;
    }
    else{
      console.log('Connection established');
      let create_Movie_table_if_not_exists = "CREATE TABLE IF NOT EXISTS Movies (Id int AUTO_INCREMENT, MovieName varchar(100) NOT NULL, AddTime DATETIME , FileName varchar(100) NOT NULL, ImageFormat varchar(20), VideoFormat varchar(20), PRIMARY KEY (Id), UNIQUE (FileName));"
      let create_User_table_if_not_exists = "CREATE TABLE IF NOT EXISTS Users (UserId int AUTO_INCREMENT, UserName varchar(50) NOT NULL, Password varchar(200) NOT NULL, Salt varchar(200) NOT NULL, SignupTime DATE default (CURDATE()), PRIMARY KEY (UserId), UNIQUE (UserName));"
      db.query(create_Movie_table_if_not_exists);
      db.query(create_User_table_if_not_exists);
    }
  });


getCurrentTime = () =>{
  var today = new Date();
  var date = today.getFullYear() + '-' + (today.getMonth()+1) +'-' + today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + ' ' + time;
  var filename = today.getFullYear() + "" +(today.getMonth()+1) + "" + today.getDate() + "" + today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
  return [filename,dateTime];
}

server.get("/movies", function(req,res){
  let page = 1;  
  let num = 12;
  if (typeof(req.query.page) !== 'undefined'){
    page = Number(req.query.page) < 1 ? 1 : Number(req.query.page);
  }
  if (typeof(req.query.num) !== 'undefined'){
    num = Number(req.query.num) < 1 ? 1 : Number(req.query.num);
  }
  
  var Get_all_movies = "SELECT * FROM Movies WHERE Id > " + ((page-1)*num) + " ORDER BY Id limit " + num + " ;";
  db.query(Get_all_movies,async function(err,data){
    
    if (err) {console.log("Unable to get movies from db : " + err);res.sendStatus(400);}
    else {
      
      res.send(data);
    }
  })
  
})


server.get("/search", function(req,res){
  let page = 1;  
  let search_content = "";
  let num = 12;
  console.log(req.query)
  if (typeof(req.query.page) !== 'undefined'){
    page = Number(req.query.page) < 1 ? 1 : Number(req.query.page);
  }
  if (typeof(req.query.content) !== 'undefined'){
    search_content = req.query.content;
  }
  if (typeof(req.query.num) !== 'undefined'){
    num = Number(req.query.num) < 1 ? 1 : Number(req.query.num);
  }
  var Get_all_movies = "SELECT * FROM Movies WHERE Id > " + ((page-1)*num) + " and MovieName LIKE '%" + search_content + "%' ORDER BY Id limit " + num + " ;"
  
  console.log(Get_all_movies)
  
  db.query(Get_all_movies,async function(err,data){
    
    if (err) {console.log("Unable to get movies from db : " + err);res.sendStatus(400);}
    else {
      
      res.send(data);
    }
  })
  
})

server.get("/movies/covers",function(req,res){
  if (typeof(req.query.name) === "undefined"){
    return;
  }
  else{
    path = public_movies_cover + req.query.name;
    fs.readFile(path,function(err,data){
      if (err) {console.log("Error happend when reading image" + err);res.status(400).send('The file was removed')}
      else {
        res.send(data);
      }
    })
  }
})


server.get('/getmovie',function(req,res){
  
  var id = req.query.id;
  if (id === 'undefined'){
    res.status(400).send('there is a error');
    return;
  }
  var query = "SELECT * FROM Movies WHERE Id = " + id;
  db.query(query,function(err,result){
    if (err) {console.log('error when read information of the video : ' + err);}
    else{
      var data = result[0]
      res.send(data);
    }
  })

})

server.get('/audio&video_play',async function(req,res){
  let query = "SELECT * FROM Movies WHERE Id = " + req.query.id;
  let path = await new Promise(
                    (resolve,reject)=>{
                      db.query(query,
                        function(err,data){
                          if (err) {reject("Failed to load video")}
                          else {resolve(data)}
                        }
                      )
                    }           
                  )
                  .then(res=>res[0])
                  .then(res=>public_movies + res.FileName + res.VideoFormat)
                  .catch(err =>{console.log('failed to load video');return;})
  if (path === undefined){
    return
  }
  let size = ""
  try {
    size = fs.statSync(path).size
  } catch (error) {
    console.log("There is no such file " + error) ;
    return
  }
  
  const range = req.headers.range;
  const CHUNK_SIZE = 10 ** 7; // 1MB = 10 ** 6
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, size - 1);
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": size,
    "Content-Type": "video;charset=UTF-8",
  };
  res.writeHead(206,headers)
  
 // fs.createReadStream(music,{start,end}).pipe(res)
  fs.createReadStream(path,{start,end}).pipe(res)
})


server.get("/getNumberofMovies",function(req,res){
  var search_content = typeof(req.query.content) !== 'undefined'? req.query.content : ""
  var query;
  if (search_content == ""){query = 'SELECT COUNT(Id) FROM Movies'}
  else{query = "SELECT COUNT(Id) FROM Movies WHERE MovieName LIKE '%" + search_content + "%';"}
  db.query(query,function(err,data){
    if (err) {console.log('error here:' + err);res.sendStatus(404)}
    else  
    {
      res.send( {'number':data[0]['COUNT(Id)']});
    }
  })
})


server.post("/uploadItem",async function(req,res){
  var video = req.files.video;
  var image = req.files.image;
  var name = req.body.name;
  var image_format = image.mimetype.split('/')[1]
  var video_format = video.mimetype.split('/')[1]
  console.log(getCurrentTime())
  console.log("Before write: " + getCurrentTime()[1]);
  res.send('Upload completed. Please wait for a while before the movie was stored');
  await new Promise((resolve,reject)=>{
    var [filename,addTime] = getCurrentTime();
    var fileName = filename + "_" + name + ".";
    fs.writeFile(public_movies_cover + fileName + image_format, image.data ,function(err){
      if (err) {console.log(err);reject('error');}
    })
    fs.writeFile(public_movies + fileName + video_format, video.data,function(err){
      if (err) {console.log(err);reject('error');}
      else{
        console.log(getCurrentTime());
        console.log('finished');
        resolve([fileName,addTime]);}
    })
  })
    .then(res=>
      { 
        var [fileName, addTime] = res;
        var query = 'INSERT INTO Movies (MovieName, AddTime, FileName, ImageFormat, VideoFormat) VALUES ("' + name + '", "' + addTime + '", "' + fileName  + '","'  + image_format + '","' + video_format + '")'
        db.query(query,function(err,result){
          if (err) {console.log("failed to write to database : " + err)}
        })
      }
    )
    .then(data=>console.log('finished'))
    .catch(err => console.log("Failed to write a file : " + err))
  
})


//-----------------------------------------------------------------------------------------

// generate Token based on email that was submitted when email/password mathces

function generateToken(username){
  return jwt.sign(username,token_secret) 
}
// check token to determine user's login status
function tokenCheck(username,token){
    var passed = true
    try{
     passed = username === jwt.verify(token,token_secret)}

    catch(err){
      console.log(err)
      passed = false
    }

    finally{
      return new Promise((resolve,reject)=>{resolve(passed)})
    }
}

server.post('/signup',async function(req,res){

 // (UserId int AUTO_INCREMENT, UserName varchar(50) NOT NULL, Password varchar(200) NOT NULL, Salt varchar(200) NOT NULL, SignupTime DATE default (CURDATE()), UserAvatar varchar(20), PRIMARY KEY (UserId), UNIQUE (UserName));"
  var username = req.body.username;
  var password = req.body.password;
  console.log(username, password)
  var checkDuplicated = "SELECT * FROM Users WHERE UserName ='" + username + "' LIMIT 1";
  
  var Duplicated = await new Promise(
    (resolve,reject)=>{
      db.query(checkDuplicated,function(err,results){
        if(err){console.log('Error happend when check duplicated account in database');console.log(err);reject(true);}
        else{
          if (results.length === 1){
            reject(true);
          }
          else {resolve(false);}
        }
      })
    }
  ).then(res=>false).catch(err=>true);

  if(Duplicated){res.send(false);return;}

  var salt = await bcrypt.genSalt(Saltround);
  password = await bcrypt.hash(password,Salt);
  password = await bcrypt.hash(password,salt);
  var createNewUser = "INSERT INTO Users (UserName, Salt, Password) VALUES ('" + username + "','" + salt + "','" + password + "')";
  var createdSuccessfully = await new Promise(
    (resolve,reject)=>{
      db.query(createNewUser,function(err,results){
        if(err){console.log('Error happend when created new user in database');reject(false);}
        else{ resolve(true);}
      })
    }
  ).then(res=>true).catch(err=>false)
  
  if (!createdSuccessfully){
    res.send(false);
  }
  else{
    res.send(true);
  }
 
}
)

server.post('/signin',async function(req,res){

    // (UserId int AUTO_INCREMENT, UserName varchar(50) NOT NULL, Password varchar(200) NOT NULL, Salt varchar(200) NOT NULL, SignupTime DATE default (CURDATE()), UserAvatar varchar(20), PRIMARY KEY (UserId), UNIQUE (UserName));"
     var username = req.body.username;
     var password = req.body.password;
     console.log(username, password)
     var checkExists = "SELECT * FROM Users WHERE UserName ='" + username + "' LIMIT 1";
     var data = null
     var Exists = await new Promise(
       (resolve,reject)=>{
         db.query(checkExists,function(err,results){
           if(err){console.log('Error happend when check duplicated account in database');console.log(err);res.status(404).send('Error happen in server');return;}
           else{
             console.log(results)
             if (results.length === 1){
               data = results[0]
               resolve(true);
             }
             else {reject(false);}
           }
         })
       }
     ).then(res=>true).catch(err=>false);
     if(!Exists){res.status(403).send("Account doesn't exist or the username/password doesn't match");return;}
     password = await bcrypt.hash(password,Salt);
     password = await bcrypt.hash(password,data.Salt);
     if(password !== data.Password){res.status(403).send("Account doesn't exist or the username/password doesn't match");return}
     var token = {'token':generateToken(username),'uid':username}
     
     res.send(token)
   }
   )


server.post('/tokenVerify',async function(req,res){
  console.log('miracle exists')
  var token = req.body.token;
  var username = req.body.username;
  var passed = await tokenCheck(username,token).then(res=>res)
  if(passed){
    res.send(true)
  }
  else{
    res.send(false)
  }
  

})



