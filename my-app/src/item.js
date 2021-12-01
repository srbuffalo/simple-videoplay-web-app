import axios from 'axios';
import React from 'react';
import './list.css';
import { Route, Link,Switch,Redirect} from "react-router-dom";


export default class Item extends React.Component{

constructor(props){
    super(props);
    this.image = '';
    
    this.state = {
        delete:false,
        video:false
    }
    this.video = null;
}

getPhoto = () =>{
    axios.post('http://localhost:3001/checkMovie',{'Title':localStorage.getItem('checkingMovie'),'Email':localStorage.getItem('Email')})
    .then(res=>{
        /*console.log(res)
        console.log(res.data)
        console.log(res.data._streams[4])*/
        //console.log(res)
        this.image = btoa((res.data._streams[1].data).reduce((data, byte) => data + String.fromCharCode(byte),''))
        let data = JSON.parse(res.data._streams[4])
        document.getElementById('videoAvailable').style.display = data.Video !== ""? 'block': 'none'
        //console.log(this.image)
        document.getElementById('avatar').src = "data:image;base64," + this.image
        document.getElementById('title').innerHTML =  data.Title
        //document.getElementById('description').innerHTML = "Description : " + data.Description
       
        this.video = data.Video !== "" ? ("http://localhost:3001/audio&video_play?path="+ data.Video ): ""

    }
    
    
    )
    .catch(err=>console.log(err))


}

componentDidMount = () =>{
   
    this.getPhoto();
   
}

componentDidUpdate = () =>{
    if(!this.state.delete){
    console.log('did update')
    localStorage.setItem('checkingMovie',this.props.movieList[(parseInt(window.location.href.split('-')[1]))-1])
    setTimeout(this.getPhoto(),100)   
    }
}

componentWillUnmount = () =>{

    console.log('levae')
}



delete = () =>{


axios.post("http://localhost:3001/delete",{'Title':localStorage.getItem('checkingMovie'),'Email':localStorage.getItem('Email')})
     .then(res=>{
        localStorage.removeItem('checkingMovie');
        this.setState({
            delete : true
        },this.props.reloadData())
     })



}

componentWillUnmount = () =>{
    localStorage.removeItem('checkingMovie')
}

videoPlay = () =>{
    document.getElementById('videoWrap').style.display = 'block'
    document.getElementById('video').src = this.video
    
    console.log(document.getElementById('videoWrap').style.display)
    console.log(document.getElementById('video').style.width)
}


render() {
console.log('update')
if(!this.state.delete)

    return(
    <div style={{position:'absolute',width:'100%',height:'100%',top:'0'}}>
        <Link to ="/movie" style={{textDecoration:'none',position:'absolute',top:'10px',right:'10px'}} > BACK </Link>
        <span id='title' style={{display:'flex',alignItems:'center',position:'absolute',left:'0',height:'8%',top:'0',fontWeight:'bold',fontSize:'25px'}}></span>
        <img id='avatar' alt="loading" style={{bottom:'0',width:'400px',height:'92%',position:'absolute'}} src = {this.image} ></img>
        <div id="Description" style={{ bottom:'0',left:'420px',width:'400px',height:'92%',position:'absolute'}}>
            <div style={{display:'none'}} id='videoWrap'>
                <video width="400px" height="400px" id='video' style={{position:'absolute',left:'0',top:'0'}}controls>
                    <source />
                </video>

            </div>
            <button style={{height:'40px',width:'25%',bottom:'0',position:'absolute',left:'0'}} id='videoAvailable' onClick={this.videoPlay}>Play Video</button>

        </div>
        
        <button onClick={this.delete} style={{color:'red',fontWeight:'bold',fontSize:'12px',position:'absolute',top:'250px',right:'0',height:'20px',width:"80px"}}>Delete</button>
        
        
      
        <br/>
       
        

    </div>



    )
else
    return (<Redirect to="/Movie"/>)


}


}