import { useEffect, useState } from "react"
import {processedDate} from './Utils.jsx'

let History = (props) =>{

    let [logs, setLogs] = useState(null)
    let [dataFetchStatus, setFetchStatus] = useState(<div className="spinner-border" role="status"></div>)

    useEffect(()=>{
        if(props.target){
            fetch(`http://localhost:3000/history?target=${props.target}`,
            {
                method:"GET",
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response=>response.json()).then(data=>{      
                if(data.status==="OK"){                
                    if(data.data.length>0){
                        setLogs(data.data)
                    }else{
                        setFetchStatus(<span>Fara istoric</span>)
                    }
                    //setActiveInvoice(data.data[0].invoice_number)
                }else if(data.status==="SERVER_ERROR"){
                    //setAlertUser({text: "Baza de date nu poate fi accesata"})
                }else if(data.status==="NO_DATA"){
                    //setAlertUser({text: "Nu exista date"})
                }else{
    
                }            
            })
        }
    }, [])

    return(
        <div>
            {logs!==null&&
            logs.map((element, index)=>(
                <div key={index} className="financial-square mb-2">
                    <span style={{color:'gray'}} className="material-icons-outlined">schedule</span>
                    <div>
                        <span style={{color:'gray', fontWeight:'500'}}>{processedDate(element.date, true)}</span>
                        <span>{element.message}</span>
                    </div>
                </div>
            ))}
            {logs===null&&dataFetchStatus}
        </div>
    )

}

export default History