import {useState, useEffect } from "react";
import Employee from './Employee.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import PageNavigation from "../PageNavigation.jsx";
import Header from "../Header.jsx";
import SmallMenu from "../SmallMenu/SmallMenu.jsx";
import { useOutletContext } from "react-router-dom";

let Employees=(props)=>{
    let {addSnackbar, port, loadingSpinner } = useOutletContext();

    const defaultFilter={filter:"all", filterBy:"", page:1, step:10}
    const mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //local storage
    //if(!localStorage.getItem('activeEmployee')) localStorage.setItem('activeEmployee', "")

    let [employees, setEmployees] = useState(null)
    let [queryFilter, setFilter] = useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page, step:defaultFilter.step})
    let [activeEmployee, setActive] = useState("")
    let [addEmployeeWindow, showaddEmployeeWindow] = useState(false)
    let [editEmployeeWindow, setEditableEmployee] = useState(false)
    let [numberOfElements, setNOE] = useState(null)

    useEffect(()=>{
        fetchData()        
    },[queryFilter.page, queryFilter.step, queryFilter.filterBy])

    function fetchData(){
        fetch(`http://localhost:${port}/employees?filter=${queryFilter.filter}&filterBy=${queryFilter.filterBy}&page=${queryFilter.page-1}&step=${queryFilter.step}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setEmployees(data.data!==null ? data.data : [])
                setNOE(data.recordsNumber)
            }else if(data.status==="NO_DATA"){
                addSnackbar({text:"Nu sunt date"})
            }            
        }).catch(error=>{
            addSnackbar({icon:"report_problem",text:"Eroare"})
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

        fetch(`http://localhost:${port}/employee/${activeEmployee}`, {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' }
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text:"Angajat arhivat"})
                localStorage.setItem('activeEmployee', null)
                fetchData()
            }else{
                addSnackbar({icon:"report_problem",text:"Eroare"})
            }            
        }).catch(error=>{
            addSnackbar({icon:"report_problem",text:"Eroare"})
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

    /**
     * 
     * @param {*} month Integer, the 1-index month of the salary
     * @param {*} year Integer, year of the salary
     */
    function isSalaryUpToDate(month, year){
        let currentDate = new Date()
        if(year===currentDate.getFullYear() && parseInt(month) === parseInt(currentDate.getMonth()+1)){
            return(<div className="badge badge-green"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">payments</span>{mS[month-1]} {year}</div>)
        }else{
            return(<div className="badge badge-yellow"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">payments</span>{mS[month-1]} {year}</div>)
        }   
    }

    return(
        <div className="app-data-container">                                 
            <div>
                <div className="" style={{width:'100%'}}>
                    {!activeEmployee &&
                    <div className="bordered-container">                        
                        <Header title="Angajati" icon="group" display={employees!==null && employees.length>0 ? true : false} searchAction={handleSearchSubmit} refreshData={refreshData} buttons={[{title:"Angajat nou", action:()=>{showaddEmployeeWindow(true)}, icon:"add", name:"Angajat nou"}]}/>    
                        <div>
                            <table className="table" id="invoices-table">
                                <thead>
                                    <tr>
                                        <td>#</td>
                                        <td>Nume</td>
                                        <td>Titlu</td>
                                        <td>Activ</td>
                                        <td>Salariu net</td>
                                        <td>Data plata ultim salariu</td>
                                        <td>Ultim salariu</td>
                                        <td>Zile vacanta</td>
                                        <td></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees!==null && employees.length>0 && employees.map((element, index)=>(          
                                        <tr key={index}>
                                            <td>{index+1}</td>
                                            <td>{element.emp_first_name} {element.emp_last_name}</td>
                                            <td>{element.emp_job_name}</td> 
                                            <td>{element.emp_active ? <div className="badge badge-green"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">task_alt</span>Activ</div> : <div className="badge badge-gray"><span style={{marginRight:"3px", fontSize:'15px'}} className="material-icons-outlined">cancel</span>Inactiv</div>}</td>                                          
                                            <td>{element.emp_cur_salary_net}</td>
                                            <td>{element.lastSalaryDetails.pay_date}</td>
                                            <td>{isSalaryUpToDate(element.lastSalaryDetails.salary_month, element.lastSalaryDetails.salary_year)}</td>
                                            <td>{element.lastSalaryDetails.vacationDays}</td>
                                            <td className="table-actions-container">
                                                <SmallMenu expanded={true} buttons={[{title:"Deschide angajat", action:()=>{setActiveEmployee(element.id)}, name:"Deschide", icon:"file_open"}, {title:"Arhiveaza angajat", action:()=>{deleteEmployee(element.id)}, name:"Sterge", icon:"delete"}]}/>
                                            </td>
                                        </tr>    
                                    ))}
                                </tbody> 
                            </table>
                            {employees===null && loadingSpinner}  
                            {employees!==null && employees.length===0 && <h6 style={{textAlign:'center'}}>Nu exista date</h6>}
                        </div>
                        <PageNavigation key={numberOfElements} numberOfItems={numberOfElements} changePage={changePage}/>
                    </div>}
                    {activeEmployee&&
                        <div> 
                            <button className="outline-mint-button" style={{marginBottom:'15px'}} onClick={()=>{closeEmployee()}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>     
                            <Employee id={activeEmployee} refreshParent={fetchData} addSnackbar={addSnackbar} port={port}/>
                        </div>    
                    }
                </div>
            </div>            
            {addEmployeeWindow && 
                <div>
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Angajat nou</span>
                            <button type="button" className="action-close-window" onClick={()=>{closeAndRefresh()}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div className="p-3"><EmployeeForm addSnackbar={addSnackbar} refreshBackground={fetchData}/></div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Employees