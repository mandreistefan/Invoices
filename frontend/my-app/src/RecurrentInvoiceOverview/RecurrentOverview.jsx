import React from "react";
import Overview from '../InvoiceComponent/InvoicesOverview.jsx'
import Recurrencies from "./Recurrencies.jsx";
import './RecurrentOverview.css'

let RecurrentOverview = (props) =>{

    return(
        <div>
            <h4>Recurrency info:</h4>
            <div>
                <Recurrencies recID={props.recurrentID}/>                             
            </div>
            <h4>Linked invoices:</h4>
            <div className="recurrent-linked-invoices">
                <Overview queryFilterBy="recID" queryFilterData={props.recurrentID} hideInfoText={true}/>
            </div>
        </div>
    )

}

export default RecurrentOverview;