import { useState, useEffect } from "react"

/**
 * 
 * @param {*} props.title Title of the header
 * @param {*} props.iocn Icon of the header
 * @param {*} props.searchAction Action triggered when the search button is clicked
 * @param {*} props.buttons An array containing buttons: [{title:"", action:"", icon:"", name:""}]
 * @param {*} props.hasSearch False, if no search option
 * @param {*} props.intervalSelections Elements for a dropdown; selected item is returned to the parent
 * @param {*} props.intervalFunction Returns the interval and the selected dropdown element
 * @returns 
 */

let Header = (props) =>{

    let [properties, setProperties] = useState(null)
    let currentDate = new Date()
    let [dateInterval, setInterval] = useState({
        start: `${currentDate.getFullYear()}-01-01`,
        end: `${currentDate.getFullYear()}-12-31`
    })

    useEffect(()=>{

        let intervalSelections = []
        if(props.intervalSelections)
        props.intervalSelections.forEach(element=>{
            intervalSelections.push(element)
        })

        setProperties({
            title: props.title,
            icon: props.icon,
            searchAction: props.searchAction,
            buttons:props.buttons,
            hasSearch: props.searchAction!==undefined ? true : false,
            hasInterval: props.intervalFunction!==undefined ? true : false,
            intervalAppliesTo: intervalSelections.length>0 ? intervalSelections[0] : null,
            intervalSelections: intervalSelections
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

    function changeIntervalFunction(event){
        event.target.name==="trip-start" ? setInterval({...dateInterval, start:event.target.value}) : setInterval({...dateInterval, end:event.target.value})        
    }

    function applyInterval(){
        props.intervalFunction(dateInterval, properties.intervalAppliesTo)
    }

    function resetInterval(){
        setInterval({start:`${currentDate.getFullYear()}-01-01`, end:`${currentDate.getFullYear()}-12-31`})
    }

    function resetSearch(){
        let searchTerm = ""
        document.getElementById("searchinput").value=searchTerm
        props.searchAction(searchTerm)
    }

    function selectChange(event){
        let shallowCopy = properties
        shallowCopy.intervalAppliesTo = properties.intervalSelections[properties.intervalSelections.indexOf(event.target.value)]
        setProperties(shallowCopy)
    }

    return(
        <div>
            {properties!==null &&
            <div style={{display:'flex', flexDirection:'column'}}>
                <div style={{display:'inherit', justifyContent:'space-between', padding:'20px', borderBottom:'1px solid lightgray'}}>
                    <span style={{fontSize:'28px', fontWeight:'600'}}>{properties.title}</span> 
                    <div className="btn-group button-group-mint">   
                        {
                            properties.buttons.length>0 && properties.buttons.map((element, index)=>(
                                <button type="button" className='btn btn-light btn-sm' title={element.title} onClick={element.action}><div className="inner-button-content"><span className="material-icons-outlined">{element.icon}</span>{element.name}</div></button>   
                            ))
                        }  
                        <button type="button" className='btn btn-light btn-sm' title="Reincarca datele" onClick={()=>{refreshData()}}><div className="inner-button-content"><span className="material-icons-outlined">refresh</span>Reincarca</div></button>                             
                    </div> 
                </div>

                {(properties.hasSearch===true || properties.hasInterval===true) &&
                <div style={{display:'inherit', justifyContent:'space-between', alignItems:'center', padding:'20px', backgroundColor:'#f8f9fa'}}> 
                    {properties.hasInterval===true &&
                    <div style={{display:'flex', alignItems:'center', width:'fit-content', borderRadius:'6px', padding:'3px', marginRight:'5px'}}>
                        <span title="Interval" style={{marginRight:'5px'}} className="material-icons-outlined">date_range</span>
                        <input type="date" className="form-control shadow-none" style={{width:'fit-content'}} id="start" name="trip-start" value={dateInterval.start} onChange={changeIntervalFunction}></input>
                        <input type="date" className="form-control shadow-none" style={{width:'fit-content', margin:'0'}} id="end" name="trip-end" value={dateInterval.end} onChange={changeIntervalFunction}></input>
                        {properties.intervalSelections.length>0 && 
                        <select className="form-select form-select-sm shadow-none m-2" style={{width:'fit-content', height:'38px'}} onChange={selectChange}>
                            {properties.intervalSelections.map(element=>(
                                <option key={element} value={element}>{element}</option>
                            ))}
                        </select>}
                        <div className="btn-group" style={{marginLeft:'10px'}}>
                            <button className="btn btn-light btn-sm mint-button" onClick={()=>{applyInterval()}}>Aplica</button>
                            <button className="btn btn-light btn-sm mint-button" onClick={()=>{resetInterval()}}>Reseteaza</button>
                        </div>
                        
                    </div>}
                    {properties.hasSearch===true &&
                    <form onSubmit={handleSearchSubmit} style={{display:'inherit', justifyContent:'flex-start'}} id="search-form" name="search-form">
                        <div className="search-form-container"> 
                            <span className="material-icons-outlined" style={{width:'24px', color:'lightgray', margin:'auto'}}>search</span>                                                                  
                            <input className="form-control shadow-none" id="searchinput" placeholder="Cauta.."></input>                                                   
                        </div>
                        <div className="btn-group" style={{marginLeft:'10px'}}>
                            <button className="btn btn-light btn-sm mint-button">Cauta</button>
                            <button type="button" className="btn btn-light btn-sm mint-button" onClick={()=>{resetSearch()}}>Reseteaza</button>
                        </div>
                    </form>} 
                </div>}
            </div>
            } 
        </div>

        )

}

export default Header