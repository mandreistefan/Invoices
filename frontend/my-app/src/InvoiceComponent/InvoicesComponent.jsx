import React from "react";
import Invoice from './Invoice.jsx'
import './invoice.css'
import Overview from './InvoicesOverview.jsx'
import Recurrent from '../RecurrentInvoiceOverview/Recurrencies.jsx'

let Invoices = () =>{

    let [currentElement, setCurrentElement] = React.useState("overview")

    let submenu=[
        {id:"invoices-overview-button", name:"overview", icon:'home', disabled:false, displayName:"Overview"},
        {id:"new-invoice-button", name:"new-invoice", icon:'add_circle', disabled:false, displayName:"Factura noua"},
    ]

    return(
        <div>
            <div className="app-title-container">
                <h4>Facturi</h4>
                <div className="app-submenu-selector">{submenu.map((element,index)=>(<button id={element.id} key={index} disabled={((currentElement===element.name) ? true :false)||(element.disabled===true)} onClick={()=>{setCurrentElement(element.name)}}><span className="button-label"><span className="material-icons-outlined">{element.icon}</span>{element.displayName}</span></button>))}</div>
            </div>
            <hr/>
            <div className="invoice-component-container">
                {currentElement==="new-invoice" && <Invoice/>}
                {currentElement==="overview" && <Overview/>}
                {currentElement==="recurrent" && <Recurrent/>}
            </div>
        </div>

    )
}

export default Invoices;