import './App.css';

import {Route, createBrowserRouter, RouterProvider, createRoutesFromElements, createHashRouter, useRouteError, useOutletContext} from 'react-router-dom'
import {useState} from "react";
import DatabaseSelector from './Settings/DatabaseOperations'
import {Outlet, Link} from 'react-router-dom'
import Snackbar from './Snackbar/Snackbar';
import React, { lazy, Suspense } from 'react';

let App =()=> {

  const Dashboard = lazy( () =>import('./Dashboard'))
  const Expenses = lazy(()=>import('./Admins/Expenses'))
  const ClientsComponent = lazy(()=>import('./ClientsComponent/ClientsComponent.jsx'))
  const Financials = lazy(()=>import('./FinancialComponent/FinancialComponent.jsx'))
  const Employees = lazy(()=>import('./Employees/Employees.jsx'))
  const BilledProducts = lazy(()=>import('./Admins/BilledProducts.jsx'))
  const PredefinedProducts = lazy(()=>import('./Admins/PredefinedProducts.jsx'))
  const InvoicesComponent = lazy(()=> import('./InvoiceComponent/InvoicesOverview'))

  let router;
  const path = window.location.href.indexOf("app") > -1 ? "/app" : "/" 
  let [snackbars, setSnackbars] = useState([])
  const port = window.location.href.indexOf("app") > -1 ? "3001" : "3000" 
  let [selectedItem, setSelectedItem] = useState(null);

  //Electron env
  if(navigator.userAgent.indexOf('Electron')>-1){
    router=createHashRouter(
      createRoutesFromElements(
        <Route path="/"  element={<Layout/>} errorElement={<ErrorBoundary/>} >
          <Route path="/" element={<Dashboard/>} />
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='employees' element={<Employees/>}/>
          <Route path='products' element={<PredefinedProducts/>}/>
          <Route path='expenses' element={<Expenses/>}/>
          <Route path='financials' element={<Financials/>}/>
          <Route path='billedProducts' element={<BilledProducts/>}/>
        </Route>
      )
    )
  }else{
    router=createBrowserRouter(
      createRoutesFromElements(
        <Route path={path} element={<Layout/>} errorElement={<ErrorBoundary />} >
          <Route path="" element={<Dashboard/>} />
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='employees' element={<Employees/>}/>
          <Route path='products' element={<PredefinedProducts/>}/>
          <Route path='expenses' element={<Expenses/>}/>
          <Route path='financials' element={<Financials/>}/>
          <Route path='billedProducts' element={<BilledProducts/>}/>
        </Route>
      )
    )
  }

  function ErrorBoundary() {
    let error = useRouteError();
    if(error.status===404){
      return <div>
        <div className="px-4 py-5 my-5 text-center">          
          <h1 className="display-5 fw-bold">Pagina nu exista</h1>
          <div className="col-lg-6 mx-auto">
            <p className="lead mb-4">Pagina cautata nu exista. Click mai jos pentru a merge catre dashboard</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <a href="./">Catre pagina de pornire</a>
            </div>
          </div>
        </div>        
      </div>
    }
    // Uncaught ReferenceError: path is not defined
    return <div>
      <div className="px-4 py-5 my-5 text-center">          
        <h1 className="display-5 fw-bold">Ceva nu a mers bine</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">A aparut o eroare generala. Incearca sa mergi la pagina de pornire</p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <a href="./">Catre pagina de pornire</a>
          </div>
        </div>
      </div>        
    </div>
  }

  //used to render the menu
  let navigationElements = 
  [
      {
          name:"ACTIUNI PRINCIPALE",
          elements:[
              {id:7, name: "dashboard", displayName:'Dashboard', icon:'home', path:`${path}`},
              {id:0, name: "clients", displayName:'Clienti', icon:'account_circle', path:`${path}clients`},
              {id:1, name: "invoices", displayName:'Facturi', icon:'receipt_long', path:`${path}invoices`},
              {id:2, name: "employees", displayName:'Angajati', icon:'group', path:`${path}employees`}                
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

  /**
   * Prompts a snackbar
   * @param {*} snackbarObject 
   */
  function addSnackbar(snackbarObject){
      let snackbarsCopy = [...snackbars]
      snackbarsCopy.push({text:snackbarObject.text, icon: snackbarObject.icon}) 
      setSnackbars(snackbarsCopy)
  }

  /**
   * Closes a snackbar
   * @param {*} index Position of snakbar in list of snackbars
   */
  function closeSnack(index){
      let snackbarsCopy = [...snackbars]
      snackbarsCopy.splice(index, 1)
      setSnackbars(snackbarsCopy)
  }

  //Layout used by React Router
  function Layout(){
    return(
      <div>
          <div style={{display:'flex', flexDirection:'row', height:"100vh", width:'100vw', justifyContent:'space-between'}}>
            <div className="side-navigation-container expanded"> 
                <div style={{display:'inherit', flexDirection:'column'}}>
                    {navigationElements.map((element, index)=>(
                        <ul key={index} className="side-navigation-list">
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
                    <DatabaseSelector port={port}/>
                </div>                
            </div> 
            <Suspense fallback={<span>Loading</span>}>
              <Outlet context={{addSnackbar, port}}/>     
            </Suspense>                   
        </div>
        <div className="snackbars-container">
            {snackbars.length>0&&
                snackbars.map((element, index)=>(
                  <Snackbar key={index} properties={{text: element.text, icon: element.icon}} closeSnack={()=>{closeSnack(index)}}/>
                ))
              }
        </div>
    </div>)
  }

  return(
      <RouterProvider router={router}/>
  )  

}



export default App



