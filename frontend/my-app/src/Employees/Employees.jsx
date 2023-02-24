import {useState, useEffect} from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import Employee from './Employee.jsx'
import EmployeeForm from './EmployeeForm.jsx'

let Employees=(props)=>{

    const defaultFilter={filter:"all", filterBy:"", page:1}

    //local storage
    //if(!localStorage.getItem('activeEmployee')) localStorage.setItem('activeEmployee', "")

    let [employees, setEmployees] = useState([])
    let [query, setFilter] = useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    let [activeEmployee, setActive] = useState("")
    let [alertUser, setAlertUser] = useState(null)
    let [addEmployeeWindow, showaddEmployeeWindow] = useState(false)
    let [editEmployeeWindow, setEditableEmployee] = useState(false)

    useEffect(()=>{
        fetchData()        
    },[query])

    function fetchData(){
        fetch(`http://localhost:3000/employees?filter=${query.filter}&filterBy=${query.filterBy}&page=${query.page}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setEmployees(data.data)
            }else if(data.status==="NO_DATA"){
                setAlertUser("Nu sunt date")
            }            
        }).catch(error=>{
            setAlertUser("Something went wrong")
        })
    }

    let resetSearch=()=>{
        document.getElementById("filterData").value=""
        setFilter({...query, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    let setActiveEmployee=(id)=>{
        setActive(id)
        //localStorage.setItem('activeEmployee', id)
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length===0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...query, filter:"search", filterBy:searchTermStringified})
    }

    function deleteEmployee(){
        fetch(`http://localhost:3000/employee/${activeEmployee}`, {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' }
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setAlertUser("Angajat arhivat")
                localStorage.setItem('activeEmployee', null)
                fetchData()
            }else{
                setAlertUser("Eroare")
            }            
        }).catch(error=>{
            setAlertUser("Eroare")
        }) 
    }

    let closeAndRefresh=()=>{
        if(addEmployeeWindow){
            showaddEmployeeWindow(false)
        }else if(editEmployeeWindow){
            setEditableEmployee(false)
        }
        fetchData()
    }

    return(
        <div className="app-data-container">
            {employees&&                       
                <div className="clients-overview-container">
                    <div className="" style={{width:'100%'}}>
                        {!activeEmployee &&
                        <div>
                            <div className="bordered-container" style={{marginBottom:'25px'}}>
                                <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                                    <div className="search-form-container"> 
                                        <span className="material-icons-outlined" style={{width:'24px', color:'lightgray', margin:'auto'}}>search</span>                                                                  
                                        <input className="form-control shadow-none" id="searchinput" placeholder="Cauta.."></input>
                                        <div className="search-header-buttons-container">                               
                                            <button type="button" className='btn-light' title="Factura noua" onClick={()=>{showaddEmployeeWindow(true)}}><div className="inner-button-content"><span className="material-icons-outlined" >add</span></div></button>
                                            <button type="button" className='btn-danger' title="Reincarca date"  onClick={()=>{resetSearch()}}><div className="inner-button-content"><span className="material-icons-outlined" >refresh</span></div></button>
                                        </div>                                                     
                                    </div>
                                </form>
                            </div>  
                            <div style={{overflowY:'scroll', maxHeight:'80vh'}} className='bordered-container'>
                                <table className="table" id="invoices-table">
                                    <thead>
                                        <tr>
                                            <td>Nume</td>
                                            <td>Titlu</td>
                                            <td>Activ</td>
                                            <td></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.length>0 && employees.map((element, index)=>(          
                                            <tr>
                                                <td>{element.emp_first_name} {element.emp_last_name}</td>
                                                <td>{element.emp_job_name}</td> 
                                                <td>{element.emp_active}</td>                                          
                                                <td className="table-actions-container">
                                                    <button title="Arhiveaza factura" onClick={()=>{deleteEmployee(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
                                                    <button title="Deschide factura" onClick={()=>{setActiveEmployee(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">open_in_new</span></div></button>                                                </td>
                                            </tr>    
                                        ))}
                                    </tbody>  
                                </table>
                            </div>
                        </div>}
                        {activeEmployee&&
                            <div className='overview-container bordered-container' style={{maxHeight:'80vh', overflowY:'scroll'}}> 
                                <button style={{border:'none', borderRadius:'6px', display:'flex', alignItems:'center', margin:'10px'}} onClick={()=>{setActive(null)}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>     
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} className='p-3'>
                                    <div className="nav col-12 col-lg-auto mb-2 justify-content-end header-buttons-container">                               
                                        <button  className='btn-light' title="Factureaza client" ><div className="inner-button-content"><span className="material-icons-outlined">library_add</span></div></button>
                                        <button className='btn-danger' title="Arhiveaza client" ><div className="inner-button-content"><span className="material-icons-outlined">delete</span></div></button>
                                    </div>
                                </div>
                                <Employee id={activeEmployee}/>
                            </div>    
                        }
                    </div>
                </div>
            }
            {addEmployeeWindow && 
                <div>
                    <div className="blur-overlap"></div>     
                    <button type="button" className="action-close-window" onClick={()=>{closeAndRefresh()}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                    <div className="overlapping-component-inner">
                        <EmployeeForm/>
                    </div>
                </div>
            }
            <Snackbar text={alertUser} closeSnack={()=>{setAlertUser(null)}}/>  
        </div>
    )
}

export default Employees