import { useState} from "react";
import DatabaseOperations from './DatabaseOperations.jsx'

let SettingsComponent=(props)=>{

    let [activeElement, setActiveElement] = useState(0)
    let availableElements = [{id:0, name:"Baze de date"}]

return(
    <div className='app-data-container'>
        <div className="clients-overview-container">
            <div className="vertical-list-container">     
                <div class="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">                
                    <h6>Administrative</h6>
                </div>
                <div class="list-group list-group-flush border-bottom scrollarea" style={{width: '300px'}}> 
                    {availableElements.map((element, index)=>(        
                        <a href="#" class={activeElement===element.id ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>{setActiveElement(element.id)}} aria-current="true">
                            {element.name}
                        </a>  
                    ))}                                
                </div> 
            </div> 
            <div className="overview-container" key={activeElement}>
                {activeElement===0 && <DatabaseOperations/>}
            </div>             
        </div>
    </div>
)

}

export default SettingsComponent;