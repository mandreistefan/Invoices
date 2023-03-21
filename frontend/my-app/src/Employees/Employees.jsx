import {useState, useEffect} from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import Employee from './Employee.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import PageNavigation from "../PageNavigation.jsx";
import Header from "../Header.jsx";
import SmallMenu from "../SmallMenu/SmallMenu.jsx";

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
    },[queryFilter.page, queryFilter.step, queryFilter.filterBy])

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

    function handleSearchSubmit(searchTermStringified){
        if(searchTermStringified===""){
            setFilter({...queryFilter, filter:"all", filterBy:defaultFilter.filterBy})
        }else{
            setFilter({...queryFilter, filter:"search", filterBy:searchTermStringified})
        }    
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

    let refreshData=()=>{        
        setFilter({...queryFilter, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    return(
        <div className="app-data-container">
            {employees&&                       
                <div>
                    <div className="" style={{width:'100%'}}>
                        {!activeEmployee &&
                        <div className="bordered-container">                        
                            <Header title="Angajati" icon="group" searchAction={handleSearchSubmit} refreshData={refreshData} buttons={[{title:"Angajat nou", action:()=>{showaddEmployeeWindow(true)}, icon:"add", name:"Angajat nou"}]}/>    
                            <div>
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
                                            <tr key={index}>
                                                <td>{index+1}</td>
                                                <td>{element.emp_first_name} {element.emp_last_name}</td>
                                                <td>{element.emp_job_name}</td> 
                                                <td>{element.emp_active ? <div style={{display:"flex", alignItems:'center'}}><span className="material-icons-outlined text-success">task_alt</span><span className="text-success"><strong>Activ</strong></span></div> : <div><span class="material-icons-outlined text-danger">cancel</span><span className="text-danger"><strong>Inactiv</strong></span></div>}</td>                                          
                                                <td className="table-actions-container">
                                                    <SmallMenu buttons={[{title:"Deschide angajat", action:()=>{setActiveEmployee(element.id)}, name:"Deschide", icon:"file_open"}, {title:"Arhiveaza angajat", action:()=>{deleteEmployee(element.id)}, name:"Sterge", icon:"delete"}]}/>
                                                </td>
                                            </tr>    
                                        ))}
                                    </tbody>  
                                </table>
                            </div>
                            <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>
                        </div>}
                        {activeEmployee&&
                            <div> 
                                <button className="outline-mint-button" style={{marginBottom:'15px'}} onClick={()=>{closeEmployee()}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>     
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