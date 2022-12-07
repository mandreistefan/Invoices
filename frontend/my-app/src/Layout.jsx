import {useState, useEffect} from "react";
import {Outlet, Link, useLocation} from 'react-router-dom'

//paints the side-navigation and updates the current active page
//when the page changes, an App.js function has to be called, since App.js renders the components
let SideNavigation = (props) =>{

    let [expanded, setExpanded] = useState(true)
    let navigationElements = 
    [
        {id:0, name: "clients", displayName:'Clienti', icon:'account_circle', path:'/clients'},
        {id:1, name: "invoices", displayName:'Facturi', icon:'receipt_long', path:'/invoices'},
        {id:6, name: "employees", displayName:'Angajati', icon:'group', path:'/employees'},
        {id:2, name: "admins", displayName:'Administrative', icon:'sell', path:'/admins'},
        {id:7, name: "settings", displayName:'Setari', icon:'sell', path:'/settings'}
    ]

    //initial setup can be saved in localstorage
    let savedNavigationOption = localStorage.getItem('selectedNavigationOption')
    let [selectedItem, setSelectedItem] = useState(savedNavigationOption ? savedNavigationOption : 0);

    useEffect(()=>{
        //save in local storage
        localStorage.setItem('selectedNavigationOption', selectedItem)
        //call the App.js function; App.js controls the components that are rendered
    },[selectedItem])

    return(
        <div style={{display:'flex', flexDirection:'row', height:"100vh", width:'100vw'}}>
            <div class="side-navigation-container expanded">           
                <ul className="side-navigation-list">
                    {navigationElements.map(element=>(
                        <li className={parseInt(selectedItem)===parseInt(element.id) ? "nav-link active" : "nav-link"} onClick={()=>setSelectedItem(element.id)} >
                            <Link to={element.path}>
                                <div>
                                    <span className="material-icons-outlined">{element.icon}</span>
                                    <span className="side-navigation-element-name">{element.displayName}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div> 
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', padding:'32px', width:'100%'}}>
                <Outlet/>
            </div>             
      </div>
    )
}

export default SideNavigation;