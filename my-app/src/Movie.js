import "./Movie.css";
import React from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";
import Default_empty from "./icons/empty.jpg";


export default class Movie extends React.Component{

    constructor(){
        super();
        this.pages = [];
        this.numberofMovies = 0;
        this.max_page = 1;
        this.movie_list = [];
        this.state = {
            page : null,
            first_load: true,
            max_movies_in_one_page : 12
        }
    };
    
// Loading flow :  Mount => render => update information (getPage->getMovies->get movie_covers->get number of all movies ->modify page -> re-render to apply all update to pages)


    componentDidMount = async() =>{
        console.log('mount')
        this.setState({first_load:false})
    }


    componentDidUpdate = async()=>{
        console.log('update_states')
        var Query = await this.getPage();
        if (Query['page'] != this.state.page){
            
            await this.getMovies(Query);
            await this.modify_pages(await this.get_number_of_movies());
            var page = Number(Query['page'])
            if (page === 1){
                document.querySelector('[name = "First"]').style.display = 'none'
                document.querySelector('[name = "Prev"]').style.display = 'none'
            }
            else{
                document.querySelector('[name = "First"]').style.display = 'inline-block'
                document.querySelector('[name = "Prev"]').style.display = 'inline-block'
            }
            
            if (page === Math.max(this.max_page, 1)){
                document.querySelector('[name = "Next"]').style.display = 'none'
                document.querySelector('[name = "Last"]').style.display = 'none'
            }
            else{
                document.querySelector('[name = "Next"]').style.display = 'inline-block'
                document.querySelector('[name = "Last"]').style.display = 'inline-block'
            }

            

            this.setState({
                page : Number(Query['page'])
            })
        }
        console.log('update_states_finish')

    }    


    getPage = async() =>{
        console.log('getPage')
        let value_key = window.location.search.substring(1).split('&').map(param => param.split('='))
                              .reduce((values, [ key, value ]) => {values[ key ] = value;return values}, {})
        value_key['page'] = value_key['page'] === undefined ? 1 : value_key['page']
        return value_key;
    }


    getMovies =  async (Query) =>{
        console.log('getMovies')
        var page = Query['page'] !== undefined ? Query['page'] : 1
        for(let elem of Array.from(document.querySelectorAll('[class = "Box"]')).slice(0,this.movie_list.length)){
                elem.classList.add('fill_empty');
                elem.firstChild.firstChild.src = "";
                elem.firstChild.href = "";
                elem.lastChild.firstChild.innerHTML = "";
                elem.lastChild.href = "";
            }
        await
        axios.get("http://localhost:3001/movies?page=" + page + "&num=" + this.state.max_movies_in_one_page)
                .then(res =>{
                        this.movie_list = Array.from(res.data,function(each){return {'MovieName': each['MovieName'],'ImagePath':each['FileName']+each['ImageFormat'],
                                                                                    'Id':each['Id']}})
                        this.page = page
                        this.getMovie_covers()
                            }
                    )
                .catch(err => {alert("There is an error to get movies" + err)})
    }


    getMovie_covers = async() =>{
        console.log('Movie_covers')

        var i = 0;
        
        for(let elem of Array.from(document.querySelectorAll('[class = "Box fill_empty"]')).slice(0,this.movie_list.length)){
            elem.classList.remove('fill_empty');
            elem.firstChild.firstChild.src = "http://localhost:3001/movies/covers?name=" + this.movie_list[i].ImagePath
            elem.firstChild.href = "/play?id=" + this.movie_list[i].Id;
            elem.lastChild.firstChild.href = "/play?id=" + this.movie_list[i].Id;
            elem.lastChild.firstChild.innerHTML = this.movie_list[i].MovieName;
            i += 1
        }
    }


    get_number_of_movies = async() =>{
        console.log('number_movies')
        var number_of_movies = await axios.get('http://localhost:3001/getNumberofMovies')
                    .then(res => {return res.data['number']}) 
                    .catch(err=>console.log("Get number of movies err : " + err))
        
        return number_of_movies
        
    }
    
    
    modify_pages = async (numberofMovies) =>{
        console.log('modify')
        let max_page = Math.ceil(numberofMovies / this.state.max_movies_in_one_page) 
        if(max_page <= 9){
                this.pages = Array.from(Array(max_page).keys()).map(each=>each+1);
                this.numberofMovies = numberofMovies;
                this.max_page = max_page;
        }
        else{
            if (this.state.page <= 5){
                    this.pages = Array.from(Array(9).keys()).map(each=>each+1);
                    this.numberofMovies = numberofMovies;
                    this.max_page = max_page;
            }

            else if (this.state.page >= max_page-4){
                    this.pages = Array.from(Array(9).keys()).map(each=>each+max_page-8);
                    this.numberofMovies = numberofMovies;
                    this.max_page = max_page;
            }
            else{
                    this.pages = Array.from(Array(9).keys()).map(each=>each+this.state.page-4);
                    this.numberofMovies = numberofMovies;
                    this.max_page = max_page;
            }

        }   
        console.log('modify_finish')
        
    }

    
    showDefaultImage = (e) =>{
        e.target.src = Default_empty;
    }


 //document.getElementById("11").src = "data:image;base64," + btoa((res.data._streams[1].data).reduce((data, byte) => data + String.fromCharCode(byte),''))
    //<Link to = {{pathname:'/Movie/s',state:{video:"http://localhost:3001/audio&video_play?path=F:/harrypotter/xwz.mp4"}}} id = {"Link_of_Movie_Cover_" + String(each)}>
//-----------------------------------------------------------------------------------




   
    render(){
        return(
                <div id='content' className="Movie" >
                        <div id="main" >
                            {
                            (Array.from(Array(this.state.max_movies_in_one_page).keys())).map((each=>
                                <div className="Box fill_empty">
                                    <a>
                                        <img src onError={(e)=>this.showDefaultImage(e)}></img>
                                    </a>
                                    <div className="movie_name_container"><a className="movie_name"></a></div>
                                </div>
                                ))
                            }
                        </div>
                        <br/>
                        <div id="bottom">
                            <div>
                                <Link to={{pathname:'/Movie'}}>
                                    <button name="First" className="begin_and_end" > First </button>
                                </Link>
                                <Link to={{pathname:'/Movie',search:(Number(this.state.page) === 2)? "" : "?page=" + (Number(this.state.page)-1)}}>
                                    <button name="Prev" className="begin_and_end" > Prev </button>
                                </Link>
                                
                            </div>

                            <div>
                                { 
                                this.pages.map((elem=>
                                <Link to={{pathname:'/Movie',search:(elem === 1 ? "" : ("?page=" + elem))}}>
                                    <button className="Pages"> {elem} </button>
                                </Link>
                                ))
                                }
                            </div>

                            <div>
                                <Link to={{pathname:'/Movie',search:"?page=" + (Number(this.state.page)+1)}}>
                                    <button name='Next' className="begin_and_end" > Next </button>
                                </Link>
                                <Link to={{pathname:'/Movie',search:"?page=" + this.max_page}}>
                                    <button name='Last' className="begin_and_end" > Last </button>
                                </Link>    
                            </div>
                                
                        </div>

                        <div>
                            <br></br>
                            <br></br>
                        </div>
                       
                </div>
                
            
            
        )
    }


} 