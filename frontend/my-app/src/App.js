import './App.css';
import React from 'react';
import Layout from './Layout'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesOverview'
import Settings from './Settings/SettingsComponent.jsx'
import Employees from './Employees/Employees.jsx'
import Admins from './Admins/AdminsOverview.jsx'
import {Route, createBrowserRouter, RouterProvider, createRoutesFromElements, createHashRouter} from 'react-router-dom'

let App =()=> {

  let router;

  //Electron env
  if(navigator.userAgent.indexOf('Electron')>-1){
    router=createHashRouter(
      createRoutesFromElements(
        <Route path="/" element={<Layout/>}>
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='admins' element={<Admins/>}/>
          <Route path='settings' element={<Settings/>}/>
          <Route path='employees' element={<Employees/>}/>
        </Route>
      )
    )
  }else{
    router=createBrowserRouter(
      createRoutesFromElements(
        <Route path="/" element={<Layout/>}>
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='admins' element={<Admins/>}/>
          <Route path='settings' element={<Settings/>}/>
          <Route path='employees' element={<Employees/>}/>
        </Route>
      )
    )
  }

  return(
      <RouterProvider router={router}/>
  )  

}

export default App



