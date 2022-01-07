# simple-videoplay-web-app

How to run this project? 
1. Installed Node.js and Visual studio Code;
2. Pull/download data ;
3. cd to directory "Inception" and run "npm install package-lock.json";(This might take some time)
4. Go to "Inception/my-app/src/server.js" and find "var db = database.createConnection" ,then fill up the missing information; Go to .env file and chaneg two variables: "public_movies_cover"---- where you store the uploaded movie cover; "public_movies" ---- where you store the uploaded movies;
5. Open two terminals in visual studio code in directory "Inception" , one run "cd my-app & npm start" (Frontend); the other one run "cd my-app/src & node server.js" (Backend);

Once everything worked correctly, then you should be able to see the following image(If it doesn't open a webpage automatically,you can open it by type "localhost:3000" in your browser. The test browser is Chrome, so Chorme is recommended):
  ![image](https://user-images.githubusercontent.com/54557154/148615579-8f524208-37d4-47a6-8d24-f680ad561e2e.png)

# What functionalitys does this web app have? (demostration.mp4 is a video demonstration of this app)
1. Click Sign in, then click "Sign up" and register a new account; (There is no limitation about username and password for now);
2. Click Sign in and use the account you just registered to log in; (You should be able to see a user icon in the top left spot);
3. Click user icon and a Setting bar will appear, then click "upload" and fill up the necessary information (Movie_name, Chosen_video, image file /image Url), then upload the movie; (A dialog says "finished" appear means you upload video successfully, the larger file will take longer time, <100 MB should take <10 seconds);
4. Click "Movie" and your url will redirect to "localhost:3000/Movie" and the you should be able to see the file you just upload;
5. Click the movie and it will lead to "localhost:3000/play" and you should be able to play the movie you just uploaded;
The following image is a demonstration:
![image](https://user-images.githubusercontent.com/54557154/148617036-647becce-3b07-45a4-a5ee-d5568cc53273.png)
![image](https://user-images.githubusercontent.com/54557154/148617319-afa0241d-0bfb-4422-8d2d-09bb12da3c0a.png)

6. Enter the movie name in "Search Movie" area and click magnifer icon to implement search functionality. 




