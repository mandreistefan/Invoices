import {useState, useEffect} from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import PageNavigation from '../PageNavigation.jsx'
import Invoice from '../InvoiceComponent/Invoice.jsx';
import SmallMenu from '../SmallMenu/SmallMenu.jsx';
import Header from '../Header.jsx';
import { useOutletContext } from 'react-router-dom';

let Clients = (props) =>{

    let defaultFilter = {filter:"all", filterBy:"", page:1}

    const [allClients, setAllClients] = useState(null)   
    //client that is being edited
    const [activeClient, setActive] = useState(null)
    //used in pagination
    let [numberOfElements, setNOE] = useState(null)
    //new client form
    let [newClientWindow, showonewClientWindow] = useState(false)
    //used to fetch data
    let [queryFilter, setFilter]=useState({filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, page:1, step:10})
    //new ivoice for him
    let [invoiceClient, invoiceThisClient] = useState(null)
    let {addSnackbar, port, loadingSpinner } = useOutletContext();

    useEffect(()=>{
        fetchClients()
    },[queryFilter.page, queryFilter.step, queryFilter.filterBy])

    /**
     * fetchesClients
     */
    let fetchClients=()=>{
        //fetches all clients
        fetch(`http://localhost:${port}/clients?&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page-1}&step=${queryFilter.step}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAllClients(data.data!== null ? data.data : [])
                setNOE(data.totalRecordsNumber)                
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text:"Baza de date nu poate fi accesata"})
            }else if(data.status==="NO_DATA"){
                addSnackbar({text:"Nu exista date"})
            }else{
                if(data==null||data.totalRecordsNumber===0){
                    addSnackbar({text:"Nu exista date"})
                    return false
                }
                addSnackbar({icon:"report_problem", text:"Eroare"})
            }
        })
    }

    /**
     * Delete a client from the DB
     * @param {*} cliendID ID of the client
     * @returns 
     */
    let deleteClient=(cliendID)=>{
        let client = cliendID
        if(!client) client = cliendID

        if(window.confirm("Arhivati client?") === false) return false

        fetch(`http://localhost:${port}/clients`,
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({clientID: client})
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text:"Client arhivat"})
                fetchClients()
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text:"Baza de date nu poate fi accesata"})
            }else{
                addSnackbar({icon:"report_problem", text:"Eroare"})
            }            
        })
    }

    let changePage=(pageNumber, step)=>{
        setFilter({...queryFilter, page:pageNumber, step:step})
    }

    function handleSearchSubmit(searchTermStringified){
        if(searchTermStringified===""){
            setFilter({...queryFilter, filter:"all", filterBy:defaultFilter.filterBy})
        }else{
            setFilter({...queryFilter, filter:"search", filterBy:searchTermStringified})
        }
    }

    let refreshData=()=>{        
        setFilter({...queryFilter, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    return(
            <div> 
                {!activeClient&&  
                <div className="bordered-container" style={{display: activeClient===null ? "" : "none"}} >   
                    <Header title="Clienti" display={allClients!==null && allClients.length>0 ? true : false} icon="account_circle" searchAction={handleSearchSubmit} refreshData={refreshData} buttons={[{title:"Client nou", action:()=>{showonewClientWindow(true)}, icon:"add", name:"Client nou"}]}/>
                    <div>                        
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
                                {allClients!==null && allClients.length>0 && allClients.map((element, index)=>(          
                                    <tr key={index}>
                                        <td>{index+1}</td>
                                        <td>{element.client_first_name} {element.client_last_name}</td>
                                        <td>{element.client_type==="pers" ? <div className='badge badge-gray'><span className="material-icons-outlined" style={{fontSize:'16px'}}>person</span>Persoana fizica</div> : <div className='badge badge-gray'><span className="material-icons-outlined" style={{fontSize:'16px'}}>store</span>Firma</div>}</td> 
                                        <td>{element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}, {element.client_zip}</td>                                          
                                        <td className="table-actions-container">                                                    
                                            <SmallMenu buttons={[
                                                {title:"Deschide client", action:()=>{setActive(element.id)}, name:"Deschide", icon:"file_open"}, 
                                                {title:"Factureaza client", action:()=>{invoiceThisClient(element)}, name:"Factureaza", icon:"receipt_long"}, 
                                                {title:"Arhiveaza client", action:()=>{deleteClient(element.id)}, name:"Sterge", icon:"delete"}
                                            ]}/>
                                        </td>
                                    </tr> 
                                ))}                                
                            </tbody>
                        </table>
                        {allClients===null && loadingSpinner}  
                        {allClients!== null && allClients.length===0 && <h6 style={{textAlign:'center'}}>Nu exista date</h6>}  
                        <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>
                    </div>
                </div>}                           
                {activeClient&&
                <div> 
                    <button className='outline-mint-button' style={{marginBottom:'10px'}} onClick={()=>{setActive(null)}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>     
                    <div className='bordered-container'>
                        <ClientForm key={activeClient.id} editable={true} clientID={activeClient} addSnackbar={addSnackbar}/>
                    </div>
                </div>}
                {newClientWindow&&
                <div>
                    <div className="blur-overlap"></div>
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Client nou</span>
                            <button type="button" className="action-close-window" onClick={()=>{showonewClientWindow(false)}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div className='p-3'>
                            <ClientForm editable={true} isSubmitable={true} clientID={null} addSnackbar={addSnackbar}/>
                        </div>
                    </div>
                </div>}
                {invoiceClient!=null &&
                    <div>
                        <div className="blur-overlap"></div>                
                        <div className="overlapping-component-inner">
                            <div className='overlapping-component-header'>
                                <span>Factura noua</span>
                                <button type="button" className="action-close-window" onClick={()=>{invoiceThisClient(null)}}><span className="material-icons-outlined">close</span></button>
                            </div>
                            <Invoice activeClient={invoiceClient} addSnackbar={addSnackbar}/>
                        </div>
                    </div>
                }                            
            </div>
    )
}

export default Clients;