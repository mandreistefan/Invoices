import {useEffect, useState} from 'react';
import './Invoices.css'
import PageNavigation from '../PageNavigation.jsx'
import Invoice from './Invoice'
import Header from '../Header';
import SmallMenu from '../SmallMenu/SmallMenu';
import { useOutletContext } from 'react-router-dom';

let InvoicesOverview = (props) =>{

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    let defaultFilter = {filter:"all", filterBy:"", page:1, order:"invoice_number", orderBy:"desc", interval:""}

    let [invoicesData, invoicesDataSet] = useState(null)
    let [activeInvoice, setActiveInvoice] = useState(null)
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

    //refecth on page change or when the query parameters change (ex. when a search is attempted)
    useEffect(()=>{
        fetchData()
    },[queryFilter.page, queryFilter.step, queryFilter.filterBy, queryFilter.order, queryFilter.orderBy, queryFilter.interval])

    /**
     * Fetches data
     */
    let fetchData=()=>{
        //fetches all data
        let fetcher = `http://localhost:${port}/invoices?target=invoices&filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page-1}&step=${queryFilter.step}&order=${queryFilter.order}&orderBy=${queryFilter.orderBy}&interval=${queryFilter.interval}`
        
        fetch(fetcher,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response=>response.json()).then(data=>{      
            if(data.status==="OK"){  
                data.data.forEach(element => {
                    element.expanded = false
                });
                invoicesDataSet(data.data)
                setNOE(data.recordsNumber)
                //setActiveInvoice(data.data[0].invoice_number)
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text: "Baza de date nu poate fi accesata"})
            }else if(data.status==="NO_DATA"){
                addSnackbar({text: "Nu exista date"})
            }else{
                if(data===null||data.recordsNumber===0){
                    addSnackbar({text:"Nu exista date"})
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

        fetch("http://localhost:${port}/invoices",
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({invoiceID: invoice})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: "Factura arhivata"})
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text: "Baza de date nu poate fi accesata"})
            }else{
                addSnackbar({icon:"report_problem", text: "An error ocurred"})
            }
        })
    }

    let setInvoiceFinalised = (invoiceID) =>{
        fetch(`http://localhost:${port}/invoices`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({invoice_status: "finalised", invoiceID})
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: "Factura setata ca finalizata"})
                fetchData()
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text: "Baza de date nu poate fi accesata"})
            }else{
                addSnackbar({icon:"report_problem", text: "An error ocurred"})
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
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content'}} className="text-warning"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">info</span>{aBoolean && "Ciorna"}</span>)
        }else if(status==="finalised"){
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content'}} className="text-success"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">task_alt</span>{aBoolean && "Finalizata"}</span>)
        }else{
            return (<span style={{display:'flex', alignItems:'center', width:'fit-content'}} className="text-danger"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">error</span>{aBoolean && "Eroare"}</span>)
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

    let closeAndRefresh=()=>{
        setActiveInvoice(null)
        fetchData()
    }

    return(
        <div className="app-data-container">  
                {invoicesData &&     
                <div className="bordered-container" style={{display: activeInvoice===null ? "" : "none"}}>                    
                    <div className="" style={{width:'100%'}}>
                        {!activeInvoice &&
                            <div> 
                                <Header title="Facturi" icon="receipt_long" searchAction={handleSearchSubmit} refreshData={refreshData} buttons={[]} intervalFunction={intervalFunction}/>    
                                <div style={{backgroundColor:"#f8f9fa", padding:'6px', paddingLeft:'20px'}}>
                                    {activeFilters.date!==null && <span className="badge bg-success">Data: {activeFilters.date}</span>}
                                    {activeFilters.search!==null && <span className="badge bg-success">Cautare: {activeFilters.search}</span>}
                                </div>
                                <div style={{maxHeight:'80vh'}}>   
                                        <table className="table" id="invoices-table">
                                            <thead>
                                                <tr>
                                                    <td>#</td>
                                                    <td>Client</td>
                                                    <td>Status</td>
                                                    <td>Numar factura<button className="table-order-button" onClick={()=>{setFilter({...queryFilter, order:'invoice_number', orderBy: queryFilter.orderBy==='asc' ? 'desc' : 'asc'})}}><span className="material-icons-outlined">{queryFilter.orderBy==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button></td> 
                                                    <td>Data</td>
                                                    <td>Total<button className="table-order-button" onClick={()=>{setFilter({...queryFilter, order:'total', orderBy: queryFilter.orderBy==='asc' ? 'desc' : 'asc'})}}><span className="material-icons-outlined">{queryFilter.orderBy==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button></td>
                                                    <td></td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoicesData.length>0 && invoicesData.map((element, index)=>(          
                                                    <tr key={index}>
                                                        <td>{((queryFilter.page*10)-10) +index+1}</td>
                                                        <td>{element.client_first_name} {element.client_last_name}</td>
                                                        <td>{setStatus(element.invoice_status, true)}</td>
                                                        <td>{element.invoice_number}</td>
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
                                    <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>
                                </div>                                
                            </div>  
                        } 
                    </div>
                </div>}
                {activeInvoice &&
                <div>
                    <button className='outline-mint-button' style={{marginBottom:'10px'}} onClick={()=>{closeAndRefresh()}}><span className="material-icons-outlined">arrow_back</span>Inchide</button>
                    <div className='overview-container bordered-container'>                                
                        <Invoice key={activeInvoice} invoiceID={activeInvoice} addSnackbar={addSnackbar} port={port}/>
                    </div>
                </div>}
        </div>
    )

}

export default InvoicesOverview