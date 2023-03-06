import {useState, useEffect} from "react";
import DatabaseSelector from './Settings/DatabaseOperations'
import {Outlet, Link} from 'react-router-dom'

//paints the side-navigation and updates the current active page
//when the page changes, an App.js function has to be called, since App.js renders the components
let SideNavigation = (props) =>{

    let navigationElements = 
    [
        {
            name:"ACTIUNI",
            elements:[
                {id:0, name: "clients", displayName:'Clienti', icon:'account_circle', path:'/clients'},
                {id:1, name: "invoices", displayName:'Facturi', icon:'receipt_long', path:'/invoices'},
                {id:6, name: "employees", displayName:'Angajati', icon:'group', path:'/employees'},
                {id:10, name: "financials", displayName:'Finante', icon:'attach_money', path:'/financials'}
            ]
        },
        {   name:"DIVERSE",
            elements:[
                {id:8, name: "products", displayName:'Predefinite', icon:'', path:'/products'},
                {id:9, name: "expenses", displayName:'Cheltuieli', icon:'', path:'/expenses'}            
            ]
        }
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
        <div style={{display:'flex', flexDirection:'row', height:"100vh", width:'100vw', justifyContent:'space-between'}}>
            <div className="side-navigation-container expanded"> 
                <div style={{display:'inherit', flexDirection:'column'}}>
                    {navigationElements.map(element=>(
                        <ul className="side-navigation-list">
                            <h6 className="navigation-list-name">{element.name}</h6>
                            {element.elements.map(element=>(
                                <li key={element.id} className={parseInt(selectedItem)===parseInt(element.id) ? "nav-link active" : "nav-link"} onClick={()=>setSelectedItem(element.id)} >
                                    <Link to={element.path}>
                                        <div>
                                            {element.icon!=="" && <span className="material-icons-outlined" style={{fontSize:'20px'}}>{element.icon}</span>}
                                            <span className="side-navigation-element-name" style={{marginLeft: element.icon ? '0' : '25px'}}>{element.displayName}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}   
                        </ul>
                    ))}
                </div>                
                <div style={{display:'inherit', flexDirection:'row', alignItems:'center'}} className="p-2">
                    <DatabaseSelector/>
                </div>                
            </div> 
            <Outlet/>
            
      </div>
    )
}

export default SideNavigation;