import {useEffect, useState} from 'react';
import './Invoices.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'
import Invoice from './Invoice'
import Header from '../Header';
import SmallMenu from '../SmallMenu/SmallMenu';

let InvoicesOverview = (props) =>{

    let defaultFilter = {filter:"all", filterBy:"", page:1, order:"invoice_number", orderBy:"desc", interval:""}

    let [invoicesData, invoicesDataSet] = useState(null)
    let [activeInvoice, setActiveInvoice] = useState(null)
    let [alertUser, setAlertUser] = useState({text: null})
    let [numberOfElements, setNOE] = useState(null)
    let [queryFilter, setFilter] = useState({
        filter: props.queryFilterBy ? props.queryFilterBy : defaultFilter.filter, 
        filterBy: props.queryFilterData ? props.queryFilterData : defaultFilter.filterBy, 
        page:1, 
        step:10,
        order: defaultFilter.order,
        orderBy: defaultFilter.orderBy,
        interval: defaultFilter.interval
    })

    let [activeFilters, setActiveFilters] = useState({date:null, search:null})
    let [viewType, setViewType] = useState(0)

    //refecth on page change or when the query parameters change (ex. when a search is attempted)
    useEffect(()=>{
        fetchData()
    },[queryFilter.page, queryFilter.step, queryFilter.filterBy, queryFilter.order, queryFilter.orderBy, queryFilter.interval])

    /**
     * Fetches data
     */
    let fetchData=()=>{
        //fetches all data
        let fetcher = `http://localhost:3000/invoices?target=invoices&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page-1}&step=${queryFilter.step}&order=${queryFilter.order}&orderBy=${queryFilter.orderBy}&interval=${queryFilter.interval}`
        
        fetch(fetcher,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response=>response.json()).then(data=>{      
            if(data.status==="OK"){    
                if(viewType===0){
                    data.data.forEach(element => {
                        element.expanded = false
                    });
                    invoicesDataSet(data.data)
                    setNOE(data.recordsNumber)
                }else{
                    let currentData = [...invoicesData]
                    let concatenatedData = currentData.concat(data.data)
                    invoicesDataSet(concatenatedData)
                    if(concatenatedData.length < (queryFilter.page * queryFilter.step)) document.getElementById("loadMore").disabled = true
                }          

                //setActiveInvoice(data.data[0].invoice_number)
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

    /**
     * Archives an invoice
     * @param {*} invoiceID If undefined, the function uses activeInvoice
     */
    let deleteInvoice = (invoiceID) =>{
        let invoice = invoiceID
        if(!invoice) invoice = activeInvoice

        if(window.confirm("Arhivati factura?") === false) return false

        fetch("http://localhost:3000/invoices",
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({invoiceID: invoice})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAlertUser({text: "Factura arhivata"})
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text: "Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text: "An error ocurred"})
            }
        })
    }

    let setInvoiceFinalised = (invoiceID) =>{
        fetch(`http://localhost:3000/invoices`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({invoice_status: "finalised", invoiceID})
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setAlertUser({text: "Factura setata ca finalizata"})
                fetchData()
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text: "Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text: "An error ocurred"})
            }
        })
    }

    let simpleDate = (date) =>{
        console.log(date)
        let dateArr = date.toString().substr(0,10).split("-")
        return (`${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`)
    }

    let setStatus = (status, aBoolean) =>{
        if(status==="draft"){
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content',fontWeight:'600'}} className="text-warning"><span style={{marginRight:"3px"}} className="material-icons-outlined">info</span>{aBoolean && "Draft"}</span>)
        }else if(status==="finalised"){
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content', fontWeight:'600'}} className="text-success"><span style={{marginRight:"3px"}} className="material-icons-outlined">task_alt</span>{aBoolean && "Finalizat"}</span>)
        }else{
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content', fontWeight:'600'}} className="text-danger"><span style={{marginRight:"3px"}} className="material-icons-outlined">error</span>{aBoolean && "Eroare"}</span>)
        }
    }

    let changePage=(pageNumber, step)=>{
        setFilter({...queryFilter, page:pageNumber, step:step})
    }

    let openInvoice=(invoiceID)=>{
        window.open(`http://localhost:${window.navigator.userAgent==="ElectronApp" ? "3000" : "3001"}/generateInvoice/${invoiceID}`).focus();
    }

    function handleSearchSubmit(searchTermStringified){
        if(searchTermStringified===""){
            setFilter({...queryFilter, filter:"all", filterBy:defaultFilter.filterBy})
            let activeFiltersCopy = {...activeFilters}
            activeFiltersCopy.search=null
            setActiveFilters(activeFiltersCopy)
        }else{
            setFilter({...queryFilter, filter:"search", filterBy:searchTermStringified})
            let activeFiltersCopy = {...activeFilters}
            activeFiltersCopy.search=searchTermStringified
            setActiveFilters(activeFiltersCopy)
        }
    }

    let refreshData=()=>{        
        setFilter({...queryFilter, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page, interval:defaultFilter.interval})
    }

    let intervalFunction=(interval, appliesTo)=>{
        let start, end
        start = interval.start.split("-")
        end = interval.end.split("-")
        let filterCopy = {...queryFilter}
        filterCopy.interval = `${start[2][0]}${start[2][1]}${start[1][0]}${start[1][1]}${start[0][2]}${start[0][3]}-${end[2][0]}${end[2][1]}${end[1][0]}${end[1][1]}${end[0][2]}${end[0][3]}`
        setFilter(filterCopy)

        let activeFiltersCopy = {...activeFilters}
        activeFiltersCopy.date=`${start[2]}.${start[1]}.${start[0]} - ${end[2]}.${end[1]}.${end[0]}`
        setActiveFilters(activeFiltersCopy)

    }

    function changeDisplay(){        
        setViewType(viewType===0 ? 1 : 0)
    }

    return(
        <div className="app-data-container">  
                {invoicesData &&     
                <div className="bordered-container" style={{display: activeInvoice===null ? "" : "none"}}>                    
                    <div className="" style={{width:'100%'}}>
                        {!activeInvoice &&
                            <div> 
                                <Header title="Facturi" icon="receipt_long" searchAction={handleSearchSubmit} refreshData={refreshData} buttons={[{title:"Tip display", action:()=>{setViewType(viewType===0 ? 1 : 0)}, icon:"add", name:"Display"}]} intervalFunction={intervalFunction}/>    
                                <div style={{backgroundColor:"#f8f9fa", padding:'6px', paddingLeft:'20px'}}>
                                    {activeFilters.date!==null && <span className="badge bg-success">Data: {activeFilters.date}</span>}
                                    {activeFilters.search!==null && <span className="badge bg-success">Cautare: {activeFilters.search}</span>}
                                </div>
                                <div style={{maxHeight:'80vh'}}>
                                    {viewType===0 &&
                                        <table className="table" id="invoices-table">
                                            <thead>
                                                <tr>
                                                    <td>#</td>
                                                    <td>Client</td>
                                                    <td><button className="table-order-button" onClick={()=>{setFilter({...queryFilter, order:'invoice_number', orderBy: queryFilter.orderBy==='asc' ? 'desc' : 'asc'})}}><span className="material-icons-outlined">{queryFilter.orderBy==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button>Numar factura</td>
                                                    <td>Status</td>
                                                    <td>Data</td>
                                                    <td><button className="table-order-button" onClick={()=>{setFilter({...queryFilter, order:'total', orderBy: queryFilter.orderBy==='asc' ? 'desc' : 'asc'})}}><span className="material-icons-outlined">{queryFilter.orderBy==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button>Total</td>
                                                    <td></td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoicesData.length>0 && invoicesData.map((element, index)=>(          
                                                    <tr key={index}>
                                                        <td>{((queryFilter.page*10)-10) +index+1}</td>
                                                        <td>{element.client_first_name} {element.client_last_name}</td>
                                                        <td>{element.invoice_number}</td>
                                                        <td>{setStatus(element.invoice_status, true)}</td>
                                                        <td>{element.normal_date}</td>   
                                                        <td>{element.invoice_total_sum} RON</td>                                          
                                                        <td className="table-actions-container">                                                       
                                                            {element.invoice_status!=="finalised" && <button title="Seteaza ca platita" onClick={()=>{setInvoiceFinalised(element.invoice_number)}}><div className="inner-button-content"><span className="material-icons-outlined">task_alt</span></div></button>}
                                                            <SmallMenu buttons={[{title:"Genereaza factura", action:()=>{openInvoice(element.invoice_number)}, name:"Genereaza", icon:"file_open"}, {title:"Deschide factura", action:()=>{setActiveInvoice(element.invoice_number)}, name:"Deschide", icon:"open_in_new"}, {title:"Arhiveaza factura", action:()=>{deleteInvoice(element.invoice_number)}, name:"Sterge", icon:"delete"}]}/>
                                                        </td>
                                                    </tr>    
                                                ))}
                                            </tbody>  
                                        </table>  
                                    }
                                    <div style={{display:viewType===1 ? "none" : "block"}}><PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/></div>
                                </div>                                
                            </div>  
                        } 
                    </div>
                </div>}
                {viewType===1 &&
                <div>
                    {invoicesData.length>0 && 
                    <div style={{display:'flex', justifyContent:'row', flexWrap:'wrap'}} className="grid-invoices">
                        {invoicesData.map((element, index)=>(                                   
                        <div className="financial-square" style={{width:'225px', margin:'6px', cursor:'pointer'}} onClick={()=>{setActiveInvoice(element.invoice_number)}}>
                            <span className='p-1'>{setStatus(element.invoice_status, false)}</span>
                            <div className="p-1">
                                <span style={{color:'gray', fontWeight:'500'}}>{element.client_first_name} {element.client_last_name}</span>
                                <span style={{color:'gray', fontWeight:'500'}}>{element.normal_date}</span>
                                <span style={{fontSize:'32px', fontWeight:'600'}}>{element.invoice_total_sum}<small>RON</small></span>
                                <span style={{color:'gray', fontWeight:'500'}}>{element.invoice_number}</span>
                            </div>
                        </div>
                        ))}                    
                    </div>}
                    <button id="loadMore" className="btn btn-light outline-mint-button" onClick={()=>{setFilter({...queryFilter, page: queryFilter.page + 1})}}>Incarca</button>
                </div>
                }
                {activeInvoice &&
                <div>
                    <button className='outline-mint-button' style={{marginBottom:'10px'}} onClick={()=>{setActiveInvoice(null)}}><span className="material-icons-outlined">arrow_back</span>Inchide</button>
                    <div className='overview-container bordered-container'>                                
                        <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} className='p-3'>
                            <div style={{display:'inherit', alignItems:'center'}}><span style={{fontSize:'24px'}}>Factura numarul {activeInvoice}</span></div>                                                        
                        </div>
                        <Invoice key={activeInvoice} invoiceID={activeInvoice}/>
                    </div>
                </div>}
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>  
        </div>
    )

}

export default InvoicesOverview