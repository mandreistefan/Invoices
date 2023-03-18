import { useState, useEffect } from "react"

/**
 * 
 * @param {*} props.title Title of the header
 * @param {*} props.iocn Icon of the header
 * @param {*} props.searchAction Action triggered when the search button is clicked
 * @param {*} props.buttons An array containing buttons: [{title:"", action:"", icon:"", name:""}]
 * @param {*} props.hasSearch False, if no search option
 * @returns 
 */

let Header = (props) =>{

    let [properties, setProperties] = useState(null)

    useEffect(()=>{
        setProperties({
            title: props.title,
            icon: props.icon,
            searchAction: props.searchAction,
            buttons:props.buttons,
            hasSearch: props.hasSearch!==undefined ? props.hasSearch : true
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
        if(properties.hasSearch===true) document.getElementById("searchinput").value=""
        props.refreshData()
    }

    return(
        <div>
            {properties!==null &&
            <div style={{display:'flex', flexDirection:'column'}}>
                <div style={{display:'inherit', justifyContent:'space-between', padding:'20px', borderBottom:'1px solid lightgray'}}>
                    <span style={{fontSize:'28px', fontWeight:'600'}}>{properties.title}</span> 
                    <div className="btn-group">   
                        {
                            properties.buttons.length>0 && properties.buttons.map((element, index)=>(
                                <button type="button" className='btn btn-light btn-sm' title={element.title} onClick={()=>{element.action()}}><div className="inner-button-content"><span className="material-icons-outlined">{element.icon}</span>{element.name}</div></button>   
                            ))
                        }  
                        <button type="button" className='btn btn-light btn-sm' title="Reincarca datele" onClick={()=>{refreshData()}}><div className="inner-button-content"><span className="material-icons-outlined">refresh</span>Reincarca</div></button>                             
                    </div> 
                </div>
                {properties.hasSearch===true && 
                <div style={{display:'inherit', justifyContent:'flex-start', alignItems:'center', padding:'20px', backgroundColor:'#f8f9fa'}}> 
                    <form onSubmit={handleSearchSubmit} style={{display:'inherit', justifyContent:'flex-start'}} id="search-form" name="search-form">
                        <div className="search-form-container"> 
                            <span className="material-icons-outlined" style={{width:'24px', color:'lightgray', margin:'auto'}}>search</span>                                                                  
                            <input className="form-control shadow-none" id="searchinput" placeholder="Cauta.."></input>                                                   
                        </div>
                        <button className="btn btn-light btn-sm">Cauta</button>
                    </form>
                </div>}
            </div>
            } 
        </div>

        )

}

export default Header