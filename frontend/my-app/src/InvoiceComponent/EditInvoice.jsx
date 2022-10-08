import React from "react";
import Invoice from './Invoice.jsx'

let EditInvoice=(props)=>{

    let [passedData, setPassedData] = React.useState(null)

    React.useEffect(()=>{
        //getData(props.invoiceID)
    },[])

    let getData=(invoice)=>{
        fetch(`./invoice/?filter=invoiceID&filterBy=${invoice}`).then(response=>response.json()).then(data=>{
            setPassedData(data.data)
        })
    }

    return(
        <Invoice predefined={{invoiceID:props.invoiceID}}/>
    )

}

export default EditInvoice