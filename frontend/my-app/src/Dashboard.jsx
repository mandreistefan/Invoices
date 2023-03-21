import { useEffect, useState } from "react"
import DatabaseSelector from './Settings/DatabaseOperations'
import Logs from "./Logs"

let Dashboard = (props) =>{

    let [dashboardData, setData] = useState(null)
    let [startupStatus, setStatus] = useState(0)

    useEffect(()=>{
        fetch(`http://localhost:3000/dashboardData`,
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

                }            
            })
    },[])

    return(
        <div className="app-data-container">
            {dashboardData!==null&&
                <div>
                    <h1 className="mb-3 fw-semibold lh-1 dashboard-header">Aplicatie facturare</h1>
                    <br/>
                    <h4 className="mb-3 fw-semibold lh-1">Baza de date</h4> 
                    <div style={{marginBottom:'25px'}}>
                        <DatabaseSelector showDetailed={true}/>
                    </div>   
                    <h4 className="mb-3 fw-semibold lh-1">Statistici</h4>          
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
                                <span style={{color:'gray'}} className="material-icons-outlined p-1">receipt</span>
                                <div className="p-1">
                                    <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Status facturi</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">task_alt</span>Finalizate: {dashboardData.status.finalised}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">info</span>Ciorne: {dashboardData.status.draft}</span>
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
                    <br></br>
                    <h4 className="mb-3 fw-semibold lh-1">Ultimele actiuni</h4>   
                    <div>
                        <Logs/>
                    </div>
                </div>
            }
            {dashboardData===null&&
                <div>
                    {startupStatus===0&&
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>}
                    {startupStatus}
                </div>
            }
        </div>
    )

}

export default Dashboard