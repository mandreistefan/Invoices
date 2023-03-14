import {useState, useEffect} from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'
import Invoice from '../InvoiceComponent/Invoice.jsx';
import SmallMenu from '../SmallMenu/SmallMenu.jsx';

let Clients = (props) =>{

    let defaultFilter = {filter:"all", filterBy:"", page:1}


    const [allClients, setAllClients] = useState(null)   
    //client that is being edited
    const [activeClient, setActive] = useState(null)
    //used in pagination
    let [numberOfElements, setNOE] = useState(null)
    let [alertUser, setAlertUser] = useState({text: null})
    //new client form
    let [newClientWindow, showonewClientWindow] = useState(false)
    //used to fetch data
    let [queryFilter, setFilter]=useState({filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, page:1, step:10})
    //new ivoice for him
    let [invoiceClient, invoiceThisClient] = useState(null)


    useEffect(()=>{
        fetchClients()
    },[queryFilter.page, queryFilter.step])

    /**
     * fetchesClients
     */
    let fetchClients=()=>{
        //fetches all clients
        fetch(`http://localhost:3000/clients?&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page-1}&step=${queryFilter.step}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAllClients(data.data)
                setNOE(data.totalRecordsNumber)                
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

    let deleteClient=(cliendID)=>{
        let client = cliendID
        if(!client) client = cliendID
        //fetches all clients
        fetch(`http://localhost:3000/clients`,
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({clientID: client})
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setAlertUser({text:"Client arhivat"})
                fetchClients()
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Eroare"})
            }            
        })
    }

    let changePage=(pageNumber, step)=>{
        setFilter({...queryFilter, page:pageNumber, step:step})
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.searchinput.value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...queryFilter, filter:"search", filterBy:searchTermStringified})
    }

    let resetSearch=()=>{
        document.getElementById("searchinput").value=""
        setFilter({...queryFilter, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page, step: 10})
    }

    return(
            <div>
                {allClients &&       
                    <div className="bordered-container p-3" style={{width:'100%'}}>
                        {!activeClient&&  
                        <div>    
                            <div style={{marginBottom:'25px', display:'flex', justifyContent:'flex-start', alignItems:'center'}}>
                                <span class="material-icons-outlined">account_circle</span>
                                <span style={{fontSize:'18px', fontWeight:'600'}}>Clienti</span>
                                <form onSubmit={handleSearchSubmit} style={{marginLeft:'10px'}} id="search-form" name="search-form">
                                    <div className="search-form-container"> 
                                        <span className="material-icons-outlined" style={{width:'24px', color:'lightgray', margin:'auto'}}>search</span>                                                                  
                                        <input className="form-control shadow-none" id="searchinput" placeholder="Cauta.."></input>
                                        <div className="search-header-buttons-container">                               
                                            <button type="button" className='no-backgroud-button' title="Client nou" onClick={()=>{showonewClientWindow(true)}}><div className="inner-button-content"><span className="material-icons-outlined" >add</span></div></button>
                                            <button type="button" className='btn-danger' title="Reincarca date"  onClick={()=>{resetSearch()}}><div className="inner-button-content"><span className="material-icons-outlined" >refresh</span></div></button>
                                        </div>                                                     
                                    </div>
                                </form>
                            </div> 
                            <div style={{overflowY:'scroll', maxHeight:'80vh'}}>
                                <table className="table" id="invoices-table">
                                    <thead>
                                        <tr>
                                            <td>#</td>
                                            <td>Nume</td>
                                            <td>Tip</td>
                                            <td>Adresa</td>
                                            <td></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allClients.length>0 && allClients.map((element, index)=>(          
                                            <tr key={index}>
                                                <td>{index+1}</td>
                                                <td><b>{element.client_first_name} {element.client_last_name}</b></td>
                                                <td><div style={{display:'flex', alignItems:'center'}}>{element.client_type ? element.client_type==="pers" ? <span><span className="material-icons-outlined" style={{fontSize:'16px'}}>person</span>Persoana fizica</span> : <span><span className="material-icons-outlined" style={{fontSize:'16px'}}>store</span>Firma</span> : "NA"}</div></td> 
                                                <td>{element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}, {element.client_zip}</td>                                          
                                                <td className="table-actions-container">
                                                    <button title="Arhiveaza client" onClick={()=>{deleteClient(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
                                                    <button  className='btn-light' title="Factureaza client" onClick={()=>{invoiceThisClient(element)}}><div className="inner-button-content"><span className="material-icons-outlined">library_add</span></div></button>
                                                    <button title="Deschide client" onClick={()=>{setActive(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">open_in_new</span></div></button>
                                                </td>
                                            </tr> 
 
                                        ))}
                                    </tbody>  
                                </table>
                                <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>
                            </div>
                        </div>}
                        {activeClient&&
                            <div className='overview-container bordered-container'> 
                                <button style={{border:'none', borderRadius:'6px', display:'flex', alignItems:'center', margin:'10px'}} onClick={()=>{setActive(null)}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>     
                                <ClientForm key={activeClient.id} editable={true} clientID={activeClient}/>
                            </div>
                        }
                    </div>                             
                }
                {newClientWindow&&
                    <div>
                        <div className="blur-overlap"></div>
                        <div className="overlapping-component-inner">
                            <div className='overlapping-component-header'>
                                <span>Client nou</span>
                                <button type="button" className="action-close-window" onClick={()=>{showonewClientWindow(false)}}><span className="material-icons-outlined">close</span></button>
                            </div>
                            <ClientForm editable={true} isSubmitable={true} clientID={null}/>
                        </div>
                    </div>
                }
                {invoiceClient!=null &&
                    <div>
                        <div className="blur-overlap"></div>                
                        <div className="overlapping-component-inner">
                            <div className='overlapping-component-header'>
                                <span>Factura noua</span>
                                <button type="button" className="action-close-window" onClick={()=>{invoiceThisClient(null)}}><span className="material-icons-outlined">close</span></button>
                            </div>
                            <Invoice activeClient={invoiceClient}/>
                        </div>
                    </div>
                }
                <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>                
            </div>
    )
}

export default Clients;