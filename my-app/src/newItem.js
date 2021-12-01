import React from 'react';
import './newItem.css';
import Item from './item';
import { Route, Link,Switch} from "react-router-dom";
import image from './icons/giphy.gif';
import image2 from './icons/Smiling Leo Perfect GIF.gif';
import axios from 'axios';

// This file was used when adding a new movie;

export default class newItem extends React.Component{

constructor(props){


super(props);

this.file = "";
this.imageFormat = "";
this.movie = "";
this.progress = 0;
this.hasCover = this.props.hasCover;
this.hasVideo = this.props.hasVideo;
}


uploadImage  = (e) =>{
console.log(e.target.files[0]);
document.getElementById('imagePlay').src  = URL.createObjectURL(e.target.files[0]);
console.log(document.getElementById('imagePlay').src);
console.log(image);
this.file =  e.target.files[0];

this.imageFormat = e.target.files[0]['type'].split('/')[1]
}    


save = () =>{

if(document.getElementById('name').value =='' ){
    alert('Movie name can not be empty!')
    return
}    
if (document.getElementById('imagePlay').src=='' && this.hasCover){
    alert('Movie cover can not be empty!')
    return
}


    
let file = new FormData();
file.append('Image',this.file);
file.append('Format',this.imageFormat)
file.append('Title',document.getElementById('name').value)
file.append('Description','')
file.append('Email',localStorage.getItem('Email'))
file.append('Category',localStorage.getItem('Category'))

if(this.movie !== "")
    {file.append('Movie',this.movie)
    
    axios.post('http://localhost:3001/newMovie',file,
    {headers:{auth:localStorage.getItem('Token')},
    onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
           console.log(progressEvent.loaded + ' ' + progressEvent.total);
           if(this.movie !== ""){
           this.progress = Math.round(100*(progressEvent.loaded/progressEvent.total))
           document.getElementById('progressBar').style.width =  this.progress + "%" 
           document.getElementById('progressBar').innerHTML =  this.progress + "%" }
           //this.updateProgressBarValue(progressEvent);
        }
        }
         })
     .then(res=>{console.log(res);
       if (res.data ==='Token Verification failed') {
            alert('Token Verification failed')
            this.props.logout()
        }
       else
         window.history.back()
        })
     .catch(err=>console.log(err))
   
        this.props.reloadData()
    }
else 
{
axios.post('http://localhost:3001/newMovie',file,{headers:{auth:localStorage.getItem('Token')}})
    .then(res=>{console.log(res);
       if (res.data ==='Token Verification failed') {
            alert('Token Verification failed')
            this.props.logout()
        }
       else
         window.history.back()
    })
    .catch(err=>console.log(err))
   
this.props.reloadData()

}
/*console.log(file.get('image'))

axios.post('http://localhost:3001/name-description',
{name:document.getElementById('name').value,description:document.getElementById('description').value})
.then(res=>{

console.log(res.data);

})
.catch(err=>console.log(err))

axios.post('http://localhost:3001/image',file)
.then(res=>{

    console.log(res.data);
    console.log(this.file);
    console.log(res.data.image['data'])
    let binary = Buffer.from(res.data.image['data']); 
    let imageFromServer = btoa(binary.reduce((data, byte) => data + String.fromCharCode(byte),''))
    document.getElementById('hello').src = "data:image/gif;base64,"+imageFromServer
   
    })
    .catch(err=>console.log(err))

*/

}

imag = async() =>{
    let url = document.getElementById('imageUrl').value
    document.getElementById('imagePlay').src = url;
    let blob = await this.urltoBlob(url)
    this.file = blob
    console.log(blob)
    this.imageFormat = this.file['type'].split('/')[1] 

    
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
    console.log(ia)
    //Old Code
    //write the ArrayBuffer to a blob, and you're done
    //var bb = new BlobBuilder();
    //bb.append(ab);
    //return bb.getBlob(mimeString);

    //New Code
    return new Blob([ab], {type: mimeString});

}

chooseMovie = (e) =>{
    this.movie = e.target.files[0]
}


uploadAnime = (e) =>{
    
    
    let f = new FormData()
    f.append('Movie',this.movie)
    f.append('Email',localStorage.getItem('Email'))
    f.append('Category',localStorage.getItem('Category'))
    axios.post("http://localhost:3001/addNewMovie",f,{
        onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                   console.log(progressEvent.loaded + ' ' + progressEvent.total);
                   if(this.movie !== ""){
                   this.progress = Math.round(100*(progressEvent.loaded/progressEvent.total))
                   document.getElementById('progressBar').style.width =  this.progress + "%" 
                   document.getElementById('progressBar').innerHTML =  this.progress + "%" }
                   //this.updateProgressBarValue(progressEvent);
                }
       }
    })
    
    }



render(){
    console.log(this.props)
    return(
        <div >
            <button onClick={()=>window.history.back()}style={{position:'absolute',fontSize:'20px',right:'0',width:'100px',height:'40px',fontWeight:'bold'}}> Back &larr;</button>
            <label for='name' style={{position:'relative',left:'40%',fontWeight:'bold'}}> {localStorage.getItem('Category') + ' Name :'} </label>
            <input id='name' style={{display:'inline'}}className='description' type='text' placeholder='Enter Movie Name'></input><br/>
            <img id='imagePlay' style={{display:this.props.hasCover?'block':'none',width:'250px',height:'250px'}}></img>
            
            <input style={{display:this.props.hasCover?(this.props.imageChoice=="upload"?"block":'none'):'none',}} className='description' id='image' type='file' accept='image/*' onChange={(e)=>this.uploadImage(e)}></input>
            <div style={{display:this.props.hasCover?(this.props.imageChoice=="urlLink"?"flex":'none'):'none',justifyContent:'center'}}className='description'>
                <button onClick={this.imag}>Use URL Image </button>&nbsp;&nbsp;&nbsp;
                <input id="imageUrl" placeholder="Enter a link and click button" type='text'/>
            </div>
            <input style={{display:this.props.hasVideo?'inline':'none',}}onChange={this.chooseMovie} id="video" type="file" ></input>
            <button onClick={()=>{this.movie="";document.getElementById('video').value=''}} style={{cursor:'pointer',display:this.props.hasVideo?'inline':'none',background:'none',fontWeight:'bold',color:'red',border:'none',fontSize:'18px'}} > X </button>
            <div className="progress">
                <div id="progressBar"
                  className="progress-bar progress-bar-info"
                  role="progressbar"
                  aria-valuenow={this.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  
                >
                  
                </div>
            </div>
           


            
            <br/>
            <button onClick={this.save} style={{position:'relative',left:'50%',transform:'translateX(-50%)',fontSize:'20px',width:'100px',height:'40px',fontWeight:'bold'}}> Save </button>
            
          
        </div>
    )

}






}