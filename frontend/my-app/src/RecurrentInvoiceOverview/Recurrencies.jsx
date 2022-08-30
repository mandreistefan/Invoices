import React from "react";
import InvoicesOverview from "../InvoiceComponent/InvoicesOverview";
import RecurrentOverview from './RecurrentOverview.jsx'

let Recurrencies = (props) =>{

    let dateArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let [recurrencies, setRecurrentData] = React.useState(null);
    let [activeRec, setActiveRecInvoice] = React.useState(null)

    React.useEffect(()=>{

        let querry = (props.recID!=null) ? `/invoices/recurrencies/recID/${props.recID}` : "/invoices/recurrencies/all/";
        console.log(querry)

        fetch(querry,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setRecurrentData(data.data)
            }else{

            }
        })
    },[props.recID])

    let prettifyDate = (date) =>{

        //format is yyyy-mm-dd
        let justDate = date.substring(0,10).split("-")
        let day=""
        switch(justDate[2][1]){
            case "1":
                day="st"
                break
            case "2":
                day="nd"
                break
            case "3":
                day="rd"
                break
            default:
                day="th"
        }

        if(justDate[1][0]==="0") justDate[1]=justDate[1].substring(1)
        if(justDate[2][0]==="0") justDate[2]=justDate[2].substring(1)

        return(`${dateArray[parseInt(justDate[1])]} ${justDate[2]}${day}, ${justDate[0]}`)

    }

    return(
        recurrencies &&
            <div className='clients-container app-data-container'>
                <table className='table table-hover'>
                    <thead className='table-active'>
                        <tr>   
                            <th></th>                             
                            <th>Client info</th>
                            <th>Status</th>
                            <th>Recurrency</th>
                            <th>Next invoice</th>
                        </tr>
                    </thead>
                    <tbody className='clients-table-body'>              
                        {recurrencies.map((element, index)=>(
                            <tr key={element.rec_number} className='clients-table-row'>  
                                <td>{index+1}</td>                                  
                                <td>
                                    <span>
                                        <b>{element.client_first_name} {element.client_last_name}</b><br/><hr/>
                                        Adress:<br/>
                                        {element.client_county}<br/>{element.client_city}, {element.client_street}, {element.client_adress_number}<br/>{element.client_zip}
                                    </span>
                                </td>
                                <td>{(element.invoice_active===1) ? "active" : "inactive"}</td>
                                <td>{element.invoice_recurrency}</td>
                                <td>{prettifyDate(element.invoice_next_date)}</td>
                            </tr>
                        ))}
                    </tbody>  
                </table>            
            </div>                
        
    )

}

export default Recurrencies;