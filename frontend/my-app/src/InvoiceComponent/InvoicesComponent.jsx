import React from "react";
import Invoice from './Invoice.jsx'
import './invoice.css'
import Overview from './InvoicesOverview.jsx'
import Recurrent from '../RecurrentInvoiceOverview/Recurrencies.jsx'

let Invoices = () =>{

    return(
        <div>
            <div className="invoice-component-container">
                <Overview/>
            </div>
        </div>

    )
}

export default Invoices;