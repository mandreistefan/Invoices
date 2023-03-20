import { useEffect, useState } from "react"
import DatabaseSelector from './Settings/DatabaseOperations'

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
                    <h1 className="mb-3 fw-semibold lh-1 dashboard-header"><span class="material-icons-outlined" style={{fontSize:'40px'}}>receipt</span>Aplicatie facturare</h1>
                    <div>
                        <span>Conectat la</span>
                        <DatabaseSelector showDetailed={true}/>
                    </div>                    
                    <div class="row" style={{width:'100%', backgroundColor:'white', fontSize:'18px'}} className="dashboard-row">
                        <div class="col-3">
                            <div>
                                <span class="material-icons-outlined p-1">receipt_long</span>
                                <div class="p-1">
                                    <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Numar facturi</span>
                                    <span style={{fontSize:'38px', fontWeight:'500'}}>{dashboardData.total_invoices}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div>
                                <span class="material-icons-outlined p-1">receipt</span>
                                <div class="p-1">
                                    <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Status facturi</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span class="material-icons-outlined text-success m-1">task_alt</span>Finalizate: {dashboardData.status.finalised}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span class="material-icons-outlined text-warning m-1">info</span>Ciorne: {dashboardData.status.draft}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div>
                                <span class="material-icons-outlined p-1">payments</span>
                                <div class="p-1">
                                    <span style={{fontWeight:'500', color:'gray'}}>Total incasat</span>
                                    <span style={{fontSize: '32px', fontWeight: '600', color: 'rgb(53, 182, 83)'}}>{dashboardData.total_income}</span><small>RON</small>
                                </div>
                            </div>                     
                        </div>
                        <div class="col-3">
                            <div>
                                <div class="p-1">
                                    <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Ultima factura</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span class="material-icons-outlined m-1">person</span>{dashboardData.lastInvoice.client_first_name} {dashboardData.lastInvoice.client_last_name}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span class="material-icons-outlined m-1">calendar_today</span>{dashboardData.lastInvoice.date.substring(0, 10)}</span>
                                    <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span class="material-icons-outlined m-1">money</span>{dashboardData.lastInvoice.total} <small>RON</small></span>
                                </div>
                            </div>                         
                        </div>
                    </div>
                </div>
            }
            {dashboardData===null&&
                <div>
                    {startupStatus===0&&
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>}
                    {startupStatus}
                </div>
            }
        </div>
    )

}

export default Dashboard