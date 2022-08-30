import React from "react";
import PrettyInvoice from '../PrettyInvoice/PrettyInvoice.jsx'
import RecurrentOverview from '../RecurrentInvoiceOverview/RecurrentOverview.jsx'
import EditInvoice from './EditInvoice.jsx'
import './InvoiceAdd.css'
import './Invoices.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import SmallMenu from '../SmallMenu/SmallMenu.jsx'
import PageNavigation from '../PageNavigation.jsx'

let InvoicesOverview = (props) =>{

    let [invoicesData, invoicesDataSet] = React.useState(null)
    let [activeInvoice, setActiveInvoice] = React.useState(null)
    let [activeRec, setActiveRecInvoice] = React.useState(null)
    let [editInvoice, setEditInvoice] = React.useState({enabled:false, invoiceID:null})
    let [alertUser, setAlertUser] = React.useState({text: null})
    let [showInfo, setInfoShower] = React.useState( props.hideInfoText ? false: true)
    let [currentPage, setPage] = React.useState(1)
    let [numberOfElements, setNOE] = React.useState(null)

    React.useEffect(()=>{
        fetchData()
    },[currentPage])

    //archive an invoice
    let deleteInvoice = (invoiceID) =>{
        fetch("/invoices",
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({invoiceID:invoiceID})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAlertUser({text: "Invoice archived"})
            }
            else{
                setAlertUser({text: "An error ocurred"})
            }
        })
    }

    let simpleDate = (date) =>{
        let dateArr = date.toString().substr(0,10).split("-")
        return (`${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`)
    }

    let setStatus = (status) =>{
        if(status==="draft"){
            return (<span className="badge text-bg-light" style={{display:'flex', alignItems:'center', width:'fit-content'}}><span style={{marginRight:"3px"}} className="material-icons-outlined">info</span>Draft</span>)
        }else if(status==="finalised"){
            return (<span className="badge text-bg-light" style={{display:'flex', alignItems:'center', width:'fit-content'}}><span style={{marginRight:"3px"}} className="material-icons-outlined">task_alt</span>Finalised</span>)
        }else{
            return (<span className="badge text-bg-light" style={{display:'flex', alignItems:'center', width:'fit-content'}}><span style={{marginRight:"3px"}} className="material-icons-outlined">error</span>NA</span>)
        }
    }

    let fetchData=()=>{
        //fetches all data
        let fetcher;
        let queryFilterBy = (props.queryFilterBy) ? props.queryFilterBy : null;
        let queryFilterData = (props.queryFilterData) ? props.queryFilterData : null;

        (queryFilterBy) ? fetcher = `/invoices/?target=invoices&filter=${queryFilterBy}&filterBy=${queryFilterData}&page=${currentPage}` : fetcher = `/invoices/?target=invoices&filter=all&page=${currentPage}`
        
        fetch(fetcher,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.data!=null){
                invoicesDataSet(data.data)
                if(numberOfElements===null) setNOE(data.recordsNumber)
            }else{
                setAlertUser({text:"An error occured"})
            }
        })
    }

    let changePage=(pageNumber)=>{
        setPage(pageNumber)
    }

    return(
        <div className="app-data-container">         
            {invoicesData &&
                <div className='clients-container app-data-container'>
                    {showInfo &&
                        <div className="info-text">
                            <h1 className="info-text-header">Invoices overview</h1>
                            <div>
                                <div className="info-text-box">                                
                                    <p className="lead">Provides an overview of all invoices. <b>Draft</b> invoices are saved, but can still be edited; draft invoices are not considered for financial calculations. <b>Finalised</b> invoices can no longer be edited and are considered proof of bill.</p>
                                </div>
                                <div class="row g-4 py-2 row-cols-1 row-cols-lg-3">
                                    <div class="col d-flex align-items-start">
                                        <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                            <span style={{marginRight:"10px"}} className="material-icons-outlined">open_in_new</span>
                                        </div>
                                        <div>
                                            <h4>Open</h4>
                                            <p>Generate a printable copy of the invoice. INFO: all invoices can be generated, including draft invoices</p>
                                        </div>
                                    </div>
                                    <div class="col d-flex align-items-start">
                                        <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                            <span style={{marginRight:"10px"}} className="material-icons-outlined">edit</span>
                                        </div>
                                        <div>
                                            <h4>Edit</h4>
                                            <p>Edit invoices. Finalised invoices cannot be edited</p>
                                        </div>
                                    </div>
                                    <div class="col d-flex align-items-start">
                                        <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                            <span style={{marginRight:"10px"}} className="material-icons-outlined">delete</span>
                                        </div>
                                        <div>
                                            <h4>Delete</h4>
                                            <p>Delete an invoice. Deleted invoices are NOT erased, but they are archived</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <table className='table table-hover' style={{marginTop:'20px'}}>
                        <thead className='table-active'>
                            <tr>  
                                <th></th> 
                                <th></th>
                                <th>Invoice no.</th>                                
                                <th>Client name</th>
                                <th>Client adress</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className='clients-table-body'>              
                            {invoicesData.map((element, index)=>(
                                <tr key={element.invoice_number} className='clients-table-row'>  
                                    <td>{index+1}</td>         
                                    <td>{element.rec_number && <div><span className="badge text-bg-secondary recurring-notifier" onClick={ () => setActiveRecInvoice(element.rec_number)}><span style={{fontSize:'16px'}}className="material-icons-outlined">autorenew</span></span></div>}</td>               
                                    <td><b>{element.invoice_number}</b></td>
                                    <td className='clients-table-td'><span className="invoices-summary-table-span">{element.client_first_name} {element.client_last_name}</span></td>
                                    <td>{element.client_county}, {element.client_city}, {element.client_street}, {element.client_adress_number}</td>
                                    <td>{setStatus(element.invoice_status)}</td>
                                    <td>{simpleDate(element.invoice_date)}</td>
                                    <td>{element.invoice_total_sum} RON<br/></td>                            
                                    <td>
                                        <div className='actions-container'>                                    
                                            <SmallMenu items={[
                                                {name:"Open", icon:"open_in_new", disabled: false, clickAction:()=>{setActiveInvoice(element.invoice_number)}}, 
                                                {name:"Edit", icon:"edit", disabled: element.invoice_status==="finalised" ? true :  false, clickAction:()=>{setEditInvoice({enabled:true, invoiceID:element.invoice_number})}}, 
                                                {name:"Delete", icon:"delete", disabled:false, clickAction:()=>{deleteInvoice(element.invoice_number)}}
                                            ]}/>
                                        </div> 
                                    </td>
                                </tr>
                            ))}
                        </tbody>  
                    </table>
                    <PageNavigation numberOfItems={numberOfElements} changePage={changePage}/>
                </div>                
            }
            {activeInvoice!=null &&
                <div> 
                    <div className="blur-overlap"></div>     
                    <div className="overlapping-component-inner">
                        <div className="overlapping-component-actions">
                            <span className="bd-lead">Invoice overview</span>
                            <button type="button" className="action-close-window" onClick={()=>setActiveInvoice(null)}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        </div>
                        <PrettyInvoice invoiceNumber={activeInvoice}/>
                    </div>              
                </div>
            }
            {activeRec!=null &&
                <div> 
                    <div className="blur-overlap"></div>     
                    <div className="overlapping-component-inner">
                        <div className="overlapping-component-actions">
                            <span className="bd-lead">Recurrent invoice overview</span>
                            <button type="button" className="action-close-window" onClick={()=>setActiveRecInvoice(null)}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        </div>
                        <RecurrentOverview recurrentID={activeRec}/>
                    </div>              
                </div>
            }
            {editInvoice.enabled &&
                <div> 
                    <div className="blur-overlap"></div>     
                    <div className="overlapping-component-inner">
                        <div className="overlapping-component-actions">
                            <span className="bd-lead">Edit invoice</span>
                            <button type="button" className="action-close-window " onClick={()=>{setEditInvoice({enabled:false, invoiceID:null})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        </div>
                        <EditInvoice invoiceID={editInvoice.invoiceID}/>
                    </div>              
                </div>
            }
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>  
        </div>


    )

}

export default InvoicesOverview