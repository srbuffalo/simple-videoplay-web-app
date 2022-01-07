import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Link,Switch, Redirect} from "react-router-dom";
import axios from 'axios';
import Movie from './Movie';
import Item from "./item";
import Search from './search';

import Background from './icons/background.gif';
import settingIcon from './icons/preview.svg';
import Default_empty from './icons/empty.jpg';


class App extends React.Component{


    constructor(){
        super();
        this.newItem_image = "";
        this.newItem_video = "";
        
    }    

    
//Signup, Signin and logout function implementation
    signup = async () =>{
        var username = document.getElementById('signup_username').value
        var password = document.getElementById('signup_password').value
        var confirm = document.getElementById('signup_confirm').value
        if(confirm !== password){alert("Two Passwords don't match");return;}
        await axios.post('http://localhost:3001/signup',{username:username,password:password})
             .then(res=>{console.log('res');console.log(res);})
             .catch(err=> {console.log('err');console.log(err)})

        document.getElementById('cover').setAttribute('onclick',"");
        document.getElementById('cover').removeAttribute('class','show');
        document.getElementById('Sign_up_box').style.display = "none";
       
    }

    signin = async() =>{
        var username = document.getElementById('signin_username').value
        var password = document.getElementById('signin_password').value
        var token_and_username = await axios.post('http://localhost:3001/signin',{username:username,password:password})
             .then(res=>{console.log('res');console.log(res);return res.data})
             .catch(err=> {console.log('err');console.log(err.response);
                if(err.response.status === 404){alert('There is something wrong in the server.Please try it later')}
                else if (err.response.status === 403) {alert("Account doesn't exist or username/password doesn't match")}
                return false
            })
        
        if(token_and_username === false){return}
        localStorage.setItem('token',token_and_username.token);
        localStorage.setItem('uid',token_and_username.uid);
        document.getElementById('cover').setAttribute('onclick',"");
        document.getElementById('cover').removeAttribute('class','show');
        document.getElementById('Sign_in_box').style.display = "none";
        document.getElementById('Sign_in').style.display = "none";
        document.getElementById('setting').style.display = "block";
        document.getElementById('Account_user').innerHTML = 'User : ' +localStorage.getItem('uid');
    }


    signin_cover_cancel = () =>{
        document.getElementById('cover').removeAttribute('class','show');
        document.getElementById('Sign_in_box').style.display = "none";
        document.getElementById('cover').setAttribute('onclick',"");
    }

    signin_interface = () =>{
        console.log('dasdhak')
        for (let input of document.getElementById("Sign_up_box").getElementsByTagName('input')){
            input.value = "";
        }
        document.getElementById("Sign_up_box").style.display = "none";
        document.getElementById("Sign_in_box").style.display = "flex";
        document.getElementById('cover').setAttribute('class','show');
        document.getElementById('cover').style.height = document.getElementById('root').scrollHeight + "px";
        document.getElementById('cover').onclick = this.signin_cover_cancel;
    }

    signup_cover_cancel = () =>{
        document.getElementById('cover').removeAttribute('class','show');
        document.getElementById('Sign_up_box').style.display = "none";
        document.getElementById('cover').setAttribute('onclick',"");
    }

    signup_interface = () =>{
        for (let input of document.getElementById("Sign_in_box").getElementsByTagName('input')){
            input.value = "";
        }
        document.getElementById("Sign_in_box").style.display = "none";
        document.getElementById("Sign_up_box").style.display = "flex";
        document.getElementById('cover').style.height = document.getElementById('root').scrollHeight + "px";
        document.getElementById('cover').onclick = this.signup_cover_cancel;
    }

    logout = ()=>{
        localStorage.clear();
        window.location.replace('http://localhost:3000');
    }

// Upload new Movie function implementation
    upload_interface = () =>{
        document.getElementById('Upload_box').style.display = "block";
        document.getElementById('cover1').setAttribute('class','show');
        document.getElementById('cover1').style.height = document.getElementById('root').scrollHeight + "px";
    }

    upload_cover_cancel = () =>{
        document.getElementById('cover1').removeAttribute('class','show');
        document.getElementById('Upload_box').style.display = "none";
    }

    image_change = (e) =>{
        let image = e.target.files[0]
        console.log(image === undefined)
        if (image !== undefined){
            document.getElementById('chosen_image').value = (image.name);
            document.getElementById('preview').src = URL.createObjectURL(image);
            this.newItem_image = image;}
        else{
            document.getElementById('chosen_image').value = "";
            if (document.getElementById('imageUrl').val === undefined){
                document.getElementById('preview').src = Default_empty;
            }
        }
        
    }

    image_error = (e) =>{
        console.log(e.target);
    }

    video_change = (e) =>{
        let video = e.target.files[0];
        if (video !== undefined){
            document.getElementById('chosen_video').value = video.name;
            this.newItem_video = video;
        }
        else{
            document.getElementById('chosen_video').value = "";
        }
    }

    chosen_url = async() =>{
        let url = document.getElementById('imageUrl').value;
        if(url === ""){
            return;
        }
        document.getElementById('preview').src = url;
        let blob = await this.urltoBlob(url)
        this.newItem_image = blob 
    }
    

    upload_complete = () =>{
        
        if(this.newItem_image === "" || this.newItem_video === "" || document.getElementById('new_movie_name').value === ""){
            alert('error');
            return;
        }
        var data = new FormData();
        data.append('video', this.newItem_video);
        data.append('image', this.newItem_image);
        data.append('name', document.getElementById('new_movie_name').value);
        axios.post('http://localhost:3001/uploadItem',data,
            {
            // Show upload progress
            onUploadProgress: (progressEvent) => 
                {
                    if (progressEvent.lengthComputable) 
                    {
                        console.log(progressEvent.loaded + ' ' + progressEvent.total);
                        if(this.newItem_video !== ""){
                            document.getElementById('upload_progress_cover').style.visibility = "hidden";
                            var progressBar = document.getElementById('upload_progress')
                            var progress = Math.round(100*(progressEvent.loaded/progressEvent.total)) + "%";
                            progressBar.value = progress;
                            progressBar.style.width = progress;
                                                     }
                    }
                }
            }
        )
            .then(res=>{alert("finished");
                    document.getElementById('upload_progress_cover').style.visibility = "visible";
                    var progressBar = document.getElementById('upload_progress');
                    progressBar.style.width = "0";
                    progressBar.value="";
                    document.getElementById('new_movie_name').value = "";
                    document.getElementById('imageUrl').value = "";
                    document.getElementById('chosen_image').value = "";
                    document.getElementById('chosen_video').value = "";
                    this.upload_cover_cancel();
                })
            .catch(err=>{alert('error' + err)
                    document.getElementById('upload_progress_cover').style.visibility = "visible";
                    var progressBar = document.getElementById('upload_progress');
                    progressBar.style.width = "0";
                    progressBar.value="";
                    document.getElementById('new_movie_name').value = "";
                    document.getElementById('imageUrl').value = "";
                    document.getElementById('chosen_image').value = "";
                    document.getElementById('chosen_video').value = "";
                    this.upload_cover_cancel();
            })


         
    }

     urltoBlob = async (url)=> {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded urls - see SO answer #6850276 for code that does this
        var byteString;
        var dataurl = url;
    
        try{
            byteString = atob(dataurl.split(',')[1]);}
        catch(error){
             dataurl = await fetch(url)
            .then(res => res.blob())
            .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
            })).then(res=> res)
            
            byteString = atob(dataurl.split(',')[1]);
        }
        
        // separate out the mime component
        var mimeString = dataurl.split(',')[0].split(':')[1].split(';')[0];
        console.log("m :\n" +mimeString)
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    
    }


    componentDidMount = ()=>{
        if(localStorage.getItem('token')!== null){
            axios.post('http://localhost:3001/tokenVerify',{username:localStorage.getItem('uid'),token:localStorage.getItem('token')})
                 .then(res=>{
                    if(res.data === true){
                    document.getElementById('Sign_in').style.display = 'none';
                    document.getElementById('setting').style.display = 'block';
                    document.getElementById('Account_user').innerHTML = "User : " + localStorage.getItem('uid');
                }
                 })
                 .catch(err=>{console.log(err)})
        }
    }

    

    search = () =>{
        var searchContent = document.getElementById('searchContent').value;
        console.log(searchContent)
        window.location.href = "http://localhost:3000/search?content=" + searchContent;

    }


    
//--------------------------------------------------------------------------------------------
    render(){
        console.log('render1')
        return(
            <Router >
                <div id='cover' ></div> 
                <div id='cover1' ></div> 
            
            
                <div id="Sign_in_box">
                    <div id="Sign_in_Background">
                        <img src={Background} ></img>
                        <h2> Inception</h2>
                    </div>
                    <input  id='signin_username' type='text' placeholder='Username or Email' className='Sign_in'></input>
                    
                    <input id='signin_password' type='password' placeholder='Password' className='Sign_in'></input>
                    
                    <button className='Sign_in' onClick={this.signin}> Sign in</button>

                    <div className='Signup_ForgetPassword'>
                        <span> Forgot Password?</span>
                        <span onClick={this.signup_interface}> Sign up</span>
                    </div>
                </div>



                <div id="Sign_up_box">
                    <div id="Sign_up_Background">
                        <img src={Background} ></img>
                        <h2> Inception</h2>
                    </div>
                    <input id='signup_username' type='text' className='Sign_up' placeholder='Username or Email' ></input>
                    
                    <input id='signup_password' type='password' className='Sign_up' placeholder='Password' ></input>

                    <input id='signup_confirm' type='password' className='Sign_up' placeholder='Confirm Password' ></input>
                    
                    <button className='Sign_up' onClick={this.signup}> Sign up</button>

                    <div className='Sign_in'>
                        <span>Already have account?</span>
                        <span id="Signup_Signin" onClick={this.signin_interface}> Sign in</span>
                    </div>
                </div>


                <div id='Upload_box'>
                    <div id="preview_wrapper">
                        <button id='closeX_1'
                            onClick={this.upload_cover_cancel}>
                            X
                        </button>
                        <img id="preview" src={Default_empty} onError={this.image_error}/>
                    </div>
                    <div id="Upload_options">

                        <div>
                            <input id="new_movie_name"  type="text" placeholder='Enter Movie Name *'/>
                        </div>
                        <div>
                            <input type='text' id="chosen_image" disabled placeholder='Choose an Image File'/>
                            <label>Select an image
                                <input id="image_select" type='file' onChange={this.image_change} accept='image/*'/>
                            </label>
                        </div>

                        <div>
                            <input id="imageUrl" placeholder="Enter a Link and Click Button" type='text'/>
                            <label onClick={this.chosen_url}>Use URL Image </label>
                        </div>

                        <div>
                            <input type='text' id="chosen_video" disabled placeholder='Choose an Video File *'/>
                            <label>Select a Video 
                                <input id="video_select" type='file' onChange={this.video_change} accept='video/*'/>
                            </label>
                        </div>
                        <div>
                            <input id='upload_progress' disabled/>
                            <span id="upload_progress_cover"> Upload progress </span>
                        </div>
                        

                    </div>
                    <button id="upload_complete" onClick={this.upload_complete}> upload </button>
                </div>

                <div id='settingbar'> 
                        <h2 id='settingHeadline'> Account </h2>

                        <button id='closeX'
                            onClick={()=>{document.getElementById('settingbar').removeAttribute('class');
                                        document.getElementById('cover').removeAttribute('class')}}>
                            X
                        </button>
                        
                        <div id='settingBody'>
                            <div  className='settingOptions' id='Account_user' > </div>
                            <button id='upload' onClick={this.upload_interface}> Upload </button>
                                            
                            
                            <div  className='settingOptions' id='logout' onClick={this.logout}>
                                            logout
                            </div>
                        </div> 
                    </div>
                    <img id='setting' src={settingIcon} alt='Exclusive Free User Icon by Stockio.com'
                            onClick={()=>{document.getElementById('settingbar').setAttribute('class','show');
                            document.getElementById('cover').setAttribute('class','show');
                            document.getElementById('cover').style.height = document.getElementById('root').scrollHeight + "px";
                            }}/>
                
                    <div id='headline'>
                        <span id="logo" ><Link to='/' style={{textDecoration:'none',color:'white'}}>Inception</Link></span>
                        <div id='search_box'>
                            <div id='search_container'>
                                <input maxLength={50} id='searchContent' placeholder='Search Movie'/>
                                <svg id='searchIcon' onClick={this.search}>
                                    <circle cx="12" cy="18" r={Math.sqrt(98)} stroke="white" stroke-width="3" fill='#B3ACAC'/>
                                    <line x1="19" y1="25" x2="29" y2="35" style={{stroke:'white',strokeWidth:'5'}} />
                                </svg>
                            </div>
                        </div>
                        <button id = "Sign_in" onClick={this.signin_interface}>Sign in</button>
                    </div>
                      

                <div id='content_box'>
                    <div id='navbar'>
                                <a href='/Movie' className='Options'> Movies</a>
                    </div> 
                    <div id="total_content">
                            <Switch>
                                
                                <Route exact path="/Movie" component={Movie}></Route>
                            
                                <Route exact path='/play' component={Item}></Route>

                                <Route exact path='/search' component={Search}></Route>
                            
                            </Switch>    
                    </div>
                </div>
            </Router>
        )
    }




//this.tokenVerify()

/* if(!this.state.login){
    return (
        <div style={{
            position:'absolute',
            width:'100vw',
            height:'100vh'}}>

            <img style={{
                zIndex:'1',
                position:'absolute',
                padding:'0',
                margin:'0',
                width:'100vw',
                height:'100vh'}}
                src={Background} alt='image from https://giphy.com/gifs/night-scenery-moonlight-jGeVGVZB8iCT6'></img>        

            <div style={{fontSize:'100px',position:'absolute', left:'50%',top:'70%',transform:'translateX(-50%)',zIndex:'2',color:'white',fontFamily:'Brush Script MT, cursive'}} > Inception</div>
            <div style={{zIndex:'2',color:'white',position:'absolute', right:'10px',top:'0',fontSize:'20px',fontWeight:'bolder'}} onClick={()=>document.getElementById('login').style.display='block'}> Login </div>
            <div id='login'> 
                    <div className='login'>
                        <span>Email</span><br/>
                        <input  id='email' type='email' placeholder='Enter your Email'></input><br/>
                    </div>
                    <br/>
                    <div className='login'>    
                        <span>Password</span><br/>
                        <input id='password' className='login' type='password' placeholder="Enter your password"></input><br/>
                        <span id='failedLogin' style={{color:'red',position:'relative',display:'none'}}>Incorrect Email/Password</span>
                    </div>
                    <br/>
                    <button onClick={this.login}> log in </button>
                    <button onClick={this.signup}> sign up </button>

            </div>
        </div>
    )
}*/


}


export default App;
