import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import PageNavigation from '../PageNavigation.jsx'
import Employee from './Employee.jsx'

let Employees=(props)=>{

    const defaultFilter={filter:"all", filterBy:"", page:1}

    let [employees, setEmployees] = React.useState([])
    let [query, setFilter] = React.useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    let [activeEmployee, setActive] = React.useState(null)
    let [alertUser, setAlertUser] = React.useState(null)

    React.useEffect(()=>{
        fetchData()        
    },[query])

    function fetchData(){
        console.log("trigger")
        fetch(`./employees?filter=${query.filter}&filterBy=${query.filterBy}&page=${query.page}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setEmployees(data.data)
                setActive(data.data[0].id)
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

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...query, filter:"search", filterBy:searchTermStringified})
    }

    return(
        <div className="app-data-container">
            <header class="p-3">
                <div class="container nav-head-container">
                    <div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                        <span class="material-icons-outlined add-new-nav-button" style={{fontSize:'35px', marginRight:'5px'}}>group</span>
                        <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                            <button class="btn btn-danger btn-sm no-shadow navigation-button" onClick={()=>{}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span>Stergere</div></button>
                        </div>
                        <form onSubmit={handleSearchSubmit} className="search-form" id="search-form" name="search-form">
                            <div className="search-form-container">
                                <div className="search-input-container">
                                    <input type="searcg" className="search-input form-control shadow-none" placeholder="Cauta.." id="filterData"></input>
                                    <button type="button" className="search-reset-button" onClick={()=>{resetSearch()}}><span class="material-icons-outlined">close</span></button>
                                </div>                 
                            </div>
                        </form>
                    </div>
                </div>
            </header>   

            {employees ?   
                employees.length>0 ?        
                <div style={{display:'flex', flexDirection:'row'}}>  
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-white" style={{width: '200px'}}> 
                            {employees.length>0 && employees.map((element, index)=>(
                                <div>            
                                    <div class="list-group list-group-flush border-bottom scrollarea">
                                        <a href="#" class={parseInt(activeEmployee)===parseInt(element.id) ? "list-group-item list-group-item-action py-3 lh-sm active" : "list-group-item list-group-item-action py-3 lh-sm"} onClick={()=>{setActive(element.id)}} aria-current="true">
                                            <div class="d-flex w-100 align-items-center justify-content-between">
                                                <strong class="mb-1">{element.emp_first_name} {element.emp_last_name}</strong>                                            
                                            </div>
                                            <div class="col-10 mb-1 small">
                                                <small>{element.emp_job_name}</small>
                                            </div>
                                        </a>                    
                                    </div>
                                </div>
                            ))}                            
                        </div>
                        <PageNavigation numberOfItems={10} changePage={changePage}/> 
                    </div>                 
                    <div className="overview-container" key={activeEmployee}>
                        <Employee id={activeEmployee}/>
                    </div>
                </div> : <h4 style={{textAlign:"center"}}>Nu exista date</h4> : <h4 style={{textAlign:"center"}}>Nu exista date</h4>
            }
            
            <Snackbar text={alertUser} closeSnack={()=>{setAlertUser(null)}}/>  
        </div>
    )
}

export default Employees