import {useState, useEffect} from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import Employee from './Employee.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import PageNavigation from "../PageNavigation.jsx";

let Employees=(props)=>{

    const defaultFilter={filter:"all", filterBy:"", page:1, step:10}

    //local storage
    //if(!localStorage.getItem('activeEmployee')) localStorage.setItem('activeEmployee', "")

    let [employees, setEmployees] = useState([])
    let [queryFilter, setFilter] = useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page, step:defaultFilter.step})
    let [activeEmployee, setActive] = useState("")
    let [alertUser, setAlertUser] = useState(null)
    let [addEmployeeWindow, showaddEmployeeWindow] = useState(false)
    let [editEmployeeWindow, setEditableEmployee] = useState(false)
    let [numberOfElements, setNOE] = useState(null)

    useEffect(()=>{
        fetchData()        
    },[queryFilter.page, queryFilter.step])

    function fetchData(){
        fetch(`http://localhost:3000/employees?filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page-1}&step=${queryFilter.step}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setEmployees(data.data)
                setNOE(data.recordsNumber)
            }else if(data.status==="NO_DATA"){
                setAlertUser("Nu sunt date")
            }            
        }).catch(error=>{
            setAlertUser("Something went wrong")
        })
    }

    let resetSearch=()=>{
        document.getElementById("searchinput").value=""
        setFilter({...queryFilter, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    let setActiveEmployee=(id)=>{
        setActive(id)
        //localStorage.setItem('activeEmployee', id)
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.searchinput.value
        if(searchTerm.length===0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...queryFilter, filter:"search", filterBy:searchTermStringified})
    }

    function deleteEmployee(){

        if(window.confirm("Arhivati angajat?") === false) return false

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

    let closeEmployee=()=>{
        //close the window
        setActive(null)
        //refetch
        fetchData()
    }
    
    let changePage=(pageNumber, step)=>{
        setFilter({...queryFilter, page:pageNumber, step:step})
    }

    return(
        <div className="app-data-container">
            {employees&&                       
                <div className="bordered-container p-3">
                    <div className="" style={{width:'100%'}}>
                        {!activeEmployee &&
                        <div>
                            <div style={{marginBottom:'25px', display:'flex', justifyContent:'flex-start', alignItems:'center'}}>
                                <span class="material-icons-outlined">group</span>
                                <span style={{fontSize:'18px', fontWeight:'600'}}>Employees</span>
                                <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                                    <div className="search-form-container"> 
                                        <span className="material-icons-outlined" style={{width:'24px', color:'lightgray', margin:'auto'}}>search</span>                                                                  
                                        <input className="form-control shadow-none" id="searchinput" placeholder="Cauta.."></input>
                                        <div className="search-header-buttons-container">                               
                                            <button type="button" className='no-background-button' title="Angajat nou" onClick={()=>{showaddEmployeeWindow(true)}}><div className="inner-button-content"><span className="material-icons-outlined" >add</span></div></button>
                                            <button type="button" className='btn-danger' title="Reincarca date"  onClick={()=>{resetSearch()}}><div className="inner-button-content"><span className="material-icons-outlined" >refresh</span></div></button>
                                        </div>                                                     
                                    </div>
                                </form>
                            </div>  
                            <div style={{overflowY:'scroll', maxHeight:'80vh'}}>
                                <table className="table" id="invoices-table">
                                    <thead>
                                        <tr>
                                            <td>#</td>
                                            <td>Nume</td>
                                            <td>Titlu</td>
                                            <td>Activ</td>
                                            <td></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.length>0 && employees.map((element, index)=>(          
                                            <tr>
                                                <td>{index+1}</td>
                                                <td><b>{element.emp_first_name} {element.emp_last_name}</b></td>
                                                <td>{element.emp_job_name}</td> 
                                                <td>{element.emp_active ? <span class="material-icons-outlined">task_alt</span> : <span class="material-icons-outlined">cancel</span>}</td>                                          
                                                <td className="table-actions-container">
                                                    <button title="Arhiveaza angajat" onClick={()=>{deleteEmployee(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
                                                    <button title="Deschide angajat" onClick={()=>{setActiveEmployee(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">open_in_new</span></div></button>
                                                </td>
                                            </tr>    
                                        ))}
                                    </tbody>  
                                </table>
                            </div>
                            <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>
                        </div>}
                        {activeEmployee&&
                            <div className='overview-container bordered-container' style={{maxHeight:'80vh', overflowY:'scroll'}}> 
                                <button style={{border:'none', borderRadius:'6px', display:'flex', alignItems:'center', margin:'10px'}} onClick={()=>{closeEmployee()}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>     
                                <Employee id={activeEmployee} refreshParent={fetchData}/>
                            </div>    
                        }
                    </div>
                </div>
            }
            {addEmployeeWindow && 
                <div>
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Angajat nou</span>
                            <button type="button" className="action-close-window" onClick={()=>{closeAndRefresh()}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div className="p-3"><EmployeeForm/></div>
                    </div>
                </div>
            }
            <Snackbar text={alertUser} closeSnack={()=>{setAlertUser(null)}}/>  
        </div>
    )
}

export default Employees