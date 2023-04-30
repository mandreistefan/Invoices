import './App.css';

import {Route, createBrowserRouter, RouterProvider, createRoutesFromElements, createHashRouter, useRouteError} from 'react-router-dom'
//import React, { lazy, Suspense } from 'react';
import Layout from './Layout'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesOverview'
import Employees from './Employees/Employees.jsx'
import PredefinedProducts from './Admins/PredefinedProducts.jsx'
import Expenses from './Admins/Expenses'
import Financials from './FinancialComponent/FinancialComponent'
import BilledProducts from './Admins/BilledProducts.jsx'
import Dashboard from './Dashboard';
import DatabaseOperations from './Settings/DatabaseOperations';
import { useEffect, useState } from 'react';

let App =()=> {

  /*const Dashboard = lazy( () =>import('./Dashboard'))
  const Expenses = lazy(()=>import('./Admins/Expenses'))
  const ClientsComponent = lazy(()=>import('./ClientsComponent/ClientsComponent.jsx'))
  const Financials = lazy(()=>import('./FinancialComponent/FinancialComponent.jsx'))
  const Employees = lazy(()=>import('./Employees/Employees.jsx'))
  const BilledProducts = lazy(()=>import('./Admins/BilledProducts.jsx'))
  const PredefinedProducts = lazy(()=>import('./Admins/PredefinedProducts.jsx'))
  const InvoicesComponent = lazy(()=> import('./InvoiceComponent/InvoicesOverview'))*/

  let router;  
  let inElectron = navigator.userAgent.indexOf('Electron')>-1 ? true : false;
  let path =  "/"
  let [errorNotifier, setErrorNotifier] = useState(null)
  let port = navigator.userAgent.indexOf('Electron')>-1 ? "3001" : "3000"

  useEffect(()=>{
    fetch(`http://localhost:${port}/pingDatabase`,
    {
        method:"GET",
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response=>response.json()).then(data=>{      
        if(data.response===true){

        }else{
          setErrorNotifier("A existat o eroare in conectarea la baza de date! Baza de date nu exista sau aplicatia nu se poate conecta!")                  
        }         
    })
    .catch(error=>{
        console.log(error)
    })
  },[])

  //Electron env
  if(inElectron){
    router=createHashRouter(
      createRoutesFromElements(
        <Route path={path}  element={<Layout/>} errorElement={<ErrorBoundary/>} >
          <Route path="/" element={<Dashboard/>} />
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='employees' element={<Employees/>}/>
          <Route path='products' element={<PredefinedProducts/>}/>
          <Route path='expenses' element={<Expenses/>}/>
          <Route path='financials' element={<Financials/>}/>
          <Route path='billedProducts' element={<BilledProducts/>}/>
          <Route path='database' element={<DatabaseOperations/>}/>
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
          <Route path='database' element={<DatabaseOperations/>}/>
        </Route>
      )
    )
  }

  function ErrorBoundary() {
    let error = useRouteError();
    console.log(error)
    if(error.status===404){
      return <div>
        <div className="px-4 py-5 my-5 text-center">          
          <h1 className="display-5 fw-bold">Pagina nu exista</h1>
          <div className="col-lg-6 mx-auto">
            <p className="lead mb-4">Pagina cautata nu exista. Click mai jos pentru a merge catre dashboard</p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <a href={path}>Catre pagina de pornire</a>
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
          <a href={path}>Catre pagina de pornire</a>
          </div>
        </div>
      </div>        
    </div>
  }

  return(
      <div>
        {errorNotifier===null && <RouterProvider router={router} inElectron={inElectron}/>}
        {errorNotifier!==null && <div className='p-3'><div class="alert alert-danger" role="alert">{errorNotifier}</div></div>}
      </div>
      
  )  

}



export default App



