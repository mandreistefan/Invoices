import './App.css';
import Layout from './Layout'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesOverview'
import Employees from './Employees/Employees.jsx'
import PredefinedProducts from './Admins/PredefinedProducts.jsx'
import Expenses from './Admins/Expenses'
import Financials from './FinancialComponent/FinancialComponent'
import BilledProducts from './Admins/BilledProducts.jsx'
import Dashboard from './Dashboard';
import {Route, createBrowserRouter, RouterProvider, createRoutesFromElements, createHashRouter, useRouteError, useOutletContext} from 'react-router-dom'

let App =()=> {

  let router;
  
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
        <Route path="/" element={<Layout/>} errorElement={<ErrorBoundary />} >
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

  return(
      <RouterProvider router={router}/>
  )  

}

export default App



