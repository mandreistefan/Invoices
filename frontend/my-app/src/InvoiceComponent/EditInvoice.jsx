import React from "react";
import Invoice from './Invoice.jsx'

let EditInvoice=(props)=>{

    let [passedData, setPassedData] = React.useState(null)

    React.useEffect(()=>{
        getData(props.invoiceID)
    },[])

    let getData=(invoice)=>{
        fetch(`./invoiceGenerator/inv/invoiceID/${invoice}`).then(response=>response.json()).then(data=>{
            setPassedData(data.data)
        })
    }

    return(
        passedData&& 
        <Invoice predefined={{tableElements:passedData.invoiceProducts, userData:passedData.invoiceProperty, invoiceID:props.invoiceID}}/>
    )

}

export default EditInvoice