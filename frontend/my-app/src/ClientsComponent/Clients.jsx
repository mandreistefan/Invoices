import React from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import Invoices from '../InvoiceComponent/InvoicesOverview.jsx'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'

let Clients = (props) =>{

    const [allClients, setAllClients] = React.useState(null)
    const [activeClient, setActiveClient] = React.useState({id:null, name:""})
    const [showClientInvoices, setShowClientInvoices] = React.useState(false)
    let [currentPage, setPage] = React.useState(1)
    let [numberOfElements, setNOE] = React.useState(null)
    let [alertUser, setAlertUser] = React.useState({text: null})
    

    React.useEffect(()=>{
        fetchClients()
    },[currentPage])

    //the fetcher
    let fetchClients=()=>{
        //fetches all clients
        fetch(`/clients/?page=${currentPage}&filter=all&filterBy=`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data==null){
                setAlertUser({text:"Something went wrong"})
                return false
            }
            if(data.status!="OK"){
                setAlertUser({text:"Something went wrong"})
                return false  
            }
            if(data.totalRecordsNumber===0){
                setAlertUser({text:"No records!"})
                return false  
            }
            setAllClients(data.data)
            setNOE(data.totalRecordsNumber)
            setActiveClient({id: data.data[0].id, name:data.data[0].client_first_name})

        })
    }

    let deleteClient=()=>{
        //fetches all clients
        fetch(`/clients`,
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({clientID:activeClient.id})
        })
        .then(response=>response.json()).then(data=>{
            if(data==null){
                setAlertUser({text:"Something went wrong"})
                return false
            }
            if(data.status!="OK"){
                setAlertUser({text:"Something went wrong"})
                return false  
            }
            setAlertUser({text:"Client archived"})
            //refresh clients list
            fetchClients()
        })
    }

    let changePage=(pageNumber)=>{
        setPage(pageNumber)
    }

    return(
            <div className='app-data-container'>
                <div className="action-buttons-container">
                    <button class="small-menu-button" onClick={()=>{props.enableInvoiceApp(activeClient.name, activeClient.id)}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#0275d8'}}>receipt_long</span>Factureaza</div></button>
                    <button class="small-menu-button" onClick={()=>{setShowClientInvoices(true)}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#d9534f'}}>file_open</span>Facturi</div></button>
                    <button class="small-menu-button" onClick={()=>{deleteClient()}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#d9534f'}}>delete</span>Stergere</div></button>
                </div>  
                {allClients ? 
                    <div style={{display:'flex', flexDirection:'row'}}>                         
                            <div style={{marginRight:'5px'}}>
                                <table className='table table-hover'>
                                    <tbody className='clients-table-body'>              
                                        {allClients.length>0 && allClients.map((element, index)=>(
                                            <tr key={element.invoice_number} className={activeClient.id===element.id ? "clients-table-row active-row": "clients-table-row"} onClick={()=>{setActiveClient({id:element.id, name:element.client_first_name})}}>  
                                                    <td style={{width:'10%'}}><div style={{display:'flex', flexDirection:'row', alignItems:'center'}}><div className="name-badge" style={{backgroundColor:element.client_gui_color}}>{element.client_first_name.substring(0,1)}{element.client_last_name.substring(0,1)}</div></div></td>
                                                    <td>
                                                        <div style={{fontSize:"14px",lineHeight:"normal"}}>
                                                            {element.client_first_name} {element.client_last_name}<br/>
                                                            {element.client_type}<br/>
                                                            {element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}, {element.client_zip}
                                                        </div>    
                                                    </td>                      
                                            </tr>
                                        ))}
                                    </tbody>  
                                </table>
                                <PageNavigation numberOfItems={numberOfElements} changePage={changePage}/>
                            </div> 
                        <ClientForm key={activeClient.id} editable={true} isSubmitable={true} clientID={activeClient.id}/>
                    </div> : <h4 style={{textAlign:"center"}}>Nothing</h4>
                }
                {showClientInvoices &&
                    <div> 
                        <div className="blur-overlap"></div>   
                        <button type="button" className="action-close-window" onClick={()=>{setShowClientInvoices(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>  
                        <div className="overlapping-component-inner">
                            <span>Facturile lui <b>{activeClient.name}</b></span>
                            <Invoices queryFilterBy="clientID" queryFilterData={activeClient.id}/>
                        </div>              
                    </div>
                } 
                <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>                
            </div>
    )
}

export default Clients;