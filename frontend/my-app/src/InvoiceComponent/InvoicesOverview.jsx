import React from "react";
import RecurrentOverview from '../RecurrentInvoiceOverview/RecurrentOverview.jsx'
import './InvoiceAdd.css'
import './Invoices.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'
import Invoice from './Invoice'

let InvoicesOverview = (props) =>{

    let defaultFilter = {filter:"all", filterBy:"", page:1}

    let [invoicesData, invoicesDataSet] = React.useState(null)
    let [activeInvoice, setActiveInvoice] = React.useState(null)
    let [activeRec, setActiveRecInvoice] = React.useState(null)
    let [alertUser, setAlertUser] = React.useState({text: null})
    let [numberOfElements, setNOE] = React.useState(null)
    let [queryFilter, setFilter]=React.useState({filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, page:1})

    //refecth on page change or when the query parameters change (ex. when a search is attempted)
    React.useEffect(()=>{
        fetchData()
    },[queryFilter])

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
        fetcher = `/invoices?target=invoices&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page}`
        
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
            }else if(data.status==="NO_DATA"){
                setAlertUser({text: "Nu exista date"})
            }else{
                if(data===null||data.recordsNumber===0){
                    setAlertUser({text:"Nu exista date"})
                    return false
                } 
            }            
        })
    }

    let changePage=(pageNumber)=>{
        setFilter({...queryFilter, page:pageNumber})
    }

    let openInvoice=()=>{
        window.open(`http://localhost:3001/generateInvoice/${activeInvoice}`).focus();
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
        <div className="app-data-container">   
            <div className="action-buttons-container">
                <button class="small-menu-button" onClick={()=>{openInvoice()}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'black'}}>file_open</span>Genereaza</div></button>
                <button class="small-menu-button" onClick={()=>{deleteInvoice()}}><div class="inner-button-content"><span class="material-icons-outlined" style={{color:'#d9534f'}}>delete</span>Stergere</div></button>
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