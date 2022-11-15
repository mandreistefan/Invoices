import React from "react";
import './SideNavigation.css';


//paints the side-navigation and updates the current active page
//when the page changes, an App.js function has to be called, since App.js renders the components
let SideNavigation = (props) =>{

    let getDatabaseName=()=>{
        fetch('./database').then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setActiveDBname(data.data.database)
            }else{
                setActiveDBname("UNKNOWN")
            }
        }).catch(error=>{
            console.log(error)
            setActiveDBname("UNKNOWN")
        })
    }

    let navigationElements = 
    [
        {id:0, name: "clients", displayName:'Clienti', icon:'account_circle'},
        {id:1, name: "invoices", displayName:'Facturi', icon:'receipt_long'},
        {id:6, name: "employees", displayName:'Angajati', icon:'group'},
        {id:2, name: "products", displayName:'Produse', icon:'sell'},
        {id:5, name: "expenses", displayName:'Cheltuieli', icon:'account_balance_wallet'},
        {id:3, name: "financial", displayName:'Finante', icon:'attach_money'},
        {id:4, name: "settings", displayName:'Setari', icon:'settings'}
    ]

    //initial setup can be saved in localstorage
    let savedNavigationOption = localStorage.getItem('selectedNavigationOption')
    let [selectedItem, setSelectedItem] = React.useState(savedNavigationOption ? savedNavigationOption : 0);
    let [activeDB, setActiveDBname] = React.useState("")

    React.useEffect(()=>{
        //at startup
        getDatabaseName()
        //save in local storage
        localStorage.setItem('selectedNavigationOption', selectedItem)
        //call the App.js function; App.js controls the components that are rendered
        props.setAsActive(selectedItem)
    },[selectedItem])

    return(
        <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark" style={{width: '200px'}}>
            <ul className="nav nav-pills flex-column mb-auto">
                {navigationElements.map(element=>(
                    <li className="nav-item">
                        <a href="#" className={parseInt(selectedItem)===parseInt(element.id) ? "nav-link active" : "nav-link text-white"} onClick={()=>setSelectedItem(element.id)}  aria-current="page">
                            <span className="bi pe-none material-icons-outlined">{element.icon}</span>{element.displayName}
                        </a>
                    </li>))}
            </ul>
            <hr></hr>
            <strong style={{textAlign:"center"}}>{activeDB}</strong>
        </div>
    )
}

export default SideNavigation;