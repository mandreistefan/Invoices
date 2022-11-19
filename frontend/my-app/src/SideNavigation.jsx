import {useState, useEffect} from "react";

//paints the side-navigation and updates the current active page
//when the page changes, an App.js function has to be called, since App.js renders the components
let SideNavigation = (props) =>{

    let [expanded, setExpanded] = useState(true)
    let navigationElements = 
    [
        {id:0, name: "clients", displayName:'Clienti', icon:'account_circle'},
        {id:1, name: "invoices", displayName:'Facturi', icon:'receipt_long'},
        {id:6, name: "employees", displayName:'Angajati', icon:'group'},
        {id:2, name: "admins", displayName:'Administrative', icon:'sell'}
    ]

    //initial setup can be saved in localstorage
    let savedNavigationOption = localStorage.getItem('selectedNavigationOption')
    let [selectedItem, setSelectedItem] = useState(savedNavigationOption ? savedNavigationOption : 0);

    useEffect(()=>{
        //save in local storage
        localStorage.setItem('selectedNavigationOption', selectedItem)
        //call the App.js function; App.js controls the components that are rendered
        props.setAsActive(selectedItem)
    },[selectedItem])

    return(
        <div id="side-navigation">
            <div class={expanded ? "side-navigation-container expanded" : "side-navigation-container"}>           
                <ul className="side-navigation-list">
                    {navigationElements.map(element=>(
                    <li className={parseInt(selectedItem)===parseInt(element.id) ? "nav-link active" : "nav-link"} onClick={()=>setSelectedItem(element.id)} >
                        <span className="material-icons-outlined">{element.icon}</span>
                        <span className="side-navigation-element-name">{element.displayName}</span>
                    </li>))}
                    <li className="nav-link" onClick={()=>props.openUserMenu(true)} >
                        <span className="material-icons-outlined">settings</span>
                        <span className="side-navigation-element-name">Setari</span>
                    </li>
                </ul>
            </div>  
            <div className="side-navigation-footer">
                    <button id="expand-nav-button" onClick={()=>{setExpanded(expanded===true ? false : true)}}><span class="material-icons-outlined">{expanded ? "chevron_left" : "chevron_right"}</span></button>
            </div>            
      </div>
    )
}

export default SideNavigation;