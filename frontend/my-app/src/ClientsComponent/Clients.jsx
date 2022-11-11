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
    let [newClientWindow, showonewClientWindow] = React.useState(false)
    
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
                <header class="p-3">
                    <div class="container nav-head-container">
                        <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                            <span onClick={()=>{showonewClientWindow(true)}} class="material-icons-outlined add-new-nav-button" style={{fontSize:'35px', marginRight:'5px'}}>account_circle</span>
                            <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">                                
                                <button className="btn btn-primary btn-sm no-shadow navigation-button" onClick={()=>{props.enableInvoiceApp(activeClient.name, activeClient.id)}}><div class="inner-button-content"><span class="material-icons-outlined">library_add</span>Factureaza</div></button>
                                <button className="btn btn-primary btn-sm no-shadow navigation-button" onClick={()=>{setShowClientInvoices(true)}}><div class="inner-button-content"><span class="material-icons-outlined">folder</span>Facturi</div></button>
                                <button className="btn btn-outline-danger btn-sm no-shadow navigation-button" onClick={()=>{deleteClient()}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span>Stergere</div></button>
                            </div>
                            <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                                <div className="search-form-container">
                                    <div className="search-input-container">
                                        <input type="searcg" className="search-input form-control shadow-none" placeholder="Cauta.." id="filterData"></input>
                                        <button type="button" className="search-reset-button" onClick={()=>{resetSearch()}}><span class="material-icons-outlined">close</span></button>
                                    </div>                 
                                </div>
                            </form>
                        </div>
                    </div>
                </header>
                {allClients ? 
                    <div style={{display:'flex', flexDirection:'row'}}>     
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-white" style={{width: '250px'}}> 
                                {allClients.length>0 && allClients.map((element, index)=>(
                                    <div>            
                                        <div class="list-group list-group-flush border-bottom scrollarea">
                                            <a href="#" class={parseInt(activeClient.id)===parseInt(element.id) ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>{setActiveClient({id: element.id, name:element.client_first_name})}} aria-current="true">
                                                <div style={{display:'flex', flexDirection:'row'}}>     
                                                    <div style={{display:'flex', flexDirection:'row'}}>
                                                        <div className="name-badge" style={{backgroundColor:element.client_gui_color}}>{element.client_first_name.substring(0,1)}{element.client_last_name.substring(0,1)}</div>
                                                    </div>
                                                    <div>
                                                        <div class="d-flex w-100 align-items-center justify-content-between">
                                                            <strong class="mb-1">{element.client_first_name} {element.client_last_name}</strong>                                            
                                                        </div>
                                                        <div class="col-10 mb-1 small">
                                                            <small>{element.client_type ? element.client_type==="pers" ? <span><span class="material-icons-outlined" style={{fontSize:'16px'}}>person</span>Persoana fizica</span> : <span><span class="material-icons-outlined" style={{fontSize:'16px'}}>store</span>Firma</span> : "NA"}<br/></small>
                                                            {element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}, {element.client_zip}
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>                    
                                        </div>
                                    </div>
                                ))}                            
                            </div>
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
                {newClientWindow&&
                    <div>
                        <div className="blur-overlap"></div>     
                        <button type="button" className="action-close-window" onClick={()=>{showonewClientWindow(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        <div className="overlapping-component-inner">
                            <ClientForm editable={true} isSubmitable={true} clientID={null}/>
                        </div>
                    </div>}
                <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>                
            </div>
    )
}

export default Clients;