import React from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import Invoices from '../InvoiceComponent/InvoicesOverview.jsx'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'

let Clients = (props) =>{

    let defaultFilter = {filter:"all", filterBy:"", page:1}

    const [allClients, setAllClients] = React.useState(null)
    const [activeClient, setActiveClient] = React.useState({id:null, name:""})
    const [showClientInvoices, setShowClientInvoices] = React.useState(false)
    let [numberOfElements, setNOE] = React.useState(null)
    let [alertUser, setAlertUser] = React.useState({text: null})
    
    let [queryFilter, setFilter]=React.useState({filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, page:1})

    React.useEffect(()=>{
        fetchClients()
    },[queryFilter])

    //the fetcher
    let fetchClients=()=>{
        //fetches all clients
        fetch(`/clients?&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAllClients(data.data)
                setNOE(data.totalRecordsNumber)
                setActiveClient({id: data.data[0].id, name:data.data[0].client_first_name})
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else if(data.status==="NO_DATA"){
                setAlertUser({text:"Nu exista date"})
            }else{
                if(data==null||data.totalRecordsNumber===0){
                    setAlertUser({text:"Nu exista date"})
                    return false
                }
                setAlertUser({text:"Eroare"})
            }
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
            if(data.status==="OK"){
                setAlertUser({text:"Client archived"})
                fetchClients()
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Eroare"})
            }            
        })
    }

    let changePage=(pageNumber)=>{
        setFilter({...queryFilter, page:pageNumber})
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...queryFilter, filter:"search", filterBy:searchTermStringified})
    }

    let resetSearch=()=>{
        document.getElementById("filterData").value=""
        setFilter({...queryFilter, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    return(
            <div className='app-data-container'>
                <div className="action-buttons-container">
                    <button class="small-menu-button" onClick={()=>{props.enableInvoiceApp(activeClient.name, activeClient.id)}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'black'}}>library_add</span>Factureaza</div></button>
                    <button class="small-menu-button" onClick={()=>{setShowClientInvoices(true)}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'black'}}>folder</span>Facturi</div></button>
                    <button class="small-menu-button" onClick={()=>{deleteClient()}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#d9534f'}}>delete</span>Stergere</div></button>
                    <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                        <div className="search-form-container">
                            <div className="search-input-container">
                                <div className="search-icon"><span class="material-icons-outlined">search</span></div>
                                <input type="text" className="search-input form-control shadow-none" id="filterData"></input>
                                <button type="button" className="search-reset-button" onClick={()=>{resetSearch()}}><span class="material-icons-outlined">close</span></button>
                            </div>                 
                        </div>
                    </form>
                </div>  
                {allClients ? 
                    <div style={{display:'flex', flexDirection:'row'}}>                         
                            <div style={{marginRight:'5px'}}>
                                <table className='table table-hover'>
                                    <tbody className='clients-table-body'>              
                                        {allClients.length>0 && allClients.map((element, index)=>(
                                            <tr key={element.invoice_number} className={activeClient.id===element.id ? "clients-table-row active-row": "clients-table-row"} onClick={()=>{setActiveClient({id:element.id, name:element.client_first_name})}}>  
                                                    <td style={{width:'10%'}}>
                                                        <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                                            <div className="name-badge" style={{backgroundColor:element.client_gui_color}}>{element.client_first_name.substring(0,1)}{element.client_last_name.substring(0,1)}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{fontSize:"14px",lineHeight:"normal"}}>
                                                            <b>{element.client_first_name} {element.client_last_name}</b><br/>
                                                            {element.client_type ? element.client_type==="pers" ? <span><span class="material-icons-outlined" style={{fontSize:'16px'}}>person</span>Persoana fizica</span> : <span><span class="material-icons-outlined" style={{fontSize:'16px'}}>store</span>Firma</span> : "NA"}<br/>
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