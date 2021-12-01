import React from 'react';
import './list.css';
import Item from './item';
import NewItem from "./newItem";
import { Route, Link,Switch} from "react-router-dom";
import image from './icons/giphy.gif';
import image2 from './icons/Smiling Leo Perfect GIF.gif';
import axios from 'axios';



export default class Movie extends React.Component{

constructor(){

super();

this.state = {
    title:'Movie',
    movieList : [],
    loadData: true,
    page:1,
    scriptLoad:false,
    hasCover:false,
    hasVideo:false,
    imageChoice:''
}
this.list = []

};

getMovies = () =>{
    console.log('here')
    axios.post('http://localhost:3001/getMovies',{Email:localStorage.getItem('Email')})
    .then(res =>
        {
            console.log(res)
            if (res.data.length !== 0){
                
                this.setState(
                    {movieList:Array.from(res.data,
                                          function(each){return [each['Path'],each['Title'],each['addTime'],each['Email_Title']]})
                                    .sort((a,b)=>(a[2]<b[2]?1:-1)),
                     loadData: false,
                     
                    },()=>{//console.log(this.state.movieList);
                    
                        
                    })
                
            }
            else{

                this.setState({

                    movieList:[],
                    loadData:false

                })
            }

    }
        )
    .catch(err=>console.log(err))

}

reloadData = () =>{
    this.setState({
        loadData:true
    })
}

checkMovie = (movie) =>{

    localStorage.setItem('checkingMovie',movie)
    
    
}

// get specific icon from following source
loadScript = () =>{
    const script = document.createElement("script");
    script.src = 'https://kit.fontawesome.com/a076d05399.js'
    script.crossOrigin = 'anonymous'
    script.async = true;
    script.setAttribute('id','script_f')
    document.body.appendChild(script);
}

componentDidMount = () =>{  //import fa fas icon, includes: trash, edit
    
    this.setState({
        scriptLoad:true
    },this.loadScript)

}

delete = (e,Title) =>{

    e.preventDefault();
    axios.post("http://localhost:3001/delete",{'Title':Title,'Email':localStorage.getItem('Email')})
         .then(res=>{
            this.setState({
                loadData : true
            })
         })
    
    
    
    }
    
newItemOption = (checkOption)=>{
    
    this.setState({
        [checkOption.value] : checkOption.checked 
    })

}

imageChoice = (checkOption)=>{
    this.setState({
        imageChoice : checkOption.value 
    })
}

render(){
    
    if(this.state.loadData)
      setTimeout(this.getMovies,200)
    
return(
    <div id='Body' >
        <br/>
        <br/>
        <Switch>
            <Route path='/movie/newItem' render={()=><NewItem reloadData={this.reloadData} logout={this.props.logout} hasCover={this.state.hasCover} hasVideo={this.state.hasVideo} imageChoice={this.state.imageChoice} />}></Route>
            <Route path='/movie/item-:id' render={()=><Item reloadData={this.reloadData} movieList={this.state.movieList.map(element=>element[1])}/>}></Route>
            <div style={{fontSize:'20px',display:'flex',flexDirection:'row',justifyContent:'left'}}>
                

            <button id='addButton' onClick={()=>(document.getElementById('newItemCover').style.display='block',document.getElementById('newItemOption').style.display='block')} style={{cursor:'pointer' ,zIndex:'21',position:'absolute',right:'20px',bottom:'10px',background:'white',display:'inline-flex',justifyContent:'center',alignItems:'center',fontSize:'30px',border:'solid 5px black',height:'50px',width:'50px'}}> + </button>
                
                
                <i id='Edit' tabIndex='0' style={{cursor:'pointer' ,position:'absolute',right:'0',top:'0',fontSize:'30px'}} class='fas fa-edit' 
                   onClick={()=>{let T = document.getElementById('edit'); T.style.display === "none"?T.style.display='block':T.style.display='none'}}
                   onBlur= {()=>document.getElementById('edit').style.display='none'}>

                    <ul id='edit'>
                        <li> Edit </li>
                        <li style={{color:'red'}}> Delete ! </li>
                    </ul> 
                </i>
                

                <ul id='currentList-column1' style={{listStyle:'none',flex:'1'}}>
                    
                    {
                    this.state.movieList.slice(30*(this.state.page - 1),30*(this.state.page - 1) + 10).map((each,index)=>
                        
                    <Link style={{textDecoration:'none'}} to={'/movie/item-' +  (index + 1 + 30 * (this.state.page -1))  } onClick={()=>this.checkMovie(each[1])}> 
                    
                    <li className="list-element" >
                        {(index+1 + 30 * (this.state.page -1)) + '. ' +each[1].slice(0,15)}
                   
                   <button className="fa fa-trash" onClick={(e)=>this.delete(e,each[1])}></button></li></Link>
                    
                    )}
            
                </ul>
                <ul id='currentList-column2' style={{listStyle:'none',flex:'1'}}>
                    
                    {
                    this.state.movieList.slice(30*(this.state.page - 1) + 10,30*(this.state.page - 1) + 20).map((each,index)=>
                        
                    <Link style={{textDecoration:'none'}} to={'/movie/item-' +  (index+ 1 + 30 * (this.state.page -1) + 10) } onClick={()=>this.checkMovie(each[1])}> <li className="list-element" >{(index+1 + 30 * (this.state.page -1) + 10) + '. ' +each[1].slice(0,15)} <button className="fa fa-trash"></button> </li> </Link>

                    )}
            
                </ul>
                <ul id='currentList-column3' style={{listStyle:'none',flex:'1'}}>
                    
                    {
                    this.state.movieList.slice(30*(this.state.page - 1) + 20,30*this.state.page).map((each,index)=>
                        
                    <Link style={{textDecoration:'none'}} to={'/movie/item-' +  (index+ 1 + 30 * (this.state.page -1) + 20) } onClick={()=>this.checkMovie(each[1])}><li className="list-element"> {(index+1 + 30 * (this.state.page -1) + 20) + '. ' +each[1].slice(0,15)} <button className="fa fa-trash"></button></li></Link>

                    )}
            
                </ul>
            
                
                  
              
               
            
             <div className='Buttons'>   
             <button id='Prev'  style={{opacity:this.state.page<=1?'0':'1'}} onClick={()=>this.setState({page:this.state.page-1},function(){
                 document.getElementById("page").value = this.state.page
             })}> Prev </button>
             
             <select onChange={()=>this.setState({page:document.getElementById('page').value})} id="page" style={{fontSize:'18px',opacity:this.state.movieList.length === 0 ?'0':'1'}}> 
                {
                    Array.from(Array(Math.ceil(this.state.movieList.length/30)).keys()).map(number=>
                        <option value={number+1}>   page: {number + 1}           </option>
                        
                        )


                }
                
            </select>
             
             <button id='Next' style={{opacity:Math.ceil(this.state.movieList.length/30)<=this.state.page?'0':'1'}} onClick={()=>this.setState({page:this.state.page+1},function(){
                 document.getElementById("page").value = this.state.page
             })}> Next </button>
             
             </div>
            </div>
        </Switch>

        <div id='newItemCover'></div>
        <div id='newItemOption'> 
            <button id='newItemClose' onClick={()=>{return (document.getElementById('newItemCover').style.display='none',document.getElementById('newItemOption').style.display='none')}}>X</button>
            
            <div id='newItemOptionCheck' style={{fontSize:'20px',position:'absolute',left:'40%',top:'30%'}}>
                <input type="checkbox" value='hasCover' onClick={e=>this.newItemOption(e.target)}/>
                <label for="newItemOption1"> Cover</label><br/> 
                    <div style={{display:this.state.hasCover?'block':'none'}} id='imageOption'> 
                            <input name='imageChoice' className='image_choice' type="radio" value='upload' onClick={e=>this.imageChoice(e.target)}/>
                            <label for="newItemOption1"> upload image</label><br/>  
                            <input name='imageChoice' className='image_choice' type="radio" value='urlLink' onClick={e=>this.imageChoice(e.target)}/>
                            <label for="newItemOption1"> use url link</label><br/>   
                    </div>
                <input type="checkbox" value='hasVideo' onClick={e=>this.newItemOption(e.target)}/>
                <label for="newItemOption1"> Video</label><br/>
                
            </div>

            
            
            <Link to={{pathname:'/movie/newItem', state:{s:'hellosz'}}} style={{textDecoration:'none',zIndex:'20',position:'absolute',left:'50%',transform:'translateX(-50%)' , bottom:'10px'}}><button style={{cursor:'pointer',background:'white',display:'inline-flex',justifyContent:'center',alignItems:'center',fontSize:'20px',border:'solid 3px black',height:'40px',width:'80px'}}id='newItem' onClick={()=>(document.getElementById('newItemCover').style.display='none',document.getElementById('newItemOption').style.display='none')} > next </button>
            </Link>
        </div>
    </div>
    
)

}


} 