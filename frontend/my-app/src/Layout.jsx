import {useState, useEffect, useRef} from "react";
import DatabaseSelector from './Settings/DatabaseOperations'
import {Outlet, Link} from 'react-router-dom'
import Snackbar from "./Snackbar/Snackbar";

//paints the side-navigation and updates the current active page
//when the page changes, an App.js function has to be called, since App.js renders the components
let Layout = (props) =>{

    const loadingSpinner = (<div className='m-3'><div className="spinner-border text-primary" role="status"></div></div>)
    let [snackbars, setSnackbars] = useState([])
    let inElectron = navigator.userAgent.indexOf('Electron')>-1 ? true : false
    let port = navigator.userAgent.indexOf('Electron')>-1 ? "3001" : "3000"
    const path = "/" 
    const noDataMessage = <div><h6>Nu exista date</h6></div>

    let [expanded, setExpanded] = useState(true)

    let navigationElements = 
    [
        {
            name:"ACTIUNI PRINCIPALE",
            elements:[
                {id:7, name: "dashboard", displayName:'Dashboard', icon:'home', path:`${path}`},
                {id:0, name: "clients", displayName:'Clienti', icon:'account_circle', path:`${path}clients`},
                {id:1, name: "invoices", displayName:'Facturi', icon:'receipt_long', path:`${path}invoices`},
                {id:2, name: "employees", displayName:'Angajati', icon:'group', path:`${path}employees`},
                {id:8, name: "database", displayName:'Baza date', icon:'storage', path:`${path}database`}                
            ]
        },
        {   name:"DIVERSE",
            elements:[
                {id:3, name: "financials", displayName:'Finante', icon:'attach_money', path:`${path}financials`},
                {id:4, name: "products", displayName:'Predefinite', icon:'folder_copy', path:`${path}products`},
                {id:5, name: "expenses", displayName:'Cheltuieli', icon:'monetization_on', path:`${path}expenses`},  
                {id:6, name: "billedProducts", displayName:'Produse', icon:'shopping_bag', path:`${path}billedProducts`}                 
            ]
        }
    ]

    //initial setup can be saved in localstorage
    let savedNavigationOption = localStorage.getItem('selectedNavigationOption')
    let [selectedItem, setSelectedItem] = useState(7);

    useEffect(()=>{
        //save in local storage
        localStorage.setItem('selectedNavigationOption', selectedItem)
        //call the App.js function; App.js controls the components that are rendered
        navigationElements.forEach(element=>{
            element.elements.forEach(subElement=>{
                if(window.location.pathname===subElement.path) setSelectedItem(subElement.id)
            })
        })
    },[selectedItem])

    function addSnackbar(snackbarObject){
        let snackbarsCopy = [...snackbars]
        snackbarsCopy.push({text:snackbarObject.text, icon: snackbarObject.icon}) 
        setSnackbars(snackbarsCopy)
    }

    function closeSnack(index){
        let snackbarsCopy = [...snackbars]
        snackbarsCopy.splice(index, 1)
        setSnackbars(snackbarsCopy)
    }

    return(
        <div>
            <div style={{display:'flex', flexDirection:'row', height:"100vh", width:'100vw', justifyContent:'space-between'}}>
                <div className={`side-navigation-container ${expanded ? "expanded" : "not-expanded"}`}> 
                    <div style={{display:'inherit', flexDirection:'column'}}>
                        {navigationElements.map((element, index)=>(
                            <ul key={index} className="side-navigation-list">
                                <h6 className="navigation-list-name">{element.name}</h6>
                                {element.elements.map(element=>(
                                    <li key={element.id} className={parseInt(selectedItem)===parseInt(element.id) ? "nav-link active" : "nav-link"} onClick={()=>setSelectedItem(element.id)} >
                                        <Link to={element.path}>
                                            <div>
                                                {element.icon!=="" && <span className="material-icons-outlined">{element.icon}</span>}
                                                <span className="side-navigation-element-name" style={{marginLeft: element.icon ? '0' : '25px'}}>{element.displayName}</span>
                                                <span className="nav-tooltip">{element.displayName}</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}   
                            </ul>
                        ))}
                    </div>                
                    <div style={{display:'inherit', flexDirection:'column', alignItems:'center'}} className="p-2">                        
                        <button style={{backgroundColor:'transparent', border:'none'}} onClick={()=>{setExpanded(!expanded)}}><span class="material-icons-outlined">menu</span></button>   
                    </div>                              
                </div> 
                <Outlet context={{addSnackbar, port, loadingSpinner, noDataMessage}}/>            
            </div>
            <div className="snackbars-container">
                {snackbars.length>0&&
                    snackbars.map((element, index)=>(
                    <Snackbar key={index} properties={{text: element.text, icon: element.icon}} closeSnack={()=>{closeSnack(index)}}/>
                    ))
                }
            </div>
        </div>
    )
}

export default Layout;