import React from 'react';
import ClientForm from '../ClientForm/ClientForm.jsx';
import Invoices from '../InvoiceComponent/InvoicesOverview.jsx'
import SmallMenu from '../SmallMenu/SmallMenu'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'

let Clients = (props) =>{

    const [allClients, setAllClients] = React.useState([])
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
                if(data.data) setAllClients(data.data)
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
            if(data.status==="OK"){
                setAlertUser({text:"Client archived"})
            }else{
                setAlertUser({text:"Something went wrong"})
            }
        })
    }

    //shows the client edit window
    let enableClientEditing = (userID) =>{
        (userID) ? setEditableClient(userID) : setClientID(null)
    }

    //shows the invoices linked to a client
    let enableClientInvoices = (userID, userName) =>{
        (userID) ? setShowClientInvoices({userID:userID, name:userName}) : setShowClientInvoices(null)
    }

    let changePage=(pageNumber)=>{
        setPage(pageNumber)
    }

    return(
            <div className='app-data-container'>
                <table className='table table-hover'>
                        <thead className='table-active'>
                            <tr>  
                                <th>#</th>
                                <th>NUME</th> 
                                <th>ADRESA</th>
                                <th>TELEFON</th>                                
                                <th>MAIL</th>
                                <th>NOTE</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className='clients-table-body'>              
                            {allClients.length>0 ? 
                                allClients.map((element, index)=>(
                                    <tr key={element.invoice_number} className='clients-table-row'>  
                                        <td>{index+1}</td>         
                                        <td> 
                                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                                <div className="name-badge" style={{backgroundColor:element.client_gui_color}}>{element.client_first_name.substring(0,1)}{element.client_last_name.substring(0,1)}</div>{element.client_first_name} {element.client_last_name}</div>
                                        </td>               
                                        <td>{element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}, {element.client_zip}</td>                            
                                        <td>{element.client_phone}</td>
                                        <td>{element.client_email}</td>      
                                        <td style={{maxWidth:'400px'}} className="text-overflow-hide">{element.client_notes}</td>                           
                                        <td>
                                            <div className='actions-container'>                                    
                                                <SmallMenu items={[
                                                    {name:"Factureaza", icon:"receipt_long", clickAction:()=>{props.enableInvoiceApp(element.client_first_name, element.id)}}, 
                                                    {name:"Facturi", icon:"file_open", clickAction:()=>{enableClientInvoices(element.id, element.client_first_name)}}, 
                                                    {name:"Editare", icon:"edit", clickAction:()=>{enableClientEditing(element.id)}},
                                                    {name:"Stergere", icon:"delete", clickAction:()=>{deleteClient(element.id)}}
                                                ]}/>
                                            </div> 
                                        </td>
                                    </tr>
                            )):""}
                        </tbody>  
                    </table>
                {allClients.length==0 && <div style={{textAlign:"center", width:"100%"}}><h4 >No data</h4></div>}
                <PageNavigation numberOfItems={numberOfElements} changePage={changePage}/>
                {(editableClient!=null) &&
                    <div> 
                        <div className="blur-overlap"></div>   
                        <button type="button" className="action-close-window" onClick={()=>{setEditableClient(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>  
                        <div className="overlapping-component-inner">
                            <div className="overlapping-component-actions">
                                <span><b>Editare client</b></span>                              
                            </div>
                            <ClientForm editable={editableClient} isSubmitable={true} clientID={editableClient}/>
                        </div>              
                    </div>
                }  
                {(showClientInvoices!=null) &&
                    <div> 
                        <div className="blur-overlap"></div>   
                        <button type="button" className="action-close-window" onClick={()=>{setShowClientInvoices(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>  
                        <div className="overlapping-component-inner">
                            <span>Facturile lui <b>{showClientInvoices.name}</b></span>
                            <Invoices queryFilterBy="clientID" queryFilterData={showClientInvoices.userID}/>
                        </div>              
                    </div>
                } 
                <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>                
            </div>
    )
}

export default Clients;