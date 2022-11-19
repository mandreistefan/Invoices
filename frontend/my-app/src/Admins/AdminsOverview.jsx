import {useState, useEffect} from 'react'
import PredefinedProducts from './PredefinedProducts.jsx'
import Expenses from './Expenses.jsx'
import Financial from '../FinancialComponent/FinancialComponent.jsx'

let AdminsOverview=(props)=>{

    let [activeElement, setActiveElement] = useState(0)
    let availableElements = [{id:0, name:"Produse"}, {id:1, name:"Cheltuieli"}, {id:2, name:"Finante"}]

    return(
        <div>
            <div style={{display:'flex', flexDirection:'row'}} id="employees-overview-container">
                <div className="vertical-list-container"> 
                    <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vertical-list" style={{width: '300px'}}>  
                        <div class="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">

                        </div> 
                        <div class="list-group list-group-flush border-bottom scrollarea" style={{width: '300px'}}> 
                            {availableElements.map((element, index)=>(
                                <a href="#" class={activeElement===element.id ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>{setActiveElement(element.id)}} aria-current="true">
                                    <div class="d-flex w-100 align-items-center justify-content-between">
                                        <strong class="mb-1">{element.name}</strong>                                            
                                    </div>        
                                </a> 
                            ))}
                        </div>
                        <div className="p-2">
                                                       
                        </div>
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