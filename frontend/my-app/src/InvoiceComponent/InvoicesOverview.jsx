import React from "react";
import RecurrentOverview from '../RecurrentInvoiceOverview/RecurrentOverview.jsx'
import './InvoiceAdd.css'
import './Invoices.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'
import Invoice from './Invoice'

let InvoicesOverview = (props) =>{

    let [invoicesData, invoicesDataSet] = React.useState(null)
    let [activeInvoice, setActiveInvoice] = React.useState(null)
    let [activeRec, setActiveRecInvoice] = React.useState(null)
    let [alertUser, setAlertUser] = React.useState({text: null})
    let [currentPage, setPage] = React.useState(1)
    let [numberOfElements, setNOE] = React.useState(null)

    React.useEffect(()=>{
        fetchData()
    },[currentPage])

    //archive an invoice
    let deleteInvoice = () =>{
        fetch("/invoices",
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({invoiceID:activeInvoice})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAlertUser({text: "Invoice archived"})
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text: "Baza de date nu poate fi accesata"})
            }else{
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
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content',color:'#f0ad4e', fontWeight:'500'}}><span style={{marginRight:"3px", fontSize:'24px'}} className="material-icons-outlined">info</span></span>)
        }else if(status==="finalised"){
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content', color:'#5cb85c', fontWeight:'500'}}><span style={{marginRight:"3px", fontSize:'24px'}} className="material-icons-outlined">task_alt</span></span>)
        }else{
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content', fontWeight:'500'}}><span style={{marginRight:"3px", fontSize:'24px'}} className="material-icons-outlined">error</span></span>)
        }
    }

    let fetchData=()=>{
        //fetches all data
        let fetcher;
        let queryFilterBy = (props.queryFilterBy) ? props.queryFilterBy : null;
        let queryFilterData = (props.queryFilterData) ? props.queryFilterData : null;

        (queryFilterBy) ? fetcher = `/invoices?target=invoices&filter=${queryFilterBy}&filterBy=${queryFilterData}&page=${currentPage}` : fetcher = `/invoices?target=invoices&filter=all&page=${currentPage}`
        
        fetch(fetcher,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response=>response.json()).then(data=>{
      
            if(data.status==="OK"){
                invoicesDataSet(data.data)
                setNOE(data.recordsNumber)
                setActiveInvoice(data.data[0].invoice_number)
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text: "Baza de date nu poate fi accesata"})
            }else{
                if(data===null||data.recordsNumber===0){
                    setAlertUser({text:"Nu exista date"})
                    return false
                } 
            }
            
        })
    }

    let changePage=(pageNumber)=>{
        setPage(pageNumber)
    }

    let openInvoice=()=>{
        window.open(`http://localhost:3001/generateInvoice/${activeInvoice}`).focus();
    }

    return(
        <div className="app-data-container">   
            <div className="action-buttons-container">
                <button class="small-menu-button" onClick={()=>{openInvoice()}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#0275d8'}}>open_in_new</span>Genereaza</div></button>
                <button class="small-menu-button" onClick={()=>{deleteInvoice()}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#d9534f'}}>delete</span>Stergere</div></button>
            </div> 
            {invoicesData ?           
                <div style={{display:'flex', flexDirection:'row'}}>                 
                    <div className='clients-container' style={{marginRight:'5px'}}>
                        <table className='table table-hover' style={{width:'300px'}}>
                            <tbody className='clients-table-body'>              
                                {invoicesData.length>0 && invoicesData.map((element, index)=>(
                                    <tr key={element.invoice_number} className={activeInvoice===element.invoice_number ? "clients-table-row active-row": "clients-table-row"} onClick={()=>setActiveInvoice(element.invoice_number)}>         
                                        <td style={{width:'10%'}}>{setStatus(element.invoice_status)}</td>
                                        <td>
                                            <div style={{fontSize:"14px",lineHeight:"normal"}}>
                                                {element.invoice_number}<br/>
                                                {element.client_first_name} {element.client_last_name}<br/>
                                                {simpleDate(element.invoice_date)}
                                            </div>    
                                        </td>             
                                    </tr>))}
                            </tbody>  
                        </table>
                        <PageNavigation numberOfItems={numberOfElements} changePage={changePage}/>
                    </div>                 
                    <div className="overview-container"><Invoice key={activeInvoice} invoiceID={activeInvoice}/></div>
                </div> : <h4 style={{textAlign:"center"}}>Nothing</h4>
            }
            
            {activeRec!=null &&
                    <div> 
                        <div className="blur-overlap"></div>  
                        <button type="button" className="action-close-window" onClick={()=>setActiveRecInvoice(null)}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>   
                        <div className="overlapping-component-inner">
                            <div className="overlapping-component-actions">
                                <span className="bd-lead">Recurrent invoice overview</span>
                                
                            </div>
                            <RecurrentOverview recurrentID={activeRec}/>
                        </div>              
                    </div>
                }

            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>  
        </div>


    )

}

export default InvoicesOverview