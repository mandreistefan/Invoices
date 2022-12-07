import {useState, useEffect} from 'react'
import PredefinedProducts from './PredefinedProducts.jsx'
import Expenses from './Expenses.jsx'
import Financial from '../FinancialComponent/FinancialComponent.jsx'

let AdminsOverview=(props)=>{

    let [activeElement, setActiveElement] = useState(0)
    let availableElements = [{id:0, name:"Produse"}, {id:1, name:"Cheltuieli"}, {id:2, name:"Finante"}]

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
                    {activeElement===0 && <PredefinedProducts/>}
                    {activeElement===1 && <Expenses/>}
                    {activeElement===2 && <Financial/>}
                </div>             
            </div>
        </div>
    )

}

export default AdminsOverview;