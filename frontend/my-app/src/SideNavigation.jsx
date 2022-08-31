import React from "react";
import './SideNavigation.css';

function checkIfSelected(elementID, selectedItem){    
    if(parseInt(elementID)===parseInt(selectedItem)){
        return "side-nav-button selected-nav-element"
    }else{
        return "side-nav-button"
    }
}

//paints the side-navigation and updates the current active page
//when the page changes, an App.js function has to be called, since App.js renders the components
let SideNavigation = (props) =>{

    let navigationElements = 
    [
        {id:0, name: "clients", displayName:'Clients', icon:'account_circle'},
        {id:1, name: "invoices", displayName:'Invoices', icon:'receipt_long'},
        {id:2, name: "products", displayName:'Products', icon:'sell'},
        {id:3, name: "financial", displayName:'Financial', icon:'attach_money'},
        {id:4, name: "database", displayName:'Database', icon:'cloud'}
    ]

    //initial setup can be saved in localstorage
    let savedNavigationOption = localStorage.getItem('selectedNavigationOption')
    let [selectedItem, setSelectedItem] = React.useState(savedNavigationOption ? savedNavigationOption : 0);

    React.useEffect(()=>{
        //save in local storage
        localStorage.setItem('selectedNavigationOption', selectedItem)
        //call the App.js function; App.js controls the components that are rendered
        props.setAsActive(selectedItem)
    },[selectedItem])

    return(
        <div className="side-navigation">
            <ul className="side-nav-elements">
                {
                    navigationElements.map(element=>(
                        <li className="side-nav-element" id={element.name} name={element.name} key={element.id}>
                            <button className={checkIfSelected(element.id, selectedItem)} onClick={()=>setSelectedItem(element.id)}>
                                <div>
                                    <span className="material-icons-outlined">{element.icon}</span>{element.displayName}
                                </div>                                
                            </button>                      
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default SideNavigation;