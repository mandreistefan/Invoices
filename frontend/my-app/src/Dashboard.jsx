import { useEffect, useState } from "react"
import DatabaseSelector from './Settings/DatabaseOperations'
import Logs from "./Logs"
import { useOutletContext } from 'react-router-dom';

let Dashboard = (props) =>{

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port
    let [dashboardData, setData] = useState(null)
    

    useEffect(()=>{
        fetch(`http://localhost:${port}/dashboardData`,
            {
                method:"GET",
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response=>response.json()).then(data=>{      
                if(data.status==="OK"){                
                    setData(data.data)
                    //setActiveInvoice(data.data[0].invoice_number)
                }else if(data.status==="SERVER_ERROR"){
                    //setAlertUser({text: "Baza de date nu poate fi accesata"})
                }else if(data.status==="NO_DATA"){
                    //setAlertUser({text: "Nu exista date"})
                }else{
                    //setErrorNotifier("A existat o eroare in conectarea la baza de date! Baza de date nu exista sau aplicatia nu se poate conecta!")
                }            
            })
            .catch(error=>{
                console.log(error)
            })
    },[])

    return(
        <div className="app-data-container">
            {dashboardData!==null&&
                <div>
                    <h1 className="mb-3 fw-semibold lh-1 dashboard-header" style={{fontWeight:'700'}}>Aplicatie facturare</h1>
                    <br/>
                    <span className="mb-3 fw-semibold lh-1" style={{fontWeight:'700', textTransform:'capitalize', fontSize:'16px'}}>Baza de date</span> 
                    <div style={{marginBottom:'25px'}}>
                        <DatabaseSelector showDetailed={true}/>
                    </div>   
                    <span className="mb-3 fw-semibold lh-1" style={{fontWeight:'700', textTransform:'capitalize', fontSize:'16px'}}>Statistici</span> 
                    <div className="row" style={{marginBottom:'24px'}}>
                        <div className="col-3">
                            <div className='financial-square'>
                                <div className="p-1">
                                    <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Ultima factura</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">person</span>{dashboardData.lastInvoice.client_first_name} {dashboardData.lastInvoice.client_last_name}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">calendar_today</span>{dashboardData.lastInvoice.date.substring(0, 10)}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">money</span>{dashboardData.lastInvoice.total} <small>RON</small></span>
                                </div>
                            </div>                         
                        </div>
                    </div>         
                    <div className="row">
                        <div className="col-3">
                            <div className='financial-square'>
                                <span  style={{color:'gray'}} className="material-icons-outlined p-1">receipt_long</span>
                                <div className="p-1">
                                    <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Numar facturi</span>
                                    <span style={{fontSize:'38px', fontWeight:'500'}}>{dashboardData.total_invoices}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className='financial-square'>
                                <div className="p-1">
                                    <span style={{fontWeight:'500', color:'gray'}}>Cea mai mare factura</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">calendar_today</span>{dashboardData.highestInvoice.date.substring(0, 10)}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">money</span>{dashboardData.highestInvoice.income} <small>RON</small></span>
                                </div>
                            </div>                     
                        </div>
                        <div className="col-3">
                            <div className='financial-square'>
                                <span  style={{color:'gray'}} className="material-icons-outlined p-1">payments</span>
                                <div className="p-1">
                                    <span style={{fontWeight:'500', color:'gray'}}>Total incasat</span>
                                    <span style={{fontSize: '32px', fontWeight: '600', color: 'rgb(53, 182, 83)'}}>{dashboardData.total_income}</span><small>RON</small>
                                </div>
                            </div>                     
                        </div>
                    </div>
                    <br></br>
                    <span className="mb-3 fw-semibold lh-1" style={{fontWeight:'700', textTransform:'capitalize', fontSize:'16px'}}>Ultimele actiuni</span>   
                    <div>
                        <Logs/>
                    </div>
                </div>
            }
            {dashboardData===null&&
                <div>
                    <div className="spinner-border" role="status">
                        <span className="sr-only"></span>
                    </div> 
                </div>
            }
        </div>
    )

}

export default Dashboard