import { useEffect, useState } from "react"
import {processedDate} from './Utils.jsx'
import { useOutletContext } from "react-router-dom";

let History = (props) =>{

    let [logs, setLogs] = useState(null)
    let [dataFetchStatus, setFetchStatus] = useState(<div className="spinner-border" role="status"></div>)

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    useEffect(()=>{
        if(props.target){
            fetch(`http://localhost:${port}/history?target=${props.target}`,
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
                <div key={index} className="mb-2 shadow-sm p-2 bg-white rounded" style={{display:"flex", flexDirection:'row'}}>
                    <span style={{color:'gray'}} className="material-icons-outlined">schedule</span>
                    <span style={{color:'gray', fontWeight:'500'}}>{processedDate(element.date, true)}</span>
                    <span style={{marginLeft:'10px'}}>{element.message}</span>                    
                </div>
            ))}
            {logs===null&&dataFetchStatus}
        </div>
    )

}

export default History