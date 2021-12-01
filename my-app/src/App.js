import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Link,Switch} from "react-router-dom";
import axios from 'axios';



import Movie from './Movie';




import Background from './icons/background.gif';
import settingIcon from './icons/setting.png';


import Xmyrz from './BGM/xmyrz.mp3';
import Xmyrz1 from './BGM/xmyrz1.mp3';





const BGM_Mode = ['顺序循环','单曲循环','随机播放'];
const BGM = [Xmyrz,Xmyrz1];

class App extends React.Component{


constructor(){
    super();
    this.previousBGM = '';
    this.BGM = Xmyrz;
    this.currentBGMMode = '顺序循环';
    this.state = {
        login:false
    }
}    

// Memorizing user's login status unless they log out or close browser
tokenVerify = () =>{
    if(localStorage.getItem('Token'))
    {
        if (!this.state.login)
            this.setState({
                login:true
            })
    }    
}

// send Email and password to backend to check if account/password match,if so, login and store token ;
login = () =>{
    let Email  = document.getElementById('email').value
    axios.post('http://localhost:3001/login',
        {Email:document.getElementById('email').value,Password:document.getElementById('password').value})
        .then(res=>{
                this.setState({login:true},
                    function(){localStorage.setItem('Email',Email);
                              localStorage.setItem('Token',res.data)
            })
                }
                ///callback for failure login
                ,()=> document.getElementById('failedLogin').style.display= 'block')  
        .catch(err=> console.log(err))    
}

signup = () =>{
    let Email  = document.getElementById('email').value
    let Password = document.getElementById('password').value
    axios.post('http://localhost:3001/signup',
        {Email:Email,Password:Password})
        .then(res=>{
            
            if(res.data.length !== 0){
                alert(res.data + '\n' + 'This is your account information:' 
                    +"\n" + 'Email : ' + Email
                    +"\n" + 'Password : ' + Password)
                
                document.getElementById('email').value = ''
                document.getElementById('password').value = ''    
            }
    
        })
        .catch(err=> console.log(err))    


}

displayChangeSettingOptions = (event,elem) =>{
  
    if(event.currentTarget !== event.target) return
    

    let q = document.getElementById(elem);
    if (q.style.display ==='none'){
        q.style.display = 'flex';
        q.style.flexDirection='column';
    }
    else
        q.style.display = 'none';

}

BGMChange = (val) => (event) =>{
   
    if(this.previousBGM !== ""){
        this.previousBGM.style.background= "white";
        this.previousBGM = event.currentTarget;}
    else{
        document.getElementById('BGM_0').style.background = 'white';
        this.previousBGM = event.currentTarget;
    }
    this.BGM = val;
    document.getElementById('BGM').src = this.BGM;
    document.getElementById('BGM').play();
    event.currentTarget.style.background='#E1E1E1';
    document.getElementById('BGMSetting').childNodes[0].nodeValue = 'BGM : (' + event.currentTarget.innerHTML + ')'; 
    console.log(this.BGM)
}

BGMModeChange = () =>{
    
    if (this.currentBGMMode === BGM_Mode[0])
        this.currentBGMMode = BGM_Mode[1]
    else if (this.currentBGMMode === BGM_Mode[1])
        this.currentBGMMode = BGM_Mode[2]
    else
        this.currentBGMMode = BGM_Mode[0]

    document.getElementById('BGMMode').innerHTML = 'BGM_Mode : ' + this.currentBGMMode;


}

playNext = () =>{
    let number = 0;
    if (this.currentBGMMode === '顺序循环')
        {   
            for(let i=0;i<2;i++){
                if(this.BGM === BGM[i]){
                    if(i === 1){
                        this.BGM = BGM[0];
                        number = 0;
                    }
                    else
                       {
                        this.BGM = BGM[i+1];
                        number = i+1;
                    }

                    break
                }
            }
        }

    else if (this.currentBGMMode === '随机播放'){
        let randomSongNumber = Math.floor(Math.random()*2);
        while(this.BGM === BGM[randomSongNumber]){
            randomSongNumber = Math.floor(Math.random()*2);
        }
        this.BGM = BGM[randomSongNumber];
        number = randomSongNumber;
    }

    else{
        document.getElementById('BGM').play();
        return;
    }

    if(this.previousBGM !== ""){
        this.previousBGM.style.background= "white";
        }
    else{
        document.getElementById('BGM_0').style.background = 'white';
    }
    
    this.previousBGM = document.getElementById('BGM_' + number);
    document.getElementById('BGM_' + number).style.background='#E1E1E1';
    document.getElementById('BGMSetting').innerHTML = 'BGM : (' + document.getElementById('BGM_' + number).innerHTML + ')'; 
    
    
    document.getElementById('BGM').src = this.BGM;
    document.getElementById('BGM').play();

}


setCategory = (e) =>{
    localStorage.setItem('Category',e.currentTarget.innerHTML);
    Array.from(document.getElementsByClassName('Options')).forEach((each)=>each.style.opacity=0.5);
    e.currentTarget.style.opacity=1;

}

logout = async() =>{
    this.setState({
        login: await new Promise((resolve,reject)=>{
            localStorage.clear();resolve(false)})
    },()=>window.location.href="http://www.localhost:3000")
}

BGMVisibility = (e) =>{
    
    document.getElementById('BGM').style.visibility = e.currentTarget.innerHTML === 'H'? 'visible': 'hidden'
    e.currentTarget.innerHTML = e.currentTarget.innerHTML === 'H' ? 'V' : 'H' 

}


render(){

console.log(this.state.login)
this.tokenVerify()

if(!this.state.login){
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
}

else return(
<Router>
    <div id='cover'></div> 
    <div id="whole_page">
        <div id='settingbar'> 
            <h2 id='settingHeadline'> Setting </h2>
        
            <button id='closeX'
                onClick={()=>{document.getElementById('settingbar').removeAttribute('class');
                            document.getElementById('cover').removeAttribute('class')}}>
            X</button>
            
            <div id='settingBody'>
                <div className='settingOptions' id='BGMSetting' onClick={(e)=>{this.displayChangeSettingOptions(e,'BGMContent')}}>
                                BGM : 夏目友人帐
                    <span onClick={(e)=>this.BGMVisibility(e)} id='BGMVisibility' style={{textAlign:'center',borderRadius:'50%',border:'1px solid black',background:'white',width:'25px',height:'25px',right:'2px',position:'absolute',zIndex:'1'}}>
                        V
                    </span>    
                </div>    
                
                <div id='BGMContent' style={{display:'none'}}>
                                <div id='BGM_0' style={{background:'#E1E1E1'}} className='BGMItems' onClick={(e)=>this.BGMChange(Xmyrz)(e)}> 夏目友人帐 </div>
                                <div id='BGM_1' className='BGMItems' onClick={(e)=>this.BGMChange(Xmyrz1)(e)}> 夏目友人帐1 </div>      
                </div> 
                <div className='settingOptions' id='BGMMode' onClick={this.BGMModeChange}>
                                BGM_Mode : {this.currentBGMMode}
                </div>    
                
                <div  className='settingOptions' id='logout' onClick={this.logout}>
                                logout
                </div>
            </div> 
        
        
        
        </div>
        <div id='headline'>
            <img id='setting' src={settingIcon} alt='The setting icon By Pixel Perfect'
                 onClick={()=>{document.getElementById('settingbar').setAttribute('class','show');
                 document.getElementById('cover').setAttribute('class','show')}}/>
            <Link to='/' style={{padding:'0',margin:'0',textDecoration:'none'}}><h1 id="logo" >Inception</h1></Link>
            <audio id="BGM" controls onEnded={this.playNext}>
                    <source src={Xmyrz} type='audio/mp3' ></source>
            </audio>  
        </div>
        
        <div id='navbar'>
            
            <Link to='/Movie' className='Options' onClick={(e)=>this.setCategory(e)}> Movie</Link>
            
            
            <Link className='Options'><span> New Tag <span style={{fontWeight:'bold'}}>+</span></span></Link>
        </div>    
         
        <Switch>

           
            <Route path="/Movie" render={()=> <Movie  logout={()=>this.logout(this.callbackOfLogout)} />}></Route>
            
          
            <div id="body" >
            </div>
            
        </Switch>    
        
    </div>
    
</Router>
)



}





}


export default App;
