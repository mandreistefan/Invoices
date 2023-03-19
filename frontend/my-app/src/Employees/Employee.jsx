import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import EmployeeForm from "./EmployeeForm.jsx";
import Header from "../Header.jsx";

//the current date
const currentDate = new Date()
//component data
let dateString = {
    day: parseInt(currentDate.getDate())<10 ? `0`+currentDate.getDate() : currentDate.getDate(),
    month: currentDate.getMonth()+1,
    year: currentDate.getFullYear()
}

export default class Employee extends React.Component{

    constructor(props){
        super(props)
        this.state={
            id:props.id,
            first_name: "",
            last_name: "",
            adress: "",
            identification_number: "",
            registration_date:"2022-12-12",
            active:false,
            job_name:"",
            salary_gross:0,
            salary_net:0,
            salaries:[],
            salariesFilter:[],
            vacationDays:[],
            salaryWindow: false,
            newSalaryMonth:1,
            salaryYear:2023,
            alertUser:null, 
            vacationDaysWindow:false,
            vacationDaysRequested:[{date: `${dateString.year}-${dateString.month}-${dateString.day}`, type:"vacation", disabled:false}], 
            availableVacationDays:0,
            windows:[{name:"Angajat", active: true}, {name:"Salarii", active:false}, {name:"Zile libere", active:false}],
            emp_notes: "" ,
            taxesPercentages: [
                {name: "CAS", key:"CAS", description:"Asigurare sociale", value: 21.5},
                {name: "CASS", key:"CASS", description: "Asigurari sociale sanatate", value: 10},
                {name: "VENIT", key:"TAX", description: "Impozit venit", value: 10},
                {name: "CAM", key:"CAM", description:"Contributie asiguratorie munca", value: 2.25}
            ]          
        }
        this.handleMonthChange = this.handleMonthChange.bind(this);

    }

    componentDidMount(){
        if(this.state.id){
            this.fetchData()
        }
    }


    fetchData=()=>{
        fetch(`http://localhost:3000/employee/${this.state.id}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({
                    first_name:data.data.info[0].emp_first_name, 
                    last_name:data.data.info[0].emp_last_name,
                    adress:data.data.info[0].emp_adress,
                    identification_number:data.data.info[0].emp_ident_no,
                    registration_date:this.normalDate(data.data.info[0].emp_date, true),
                    active:data.data.info[0].emp_active ? true : false,
                    job_name:data.data.info[0].emp_job_name,
                    salary_gross:data.data.info[0].emp_cur_salary_gross,
                    salaries:this.convertSalaries(data.data.salaries),
                    vacationDays:this.convertVacations(data.data.vacationDays),
                    emp_notes: data.data.info[0].emp_notes ? data.data.info[0].emp_notes : "",
                    availableVacationDays: data.data.info[0].emp_vacation_days                        
                }) 
                if(data.data.info[0].emp_tax===0){
                    let taxesCopy = [...this.state.taxesPercentages]
                    taxesCopy[2].value=0;
                    this.setState({taxesPercentages: taxesCopy})                    
                }                    
                if(data.data.info[0].emp_tax_cass===0){
                    let taxesCopy = [...this.state.taxesPercentages]
                    taxesCopy[2].value=0;
                    this.setState({taxesPercentages: taxesCopy})                    
                }
                this.calculateNet() 

            }else{
                this.setState({alertUser:"Eroare"})
            }
        }).catch(error=>{
            console.log(error)
            this.setState({alertUser:"Eroare"})
        })
    }

    convertSalaries=(salaries)=>{

        let readableMonth=(monthInteger)=>{
            let months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
            return months[monthInteger]
        }

        let anArray=[]
        if(salaries!=null){
            salaries.forEach(element=>{
                anArray.push({
                    gross:element.sum_gross, 
                    net:element.sum_net, 
                    taxes:{cas:element.tax_cas, 
                        cass:element.tax_cass, 
                        income:element.tax_income, 
                        cm:element.tax_cm}, 
                    month:readableMonth(element.salary_month-1),
                    year:element.salary_year,
                    date:element.paid_on
                })
            })
        }

        //initially, the filter contains everything
        let initialSalariesFilter = []
        for(let i=0;i<salaries.length;i++){
            initialSalariesFilter.push(i) 
        }
        this.setState({salariesFilter:initialSalariesFilter})

        return anArray
    }

    normalDate=((date,bool)=>{
        let months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
        let dateObject=new Date(date)
        return bool ? `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}` : `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()}`
    })

    convertVacations=(vacationsObject)=>{
        let anArray = []
        if(vacationsObject!=null){
            vacationsObject.forEach(element=>{
                anArray.push({date:this.normalDate(element.date, false), type:element.type, registerDate:this.normalDate(element.registerDate, false)})
            })
        }
        return anArray
    }

    handleSubmit=(event)=>{
        event.preventDefault();
        let taxes = []
        this.state.taxesPercentages.forEach(element=>{
            taxes.push(element.value)
        })
        fetch(`http://localhost:3000/employee_salary`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({paid_to:this.state.id, salary_month:this.state.newSalaryMonth, salary_year:this.state.salaryYear, bank_ref:document.getElementById("bankref").value, taxes})
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({alertUser:"Salariu inregistrat"})
                this.updateEmployeeSalaries()
            }else{
                if(data.data==="SALARY_EXISTS") this.setState({alertUser:"Exista o inregistrare pentru luna respectiva"})
            }
        }).catch(error=>{
            console.log(error)
        })
    }

    handleVacationForm=(event)=>{
        event.preventDefault()
        let allGood = true
        //check that dates do not repeat
        this.state.vacationDaysRequested.forEach((element, index)=>{
            this.state.vacationDaysRequested.forEach((element2, index2)=>{
                if(index!=index2){
                    if(element.date===element2.date){  
                        allGood=false
                        return
                    }
                }                
            })
        })
        if(allGood){
            fetch('http://localhost:3000/employee_vacation', {
                method:"POST",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({
                    employeeID: this.state.id,
                    dates: this.state.vacationDaysRequested
                })
            }).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    this.setState({alertUser:"Cerere inregistrata"})
                    let vacationsCopy = [...this.state.vacationDaysRequested]
                    vacationsCopy.forEach(element=>{
                        element.disabled=true
                    })
                    this.setState({vacationDaysRequested: vacationsCopy})
                    document.getElementById("new-vacation-day-button").disabled=true
                    document.getElementById("submit-vacation-day-button").disabled=true
                    this.updateVacationDays()
                }else{
                    this.setState({alertUser:"Ceva nu a functionat"})
                }                
            })
        }else{
            this.setState({alertUser:"O data este repetata"})
        }        
    }

    handleMonthChange(event) {
        this.setState({newSalaryMonth: event.target.value});
    }

    handleYearChange(event) {
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        if(validNumber.test(event.target.value)) this.setState({newSalaryMonth: event.target.value});
    }

    //add a new form input
    newVacationDay=()=>{
        let currentVacationDaysArray=this.state.vacationDaysRequested
        currentVacationDaysArray.push({date: `${dateString.year}-${dateString.month}-${dateString.day}`, type:"vacation"})
        this.setState({vacationDaysRequested: currentVacationDaysArray})
    }

    //a date has been changed
    handleVacationDaysInput=(event)=>{
        let inputType = event.target.id.split("-")[0]
        let theID = event.target.id.split("-")[1]
        let curVac = this.state.vacationDaysRequested
        //handle a date
        if(inputType==="date"){            
            //checks if the day is saturday or sunday
            let theDate = new Date(event.target.value)
            if(theDate.getDay()===0 || theDate.getDay()===6){
                this.setState({alertUser:"Ziua selectata este zi de weekend"})
                return false
            }
            //date change
            if(curVac[theID]){
                curVac[theID].date=event.target.value
            }else{
                curVac.push({date:event.target.value, type:"vacation"})
            }           
        }else if(inputType==="type"){
            //handle a vacation type
            if(curVac[theID]){
                curVac[theID].type=event.target.value
            }else{
                curVac.push({date:curVac[theID].date, type:event.target.value})
            }               
        }else{
            if(curVac.length===1) return false
            curVac.splice(theID, 1)
        }
        this.setState({vacationDaysRequested: curVac})
    }

    //month starts with 0
    parseDate=(date)=>{
        let theDate = date.split('/')    
        return `${theDate[0]}/${parseInt(theDate[1])}/${theDate[2]}`
    }

    updateEmployeeSalaries=()=>{
        fetch(`http://localhost:3000/employee_salary?filter=paid_to&filterBy=${this.state.id}`)
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({salaries: this.convertSalaries(data.data)})
            }else{
                this.setState({alertUser:"Ceva nu a functionat"})
            }                
        })
    }

    calculateNet=()=>{
        let onePercentOfGross = parseFloat(this.state.salary_gross/100)
        this.setState({salary_net: parseFloat(this.state.salary_gross-(onePercentOfGross*this.state.taxesPercentages[0].value + onePercentOfGross*this.state.taxesPercentages[1].value + onePercentOfGross*this.state.taxesPercentages[2].value))})        
    }

    reacalculateTaxesWithThis=(event)=>{
        let shallowCopy = [...this.state.taxesPercentages]        
        shallowCopy.forEach(element=>{
            if(element.key===event.target.name){
                element.value=event.target.value
                return
            }
        })
        this.calculateNet()
        this.setState({taxesPercentages:shallowCopy})
    }

    updateVacationDays=()=>{        
        fetch(`http://localhost:3000/employee_vacation/${this.state.id}`
        ).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({vacationDays: this.convertVacations(data.data)})
            }else{
                this.setState({alertUser:"Ceva nu a functionat"})
            }                
        })
    }

    switchTabs=(index)=>{
        let shallowCopy = [...this.state.windows]
        shallowCopy.forEach(element=>{
            element.active=false
        })
        shallowCopy[index].active=true
        this.setState({windows:shallowCopy})
    }

    intervalSalariesFunction=(interval)=>{
        let filtered = []
        this.state.salaries.forEach((element, index)=>{
            if((Date.parse(element.date) >= Date.parse(interval.start)) && (Date.parse(element.date) <= Date.parse(interval.end))) filtered.push(index)
        })
        this.setState({salariesFilter:filtered})
    }

     render(){
        return(
            <div className="bordered-container">
                <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{backgroundColor:'white', width:'100%', padding:'20px', borderTopRightRadius:'16px', borderTopLeftRadius:'16px', borderBottom:'1px solid lightgray'}}>
                        <h4>{this.state.first_name} {this.state.last_name}</h4>
                        <h5 id="employee-title" style={{fontWeight:'300'}}>{this.state.job_name}</h5> 
                        <small><b>Salariu de baza:</b> {this.state.salary_gross} RON</small><br/>
                        <small><b>Data angajarii:</b> {this.state.registration_date}</small><br/>
                        <small><b>Zile concediu:</b> {this.state.availableVacationDays}</small>
                    </div>     
                </div>
                <div className="tabs">
                    {this.state.windows.map((element, index)=>(
                        <button onClick={()=>{this.switchTabs(index)}} className={element.active===true ? "tab active" : "tab"}>{element.name}</button>
                    ))}
                </div>
                <div style={{backgroundColor:'white', borderBottomLeftRadius:'16px', borderBottomRightRadius:'16px'}}>
                    <div style={{display: this.state.windows[0].active===true ? 'block' : 'none'}}>
                        <div style={{padding:'20px', borderBottom:'1px solid lightgray'}}>
                            <h4>Date angajat</h4>
                        </div>
                        <div style={{padding:'20px'}}>
                            <EmployeeForm refreshParent={this.fetchData} employeeID={this.props.id}/>
                        </div>
                    </div>
                    <div style={{display: this.state.windows[1].active===true ? 'block' : 'none'}}> 
                        <Header title="Salarii" icon="account_circle" hasSearch="false" refreshData={this.updateEmployeeSalaries} buttons={[{title:"Salariu", action:()=>{this.setState({salaryWindow:true})}, icon:"add", name:"Salariu nou"}]} intervalFunction={this.intervalSalariesFunction}/>    
                        <table className='table' id="salaries-table">
                            <thead>
                                <tr>
                                    <td>Luna</td>
                                    <td>An</td>
                                    <td>Data</td>
                                    <td>Brut</td>
                                    <td>CAS</td>
                                    <td>CASS</td>
                                    <td>Venit</td>
                                    <td>CM</td>
                                    <td>Net</td>
                                </tr>    
                            </thead>
                            <tbody>
                                {this.state.salariesFilter!==[] && 
                                this.state.salariesFilter.map((element, index)=>(
                                    <tr key={index}>
                                        <td><b>{this.state.salaries[element].month}</b></td>
                                        <td><b>{this.state.salaries[element].year}</b></td>
                                        <td>{this.state.salaries[element].date}</td>
                                        <td><b>{this.state.salaries[element].gross}</b></td>
                                        <td>{this.state.salaries[element].taxes.cas}</td>
                                        <td>{this.state.salaries[element].taxes.cass}</td>
                                        <td>{this.state.salaries[element].taxes.income}</td>
                                        <td>{this.state.salaries[element].taxes.cm}</td>
                                        <td><b>{this.state.salaries[element].net}</b></td>
                                    </tr>
                                ))}
                            </tbody>
                            {this.state.salariesFilter.length===0 && <span>Nu exista date</span>}
                        </table>
                    </div>                    
                    <div style={{display: this.state.windows[2].active===true ? 'block' : 'none'}}>                        
                        <div style={{width:'100%'}} >
                            <Header title="Zile libere" icon="account_circle" hasSearch="false" refreshData={this.updateVacationDays} buttons={[{title:"Cerere noua", action:()=>{this.setState({vacationDaysWindow:true})}, icon:"add", name:"Cerere noua"}]}/>    
                            <table className='table' id="vacation-days-table">
                                <thead>
                                    <tr>
                                        <td>Data</td>
                                        <td>Data inregistrare</td>
                                        <td>Tip</td>
                                        <td>Status</td>
                                    </tr>    
                                </thead>
                                <tbody>
                                    {this.state.vacationDays.length>0 ? this.state.vacationDays.map((element,index)=>(
                                        <tr key={index}>
                                            <td><b>{this.parseDate(element.date)}</b></td>
                                            <td>{this.parseDate(element.registerDate)}</td>
                                            <td>{element.type}</td>
                                            <td><b>{element.status}</b></td>            
                                        </tr>
                                    )):"Nu exista inregistrari"}
                                </tbody>
                            </table>
                        </div>
                    </div>  
                </div>                          
                {this.state.salaryWindow===true &&
                <div> 
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Inregistrare salariu</span>
                            <button type="button" className="action-close-window" onClick={()=>{this.setState({salaryWindow: false})}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div className="p-3" style={{display:'flex', flexDirection:'row'}}>
                            <div className="col-md-7 col-lg-6 p-2">
                                <h6>Informatii angajat</h6>
                                <form onSubmit={this.handleSubmit}>
                                    <div class="row g-2">
                                        <div class="col-md">
                                            <div class="form-floating mb-3">
                                                <input type="text" placeholder="Nume" className="form-control" id="firstName" value={this.state.first_name} disabled={true} required=""></input>
                                                <label for="firstName" className="form-label">Nume</label>
                                            </div>
                                        </div>
                                        <div class="col-md">
                                            <div class="form-floating mb-3">
                                                <input type="text" className="form-control" id="lastName" placeholder="Prenume" value={this.state.last_name} disabled={true} required=""></input>
                                                <label for="lastName" className="form-label">Prenume</label>
                                            </div>
                                        </div>
                                    </div>      
                                    <div className="row g-2">
                                        <div className="col-md">
                                            <div class="form-floating mb-3">                                                    
                                                <select className="form-select" placeholder="Luna" id="paid_for" required="" onChange={this.handleMonthChange}>
                                                    <option value="1">Ianuarie</option> 
                                                    <option value="2">Februarie</option>
                                                    <option value="3">Martie</option>
                                                    <option value="4">Aprilie</option>
                                                    <option value="5">Mai</option>
                                                    <option value="6">Iunie</option>   
                                                    <option value="7">Iulie</option> 
                                                    <option value="8">August</option>
                                                    <option value="9">Septembrie</option>
                                                    <option value="10">Octombrie</option>
                                                    <option value="11">Noiembrie</option>
                                                    <option value="12">Decembrie</option> 
                                                </select>
                                                <label for="paid_for" className="form-label">Luna</label>
                                            </div>
                                        </div>
                                        <div className="col-md">
                                            <div class="form-floating mb-3">                                                     
                                                <input type="text" className="form-control" id="paid_for_year" placeholder="An" value={this.state.salaryYear} onChange={this.handleYearChange}></input>
                                                <label for="paid_for_year" className="form-label">Anul</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div class="form-floating mb-3">                                                 
                                            <input type="text" className="form-control" id="bankref" placeholder="ID bancar"></input>
                                            <label for="bankref" className="form-label">ID tranzactie bancara</label>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div class="form-floating mb-3">                                                 
                                            <input type="text" disabled={true} value={`${this.state.salary_gross} RON`} className="form-control" id="salariu_brut" placeholder="Salariu de baza"></input>
                                            <label for="bankref" className="form-label">Salariu de baza</label>
                                        </div>
                                    </div>
                                    <button className="btn btn-light btn-sm mt-3" type="submit"><span class="action-button-label"><span class="material-icons-outlined">check</span>Salvare</span></button>
                                </form>
                            </div>
                            <div className="col-md-5 col-lg-6 order-md-last p-2">
                                <ul className="list-group mb-3">
                                    {
                                        this.state.taxesPercentages.map(element=>(
                                            <li className="list-group-item d-flex justify-content-between lh-sm">
                                            <div>
                                                <h6 className="my-0">{element.key}</h6>
                                                <small className="text-muted">{element.description}</small><br/>
                                                <small className="text-muted"><b>{parseFloat(this.state.salary_gross/100)*parseFloat(element.value)} RON</b></small>
                                            </div>
                                            <div>
                                                <br/>
                                                <div class="input-group">                                                    
                                                    <input type="text" className="form-control shadow-none" style={{width:'50px', padding:'2px'}} value={element.value} onChange={this.reacalculateTaxesWithThis} name={element.key}></input>
                                                    <span class="input-group-text" style={{padding:'2px'}}>%</span>
                                                </div>                                                    
                                            </div>  
                                        </li> 
                                        ))
                                    }
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Net</span>
                                        <strong>{this.state.salary_net} RON</strong>
                                    </li>                               
                                </ul>
                            </div>
                        </div>
                    </div>              
                </div>                    
                }
                {this.state.vacationDaysWindow &&
                    <div> 
                        <div className="blur-overlap"></div> 
                        <div className="overlapping-component-inner">
                            <div className='overlapping-component-header'>
                                <span>Zile vacanta</span>
                                <button type="button" className="action-close-window" onClick={()=>{this.setState({vacationDaysWindow: false})}}><span className="material-icons-outlined">close</span></button>
                            </div>
                            <form className="p-3" onSubmit={this.handleVacationForm} id="vacationDaysForm" style={{minWidth:'600px'}}>
                                <div className="mb-3">                                    
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <span><b>Data</b></span>
                                        </div>
                                        <div className="col-sm-4">
                                            <span><b>Tip cerere</b></span>
                                        </div>
                                    </div>
                                    {this.state.vacationDaysRequested.map((element, index)=>(
                                        <div key={index} className="row mb-1">
                                            <div className="col-sm-4">
                                                <input type="date" className="form-control shadow-none" name="trip-start" id={`date-${index}`} min={`${dateString.year}-${dateString.month}-${dateString.day}`} value={element.date} disabled={element.disabled}  onChange={this.handleVacationDaysInput}></input>
                                            </div>
                                            <div className="col-md-4">
                                                <div style={{display:"flex", flexDirection:"row", alignItems:'center'}}>
                                                    <select className="form-select shadow-none" id={`type-${index}`} value={element.type} disabled={element.disabled} onChange={this.handleVacationDaysInput}>
                                                        <option value="vacation">Vacation</option>
                                                        <option value="medical">Medical</option>
                                                    </select>
                                                </div>
                                            </div>                   
                                            <div className="col-md-4" style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>  
                                                <button type="button" title="Stergere" style={{float:"right"}} className="remove-product-button round-button" disabled={element.disabled} onClick={this.handleVacationDaysInput}><span className="material-icons-outlined">remove</span></button>
                                            </div>         
                                        </div>
                                    ))
                                    }                                
                                </div> 
                                <div class="btn-group" role="group">
                                    <button type="button" id="new-vacation-day-button" title="Adauga zi" onClick={this.newVacationDay} className="btn btn-light btn-sm"><span className="action-button-label"><span class="material-icons-outlined">add</span></span></button>
                                    <button type="submit" id="submit-vacation-day-button" className="btn btn-light btn-sm"><span className="action-button-label"><span class="material-icons-outlined">done</span>Inregistrare</span></button>                                             
                                </div>
                            </form>
                        </div>
                    </div>             
                }
               <Snackbar text={this.state.alertUser} closeSnack={()=>{this.setState({alertUser:null})}}/>  
            </div>
        )
    }


}