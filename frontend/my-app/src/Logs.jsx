import { useEffect, useState } from "react"
import {processedDate} from './Utils'
import { useOutletContext } from "react-router-dom";

let Logs = (props) =>{

    let [logs, setLogs] = useState(null)

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    useEffect(()=>{
        
        fetch(`http://localhost:${port}/latestlogs`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response=>response.json()).then(data=>{      
            if(data.status==="OK"){                
                setLogs(data.data)
                //setActiveInvoice(data.data[0].invoice_number)
            }else if(data.status==="SERVER_ERROR"){
                //setAlertUser({text: "Baza de date nu poate fi accesata"})
            }else if(data.status==="NO_DATA"){
                //setAlertUser({text: "Nu exista date"})
            }else{

            }            
        })
    }, [])

    return(
        <div>
            {logs!==null&&
            logs.map((element, index)=>(
                <div key={index} className="financial-square mb-2">
                    <span style={{color:'gray'}} className="material-icons-outlined">schedule</span>
                    <div>
                        <span style={{color:'gray', fontWeight:'500'}}>{processedDate(element.date)}</span>
                        <span>{element.message}</span>
                    </div>
                </div>
            ))}
        </div>
    )

}

export default Logs