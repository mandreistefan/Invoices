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
    let [newInvoiceWindow, setnewInvoiceWindow] = React.useState(false)
    let [queryFilter, setFilter]=React.useState({filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, page:1})

    //refecth on page change or when the query parameters change (ex. when a search is attempted)
    React.useEffect(()=>{
        fetchData()
    },[queryFilter])

    //archive an invoice
    let deleteInvoice = () =>{
        fetch("http://localhost:3000/invoices",
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
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content',fontWeight:'400'}}><span style={{marginRight:"3px", fontSize:'18px'}} className="material-icons-outlined">info</span></span>)
        }else if(status==="finalised"){
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content', fontWeight:'400'}}><span style={{marginRight:"3px", fontSize:'18px'}} className="material-icons-outlined">task_alt</span></span>)
        }else{
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content', fontWeight:'400'}}><span style={{marginRight:"3px", fontSize:'18px'}} className="material-icons-outlined">error</span></span>)
        }
    }

    let fetchData=()=>{
        //fetches all data
        let fetcher;
        fetcher = `http://localhost:3000/invoices?target=invoices&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page}`
        
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
            {newInvoiceWindow ? 
                <div style={{backgroundColor:'white', overflowY:'auto', padding:'10px'}} id="new-invoice-container">  
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                        <h5>Factura noua</h5>
                        <button type="button" title="Inchide" style={{border:'none',}} onClick={()=>{setnewInvoiceWindow(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button> 
                    </div>                    
                    <Invoice/>
                </div> 
            :invoicesData &&    
                    <div className="clients-overview-container">  
                        <div className="vertical-list-container">         
                            <div class="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                                <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                                    <div className="search-form-container">
                                        <button disabled={newInvoiceWindow ? true : false} type="button" className="btn btn-success btn-sm no-shadow add-new-button" onClick={()=>{setnewInvoiceWindow(true)}}><span class="material-icons-outlined" >add</span></button>
                                        <div className="search-input-container">
                                            <input disabled={newInvoiceWindow ? true : false} type="search" className="search-input form-control shadow-none" placeholder="Cauta.." id="filterData"></input>
                                            <button type="button" className="search-reset-button" onClick={()=>{resetSearch()}}><span class="material-icons-outlined">refresh</span></button>
                                        </div>                 
                                    </div>
                                </form>
                            </div> 
                            <div class="list-group list-group-flush border-bottom scrollarea" style={{width: '300px'}}> 
                                {invoicesData.length>0 && invoicesData.map((element, index)=>(          
                                    <a href="#" class={activeInvoice===element.invoice_number ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>setActiveInvoice(element.invoice_number)} aria-current="true">
                                        <div class="d-flex w-100 align-items-center justify-content-between">
                                            <strong class="mb-1">{element.client_first_name} {element.client_last_name}</strong> 
                                            <small>{element.invoice_number}</small>                                                                            
                                        </div>
                                        <div class="col-10 mb-1 small">
                                            <small style={{display:'flex', flexDirection:"row", alignItems:'center'}}>{setStatus(element.invoice_status)} {simpleDate(element.invoice_date)} </small>                                                
                                        </div>
                                    </a>     
                                ))}                                
                            </div>
                        </div>
                        <div className='overview-container'>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <div style={{width:'70%', display:'inherit', alignItems:'center'}} className="p-3"><h5>Factura numarul {activeInvoice}</h5></div>
                                <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0 p-3" style={{width:'30%'}}>    
                                    <button disabled={newInvoiceWindow ? true : false} class="btn btn-secondary btn-sm no-shadow navigation-button" onClick={()=>{openInvoice()}}><div class="inner-button-content"><span class="material-icons-outlined" >file_open</span>Genereaza</div></button>
                                    <button disabled={newInvoiceWindow ? true : false} class="btn btn-danger btn-sm no-shadow navigation-button" onClick={()=>{deleteInvoice()}}><div class="inner-button-content"><span class="material-icons-outlined" >delete</span>Stergere</div></button>
                                </div>
                            </div>
                            <Invoice key={activeInvoice} invoiceID={activeInvoice}/>
                        </div>
                </div>
            }
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>  
        </div>


    )

}

export default InvoicesOverview