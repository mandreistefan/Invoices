import { useEffect, useState } from "react"
import Logs from "./Logs"
import { useOutletContext } from 'react-router-dom';

let Dashboard = (props) =>{

    let {addSnackbar, port} = useOutletContext();
    let [dashboardData, setData] = useState(null)
    let [errorNotifier, setErrorNotifier] = useState(null)
    

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
                    setErrorNotifier("Nu exista date. Baza de date nu exista sau nu are inregistrari")
                }else if(data.status==="NO_DATABASE"){
                    setErrorNotifier("Nu exista baze de date inregistrate")    
                }else{
                    setErrorNotifier("A existat o eroare in conectarea la baza de date! Baza de date nu exista sau aplicatia nu se poate conecta!")
                }            
            })
            .catch(error=>{
                console.log(error)
            })
    },[])

    return(
        <div className="app-data-container">
            <div className="px-4 my-5 text-center">                       
                <h1 className="display-5 fw-bold">Aplicatie facturare</h1>
                <div className="col-lg-8 mx-auto">
                    <p className="lead mb-4">Aplicatie de inregistrare clienti, eliberare facturi, management angajati.</p>
                </div>
            </div> 
            {errorNotifier!==null ? <div className="alert alert-secondary">{errorNotifier}</div>:
            dashboardData!== null ?
            <div>
                <div className="row" style={{marginBottom:'25px'}}>
                    <div className="col-4">
                        <div className='financial-square'>
                            <div className="p-1">
                                <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Ultima factura</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">person</span>{dashboardData.lastInvoice.client_first_name} {dashboardData.lastInvoice.client_last_name}</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">calendar_today</span>{dashboardData.lastInvoice.date.substring(0, 10)}</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">money</span>{dashboardData.lastInvoice.total} <small>RON</small></span>
                            </div>
                        </div>                         
                    </div>
                    <div className="col-4">
                        <div className='financial-square'>
                            <div className="p-1">
                                <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Cea mai mare factura</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">person</span>{dashboardData.highestInvoice.client_first_name} {dashboardData.highestInvoice.client_last_name}</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">calendar_today</span>{dashboardData.highestInvoice.date.substring(0, 10)}</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">money</span>{dashboardData.highestInvoice.income} <small>RON</small></span>
                            </div>
                        </div>                     
                    </div>
                </div>      
                <div className="row" >
                    <div className="col-4">
                        <div className='financial-square'>
                            <span  style={{color:'gray'}} className="material-icons-outlined p-1">receipt_long</span>
                            <div className="p-1">
                                <span style={{fontWeight:'500', color:'gray', marginBottom:'10px'}}>Numar facturi</span>
                                <span style={{fontSize:'38px', fontWeight:'500'}}>{dashboardData.total_invoices}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className='financial-square'>
                            <span  style={{color:'gray'}} className="material-icons-outlined p-1">payments</span>
                            <div className="p-1">
                                <span style={{fontWeight:'500', color:'gray'}}>Total incasat</span>
                                <span style={{fontSize: '32px', fontWeight: '600', color: 'rgb(53, 182, 83)'}}>{dashboardData.total_income}</span><small>RON</small>
                            </div>
                        </div>                     
                    </div>
                    <div className="col-4">
                        <div className='financial-square'>
                            <span  style={{color:'gray'}} className="material-icons-outlined p-1">payments</span>
                            <div className="p-1">
                                <span style={{fontWeight:'500', color:'gray'}}>Status facturi</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}>{dashboardData.status.finalised} finalizate</span>
                                <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}>{dashboardData.status.draft} ciorne</span>
                            </div>
                        </div>                     
                    </div>
                </div>
                <br></br>
                <div className="px-1 text-center"> <span className="mb-3 fw-semibold lh-1" style={{fontWeight:'700', fontSize:'16px', color:'gray'}}>Ultimele actiuni</span></div>   
                <div>
                    <Logs/>
                </div>
            </div>
            :
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