import {useState, useEffect} from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'

let Clients = (props) =>{

    let defaultFilter = {filter:"all", filterBy:"", page:1}

    //local storage
    if(!localStorage.getItem('activeClient')) localStorage.setItem('activeClient', "")
    if(!localStorage.getItem('activeClientName')) localStorage.setItem('activeClientName', "")

    const [allClients, setAllClients] = useState(null)
    const [activeClient, setActive] = useState({id:localStorage.getItem('activeClient') ? localStorage.getItem('activeClient') : null, name:localStorage.getItem('activeClientName') ? localStorage.getItem('activeClientName'): ""})
    let [numberOfElements, setNOE] = useState(null)
    let [alertUser, setAlertUser] = useState({text: null})
    let [newClientWindow, showonewClientWindow] = useState(false)
    
    let [queryFilter, setFilter]=useState({filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, page:1})

    useEffect(()=>{
        fetchClients()
    },[queryFilter])

    /**
     * fetchesClients
     */
    let fetchClients=()=>{
        //fetches all clients
        fetch(`http://localhost:3000/clients?&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAllClients(data.data)
                setNOE(data.totalRecordsNumber)
                if(localStorage.getItem('activeClient').length===0) setActiveClient(data.data[0].id, data.data[0].client_first_name)
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
        fetch(`http://localhost:3000/clients`,
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({clientID:activeClient.id})
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setAlertUser({text:"Client arhivat"})
                localStorage.setItem('activeClient', "")
                localStorage.setItem('activeClientName', "")
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

    let setActiveClient=(id, name)=>{
        setActive({id, name})
        localStorage.setItem('activeClient', id)
        localStorage.setItem('activeClientName', name)
    }

    return(
            <div className='app-data-container'>
                {allClients &&       
                    <div className="clients-overview-container">
                        <div className="vertical-list-container">     
                            <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">                
                                <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                                    <div className="search-form-container">
                                        <button className="btn btn-secondary btn-sm no-shadow add-new-button" type="button" onClick={()=>{showonewClientWindow(true)}}><span className="material-icons-outlined">add</span></button>                                
                                        <div className="search-input-container">
                                            <input type="search" className="search-input form-control shadow-none" placeholder="Cauta.." id="filterData"></input>
                                            <button type="button" className="search-reset-button" onClick={()=>{resetSearch()}}><span className="material-icons-outlined">refresh</span></button>
                                        </div>                 
                                    </div>
                                </form>
                            </div>
                            <div className="list-group list-group-flush border-bottom scrollarea" style={{width: '300px'}}> 
                                {allClients.length>0 && allClients.map((element, index)=>(        
                                    <div className={parseInt(activeClient.id)===parseInt(element.id) ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>{setActiveClient(element.id, element.client_first_name)}} aria-current="true">
                                        <div style={{display:'flex', flexDirection:'row'}}>     
                                            <div style={{display:'flex', flexDirection:'row'}}>
                                                <div className="name-badge" style={{backgroundColor:element.client_gui_color}}>{element.client_first_name.substring(0,1)}{element.client_last_name.substring(0,1)}</div>
                                            </div>
                                            <div>
                                                <div className="d-flex w-100 align-items-center justify-content-between">
                                                    <strong className="mb-1">{element.client_first_name} {element.client_last_name}</strong>                                            
                                                </div>
                                                <div className="col-10 mb-1 small">
                                                    <small>{element.client_type ? element.client_type==="pers" ? <span><span className="material-icons-outlined" style={{fontSize:'16px'}}>person</span>Persoana fizica</span> : <span><span className="material-icons-outlined" style={{fontSize:'16px'}}>store</span>Firma</span> : "NA"}<br/></small>
                                                    {element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}, {element.client_zip}
                                                </div>
                                            </div>
                                        </div>
                                    </div>  
                                ))} 
                                <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>                               
                            </div> 
                        </div>
                        <div className='overview-container'>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <div style={{width:'70%', display:'inherit', alignItems:'center'}} className="p-3"><h5>{activeClient.name}</h5></div>
                                <div className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0 p-3" style={{width:'30%'}}>                                
                                    <button className="btn btn-secondary btn-sm no-shadow navigation-button" onClick={()=>{props.enableInvoiceApp(activeClient.name, activeClient.id)}}><div className="inner-button-content"><span className="material-icons-outlined">library_add</span>Factureaza</div></button>
                                    <button className="btn btn-danger btn-sm no-shadow navigation-button" onClick={()=>{deleteClient()}}><div className="inner-button-content"><span className="material-icons-outlined">delete</span>Stergere</div></button>
                                </div>
                            </div>
                            <ClientForm key={activeClient.id} editable={true} isSubmitable={true} clientID={activeClient.id}/>
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