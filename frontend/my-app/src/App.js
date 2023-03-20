import './App.css';
import React from 'react';
import Layout from './Layout'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesOverview'
import Employees from './Employees/Employees.jsx'
import Admins from './Admins/AdminsOverview.jsx'
import PredefinedProducts from './Admins/PredefinedProducts.jsx'
import Expenses from './Admins/Expenses'
import Financials from './FinancialComponent/FinancialComponent'
import Dashboard from './Dashboard';
import {Route, createBrowserRouter, RouterProvider, createRoutesFromElements, createHashRouter} from 'react-router-dom'

let App =()=> {

  let router;
  
  //Electron env
  if(navigator.userAgent.indexOf('Electron')>-1){
    router=createHashRouter(
      createRoutesFromElements(
        <Route path="/" component={<Dashboard/>} element={<Layout/>}>
          <Route path="/" element={<Dashboard/>} />
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='admins' element={<Admins/>}/>
          <Route path='employees' element={<Employees/>}/>
          <Route path='products' element={<PredefinedProducts/>}/>
          <Route path='expenses' element={<Expenses/>}/>
          <Route path='financials' element={<Financials/>}/>
        </Route>
      )
    )
  }else{
    router=createBrowserRouter(
      createRoutesFromElements(
        <Route path="/" component={<Dashboard/>} element={<Layout/>}>
          <Route path="/" element={<Dashboard/>} />
          <Route path='clients' element={<ClientsComponent/>}/>
          <Route path='invoices' element={<InvoicesComponent/>}/>
          <Route path='admins' element={<Admins/>}/>
          <Route path='employees' element={<Employees/>}/>
          <Route path='products' element={<PredefinedProducts/>}/>
          <Route path='expenses' element={<Expenses/>}/>
          <Route path='financials' element={<Financials/>}/>
        </Route>
      )
    )
  }

  return(
      <RouterProvider router={router}/>
  )  

}

export default App



