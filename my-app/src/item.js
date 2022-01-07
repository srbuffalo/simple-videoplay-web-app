import axios from 'axios';
import React from 'react';
import "./item.css";


export default class Item extends React.Component{

    constructor (props){
        super(props);
        this.info = {}
    }

   
   
   componentDidMount = async () =>{
        let value_key = window.location.search.substring(1).split('&').map(param => param.split('='))
                              .reduce((values, [ key, value ]) => {values[ key ] = value;return values}, {})
        let id = value_key['id'];
        document.getElementById("videoPlayer").src = "http://localhost:3001/audio&video_play?id=" + id;
        var getMovie = await axios.get("http://localhost:3001/getmovie?id=" + id)
             .then(res => {this.info = res.data;console.log(this.info);return true;})
             .catch(err => {console.log(err);return false;})
        if(!getMovie){return};
        document.getElementById('video_title').innerHTML = this.info.MovieName;
        document.getElementById('d_title').innerHTML = this.info.MovieName;
        document.getElementById('d_date').innerHTML = this.info.AddTime.substring(0,10);
   }
  


    render(){
        
        return(
            <div id="content" className='Movie_playing'>
                <div id="movie_part">
                    <div id="container">
                        <h2 id='video_title'></h2>
                        <video id="videoPlayer" src controls>    
                        </video>
                        
                    </div>
                    <div id="description">
                        <div className='description'>
                            <span>Title:&nbsp;&nbsp;</span>
                            <div id="d_title"></div>
                        </div>
                        <br/>
                        <div className='description'>
                            <span>Date:&nbsp;&nbsp;</span>
                            <div id="d_date"></div>
                        </div>
                        <br/>
                        <div className='description'>
                            <span>Summary:&nbsp;&nbsp;</span>
                            <div id="d_summary">world</div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }


}