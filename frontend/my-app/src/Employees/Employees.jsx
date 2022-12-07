import {useState, useEffect} from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'
import Employee from './Employee.jsx'
import EmployeeForm from './EmployeeForm.jsx'

let Employees=(props)=>{

    const defaultFilter={filter:"all", filterBy:"", page:1}

    //local storage
    if(!localStorage.getItem('activeEmployee')) localStorage.setItem('activeEmployee', "")

    let [employees, setEmployees] = useState([])
    let [query, setFilter] = useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    let [activeEmployee, setActive] = useState(localStorage.getItem('activeEmployee').length>0 ? localStorage.getItem('activeEmployee') : "")
    let [alertUser, setAlertUser] = useState(null)
    let [numberOfElements, setNumberOfElements] = useState(3)
    let [addEmployeeWindow, showaddEmployeeWindow] = useState(false)
    let [editEmployeeWindow, setEditableEmployee] = useState(false)

    useEffect(()=>{
        fetchData()        
    },[query])

    function fetchData(){
        fetch(`http://localhost:3000/employees?filter=${query.filter}&filterBy=${query.filterBy}&page=${query.page}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setEmployees(data.data)
                if(localStorage.getItem('activeEmployee').length===0) setActiveEmployee(data.data[0].id)
            }else if(data.status==="NO_DATA"){
                setAlertUser("Nu sunt date")
            }            
        }).catch(error=>{
            setAlertUser("Something went wrong")
        })
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...query, filter:"search", filterBy:searchTermStringified})
    }

    let resetSearch=()=>{
        document.getElementById("filterData").value=""
        setFilter({...query, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    let changePage=(pageNumber)=>{
        setFilter({...query, page:pageNumber})
    }

    let setActiveEmployee=(id)=>{
        setActive(id)
        localStorage.setItem('activeEmployee', id)
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length==0) return false
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
            {                        
                <div className="clients-overview-container">
                    <div className="vertical-list-container">     
                        <div class="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                            <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                                <div className="search-form-container">
                                    <button class="btn btn-success btn-sm no-shadow add-new-button" onClick={()=>{showaddEmployeeWindow(true)}}><span class="material-icons-outlined">add</span></button>
                                    <div className="search-input-container">
                                        <input type="search" className="search-input form-control shadow-none" placeholder="Cauta.." id="filterData"></input>
                                        <button type="button" className="search-reset-button" onClick={()=>{resetSearch()}}><span class="material-icons-outlined">refresh</span></button>
                                    </div>                 
                                </div>
                            </form>
                        </div> 
                        <div class="list-group list-group-flush border-bottom scrollarea" style={{width: '300px'}}> 
                            {employees.length>0 && employees.map((element, index)=>(
                                <a href="#" class={parseInt(activeEmployee)===parseInt(element.id) ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>{setActiveEmployee(element.id)}} aria-current="true">
                                    <div class="d-flex w-100 align-items-center justify-content-between">
                                        <strong class="mb-1">{element.emp_first_name} {element.emp_last_name}</strong>                                            
                                    </div>
                                    <div class="col-10 mb-1 small">
                                        <small>{element.emp_job_name}</small>
                                    </div>
                                </a> 
                            ))}
                        </div> 
                    </div>         
                    <div className="overview-container" key={activeEmployee}>
                        <div style={{display:'flex', flexDirection:'row'}}>
                            <div style={{width:'70%', display:'inherit', alignItems:'center'}} className="p-3"><span></span></div>
                            <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0 p-3" style={{width:'30%'}}>                          
                                <button class="btn btn-secondary btn-sm no-shadow navigation-button" onClick={()=>{setEditableEmployee(true)}}><div class="inner-button-content"><span class="material-icons-outlined">edit</span>Editare</div></button>
                                <button class="btn btn-danger btn-sm no-shadow navigation-button" onClick={()=>{deleteEmployee()}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span>Stergere</div></button>
                            </div>
                        </div>
                        <Employee id={activeEmployee}/>
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
            {editEmployeeWindow && 
                <div>
                    <div className="blur-overlap"></div>     
                    <button type="button" className="action-close-window" onClick={()=>{closeAndRefresh()}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                    <div className="overlapping-component-inner">
                        <EmployeeForm employeeID={activeEmployee}/>
                    </div>
                </div>
            }
            <Snackbar text={alertUser} closeSnack={()=>{setAlertUser(null)}}/>  
        </div>
    )
}

export default Employees