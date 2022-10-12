import React from "react";
import Invoice from './Invoice.jsx'

let EditInvoice=(props)=>{

    let [passedData, setPassedData] = React.useState(null)

    React.useEffect(()=>{
        //getData(props.invoiceID)
    },[])

    return(
        <Invoice ley={props.invoiceID} predefined={{invoiceID:props.invoiceID}}/>
    )

}

export default EditInvoice