import { useState, useEffect } from "react"

/**
 * 
 * @param {*} props.title Title of the header
 * @param {*} props.iocn Icon of the header
 * @param {*} props.searchAction Action triggered when the search button is clicked
 * @param {*} props.buttons An array containing buttons: [{title:"", action:"", icon:"", name:""}]
 * @returns 
 */

let Header = (props) =>{

    let [properties, setProperties] = useState(null)

    useEffect(()=>{
        setProperties({
            title: props.title,
            icon: props.icon,
            searchAction: props.searchAction,
            buttons:props.buttons
        })
    },[])

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = document.getElementById("searchinput").value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        props.searchAction(searchTermStringified)
    }

    function refreshData(){
        document.getElementById("searchinput").value=""
        props.refreshData()
    }

    return(
        <div>
            {properties!==null &&
            <div style={{marginBottom:'25px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'inherit', justifyContent:'flex-start', alignItems:'center'}}>
                    <span class="material-icons-outlined">{properties.icon}</span>
                    <span style={{fontSize:'18px', fontWeight:'600'}}>{properties.title}</span>
                    <form onSubmit={handleSearchSubmit} style={{marginLeft:'10px'}} id="search-form" name="search-form">
                        <div className="search-form-container"> 
                            <span className="material-icons-outlined" style={{width:'24px', color:'lightgray', margin:'auto'}}>search</span>                                                                  
                            <input className="form-control shadow-none" id="searchinput" placeholder="Cauta.."></input>                                                   
                        </div>
                    </form>
                </div>
                <div className="btn-group">   
                    {
                        properties.buttons.length>0 && properties.buttons.map((element, index)=>(
                            <button type="button" className='btn btn-light btn-sm' title={element.title} onClick={()=>{element.action()}}><div className="inner-button-content"><span className="material-icons-outlined">{element.icon}</span>{element.name}</div></button>   
                        ))
                    }  
                    <button type="button" className='btn btn-light btn-sm' title="Reincarca datele" onClick={()=>{refreshData()}}><div className="inner-button-content"><span className="material-icons-outlined">refresh</span></div></button>                             
                </div>  
            </div>
            } 
        </div>

        )

}

export default Header