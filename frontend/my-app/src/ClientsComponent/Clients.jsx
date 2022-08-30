import React from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import Invoices from '../InvoiceComponent/InvoicesOverview.jsx'
import SmallMenu from '../SmallMenu/SmallMenu'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'

let Clients = (props) =>{

    const [allClients, setAllClients] = React.useState(null)
    const [clientID, setClientID] = React.useState(null)
    const [editableClient, setEditableClient] = React.useState(null)
    const [showClientInvoices, setShowClientInvoices] = React.useState(null)
    let [showInfo, setShowInfo] = React.useState(true)
    let [currentPage, setPage] = React.useState(1)
    let [numberOfElements, setNOE] = React.useState(null)
    let [alertUser, setAlertUser] = React.useState({text: null})
    

    React.useEffect(()=>{
        //since the component is embeded in other components, the info text can be hidden/ shwon by the parent component
        if(props.showInfo){
            if(props.showInfo===false) setShowInfo(false)
        }
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
            if(data.status==="OK"){
                setAllClients(data.data)
                if(numberOfElements===null) setNOE(data.totalRecordsNumber)
            }else{
                setAlertUser({text:"Something went wrong"})
            }
        })
    }

    //archives a client
    let deleteClient = (clientID) =>{
        fetch("/clients",
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({clientID:clientID})
        })
        .then(response=>response.json())
        .then(data=>{
            console.log(data.status)
        })
    }

    //shows the client edit window
    let enableClientEditing = (userID) =>{
        (userID) ? setEditableClient(userID) : setClientID(null)
    }

    //shows the invoices linked to a client
    let enableClientInvoices = (userID) =>{
        (userID) ? setShowClientInvoices(userID) : setShowClientInvoices(null)
    }

    let changePage=(pageNumber)=>{
        setPage(pageNumber)
    }

    return(
        allClients &&
            <div className='clients-container app-data-container'>
                {showInfo&&
                    <div className="info-text">
                        <h1 className="info-text-header">Clients</h1>
                        <div className="info-text-box">                                
                            <p className="lead">Provides an overview of all clients.</p>
                        </div>
                        <div class="row g-4 py-2 row-cols-1 row-cols-lg-4">
                            <div class="col d-flex align-items-start">
                                <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                    <span style={{marginRight:"10px"}} className="material-icons-outlined">add</span>
                                </div>
                                <div>
                                    <h4>New invoice</h4>
                                    <p>Add a new voice for a registered client. Client data is auto-filled</p>
                                </div>
                            </div>
                            <div class="col d-flex align-items-start">
                                <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                    <span style={{marginRight:"10px"}} className="material-icons-outlined">open_in_new</span>
                                </div>
                                <div>
                                    <h4>Invoices</h4>
                                    <p>Show all invoices that are linked with the client</p>
                                </div>
                            </div>
                            <div class="col d-flex align-items-start">
                                <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                    <span style={{marginRight:"10px"}} className="material-icons-outlined">edit</span>
                                </div>
                                <div>
                                    <h4>Edit</h4>
                                    <p>Edit the client info</p>
                                </div>
                            </div>
                            <div class="col d-flex align-items-start">
                                <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                    <span style={{marginRight:"10px"}} className="material-icons-outlined">delete</span>
                                </div>
                                <div>
                                    <h4>Delete</h4>
                                    <p>Delete the registered client. Deleted clients are NOT erased, but they are archived</p>
                                </div>
                            </div>
                        </div>
                    </div>
                }                  
                <table className='table table-hover'>
                    <thead className='table-active'>
                        <tr className='app-data-table-row'>
                            <th>Name</th>
                            <th>County</th>
                            <th>City</th>
                            <th>Street</th>
                            <th>Phone number</th>
                            <th>Email</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className='clients-table-body app-data-table-body'>              
                        {allClients.map(element=>(
                            <tr key={element.id} className='clients-table-row app-data-table-row'>
                                <td>{element.client_first_name} {element.client_last_name}</td>
                                <td>{element.client_county}</td> 
                                <td>{element.client_city}</td>
                                <td>{element.client_street}</td>                               
                                <td>{element.client_phone}</td>
                                <td>{element.client_email}</td>
                                <td>
                                    <div className='actions-container'>
                                        <SmallMenu items={[
                                            {name:"New invoice", icon:"add", clickAction:()=>{props.enableInvoiceApp(true, element.id)}}, 
                                            {name:"Invoices", icon:"file_open", clickAction:()=>{enableClientInvoices(element.id)}}, 
                                            {name:"Edit", icon:"edit", clickAction:()=>{enableClientEditing(element.id)}},
                                            {name:"Delete", icon:"delete", clickAction:()=>{deleteClient(element.id)}}
                                        ]}/>
                                    </div>                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>  
                </table>
                <PageNavigation numberOfItems={numberOfElements} changePage={changePage}/>
                {(editableClient!=null) &&
                    <div> 
                        <div className="blur-overlap"></div>     
                        <div className="overlapping-component-inner">
                            <div className="overlapping-component-actions">
                                <span className="bd-lead">Edit client info</span>
                                <button type="button" className="action-close-window" onClick={()=>{setEditableClient(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                            </div>
                            <ClientForm editable={editableClient} isSubmitable={true} clientID={editableClient}/>
                        </div>              
                    </div>
                }  
                {(showClientInvoices!=null) &&
                    <div> 
                        <div className="blur-overlap"></div>     
                        <div className="overlapping-component-inner">
                            <div className="overlapping-component-actions">
                                <span className="bd-lead">Client invoices</span>
                                <button type="button" className="action-close-window" onClick={()=>{setShowClientInvoices(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                            </div>
                            <Invoices queryFilterBy="clientID" queryFilterData={showClientInvoices}/>
                        </div>              
                    </div>
                } 
                <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>                
            </div>
    )
}

export default Clients;