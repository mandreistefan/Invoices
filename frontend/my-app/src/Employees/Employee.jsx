import React from "react";
import './Employee.css'
import Snackbar from '../Snackbar/Snackbar.jsx'

const taxesPercentages={
    CAS: 0.25,
    CASS: 0.1,
    TAX: 0.1,
    CAM: 0.0225
}

const currentDate = new Date()
let dateString = {
    day: parseInt(currentDate.getDate())<10 ? `0`+currentDate.getDate() : currentDate.getDate(),
    month: currentDate.getMonth()+1,
    year: currentDate.getFullYear()
}
console.log(dateString)
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
            salaries:[],
            vacationDays:[],
            salaryWindow: false,
            isTaxable:false,
            newSalaryMonth:1,
            alertUser:null, 
            vacationDaysWindow:false,
            vacationDaysRequested:[{date: `${dateString.year}-${dateString.month}-${dateString.day}`, type:"vacation"}]
        }

        this.handleMonthChange = this.handleMonthChange.bind(this);

    }

    componentDidMount(){

        let setSalaries=(salaries)=>{

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
                        date:normalDate(element.paid_on, false)
                    })
                })
            }
            return anArray
        }

        let normalDate=((date,bool)=>{
            let months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
            let dateObject=new Date(date)
            return bool ? `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}` : `${dateObject.getDate()}/${dateObject.getMonth()}/${dateObject.getFullYear()}`
        })

        let setVacations=(vacationsObject)=>{
            let anArray = []
            if(vacationsObject!=null){
                vacationsObject.forEach(element=>{
                    anArray.push({date:normalDate(element.date, false), type:element.type, registerDate:normalDate(element.registerDate, false)})
                })
            }
            return anArray
        }

        if(this.state.id){
            fetch(`./employee/${this.state.id}`).then(response=>response.json()).then(data=>{
                if(data.status=="OK"){
                    this.setState({
                        first_name:data.data.info[0].emp_first_name, 
                        last_name:data.data.info[0].emp_last_name,
                        adress:data.data.info[0].emp_adress,
                        identification_number:data.data.info[0].emp_ident_no,
                        registration_date:normalDate(data.data.info[0].emp_date, true),
                        active:data.data.info[0].emp_active ? true : false,
                        job_name:data.data.info[0].emp_job_name,
                        salary_gross:data.data.info[0].emp_cur_salary_gross,
                        salaries:setSalaries(data.data.salaries),
                        vacationDays:setVacations(data.data.vacationDays),
                        isTaxable: data.data.info[0].emp_tax ? true : false
                    })
                }else{
                    console.log("UPS")
                }
            })
        }
    }


    handleSubmit=(event)=>{
        event.preventDefault();
        fetch(`/employee_salary`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({paid_to:this.state.id, salary_month:this.state.newSalaryMonth})
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({alertUser:"Salariu inregistrat"})
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
            fetch('./employee_vacation', {
                method:"POST",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({
                    employeeID: this.state.id,
                    dates: this.state.vacationDaysRequested
                })
            }).then(response=>response.json()).then(data=>{
                console.log(data)
            })
        }else{
            this.setState({alertUser:"O data este repetata"})
        }        
    }

    handleMonthChange(event) {
        this.setState({newSalaryMonth: event.target.value});
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
            if(curVac.length==1) return false
            curVac.splice(theID, 1)
        }
        this.setState({vacationDaysRequested: curVac})
    }

    
     render(){
        return(
            <div>
                <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{width:"50%"}}>
                        <h5>{this.state.active ? <span className="material-icons-outlined">check_circle</span> : <span className="material-icons-outlined">highlight_off</span>}{this.state.first_name} {this.state.last_name}</h5>
                        <h6 id="employee-title">{this.state.job_name}</h6>
                        <div>
                            <ul id="employee-info">
                                <li>Nume: {this.state.first_name}</li>
                                <li>Prenume: {this.state.last_name}</li>
                                <li>Adresa: {this.state.adress}</li>
                                <li>CNP: {this.state.identification_number}</li>
                                <li>Salariu de baza: {this.state.salary_gross}</li>
                            </ul>
                        </div>
                    </div>
                    <div style={{width:"50%"}}>
                        <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
                            <div className="col d-flex align-items-start">
                                <div className="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                    <span className="material-icons-outlined">calendar_today</span>
                                </div>
                                <div>
                                    <h5 >{this.state.registration_date}</h5>
                                    <p>Data angajarii</p>
                                </div>
                            </div>
                            <div className="col d-flex align-items-start">
                                <div className="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                                    <span className="material-icons-outlined">attach_money</span>
                                </div>    
                                <div>
                                    <h5 >{this.state.salary_gross} RON</h5>
                                    <p>Salariu brut</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{display:'flex', flexDirection:'row', flexWrap:"wrap"}}>
                    <div className="p-3" style={{width:'50%', minWidth:'475px'}}>
                        <h6>Salarii</h6>
                        <table className='table table-hover table-sm app-data-table' id="vacation-days-table">
                            <thead className='table-active'>
                                <tr className='app-data-table-row table-active'>
                                    <th>LUNA</th>
                                    <th>DATA</th>
                                    <th>BRUT</th>
                                    <th>CAS</th>
                                    <th>CASS</th>
                                    <th>VENIT</th>
                                    <th>CM</th>
                                    <th>NET</th>
                                </tr>    
                            </thead>
                            <tbody>
                                {this.state.salaries!=[] ? this.state.salaries.map((element, index)=>(
                                    <tr>
                                        <td><b>{element.month}</b></td>
                                        <td><b>{element.date}</b></td>
                                        <td><b>{element.gross}</b></td>
                                        <td><b>{element.taxes.cas}</b></td>
                                        <td><b>{element.taxes.cass}</b></td>
                                        <td><b>{element.taxes.income}</b></td>
                                        <td><b>{element.taxes.cm}</b></td>
                                        <td className="text-success"><b>{element.net}</b></td>
                                    </tr>
                                )):"Nu exista inregistrari"}
                            </tbody>
                        </table>
                        <button type="button" class="btn btn-primary w-100" onClick={()=>{this.setState({salaryWindow:true})}}>INREGISTRARE PLATA NOUA</button>
                    </div>   
                    <div className="p-3" style={{width:'50%', minWidth:'475px'}}>
                        <h6>Zile libere</h6>
                        {this.state.vacationDays.length>0 ? this.state.vacationDays.map(element=>(
                            <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-1" aria-current="true">
                                <span class="material-icons-outlined">event</span>
                                <div class="d-flex gap-2 w-100 justify-content-between">
                                <div>
                                    <h6 class="mb-0">{element.date}</h6>
                                    <p class="mb-0 opacity-75">{element.type}</p>
                                </div>
                                <small class="opacity-50 text-nowrap">{element.registerDate}</small>
                                </div>
                            </a>
                        )):"Nu exista inregistrari"}
                        <button class="btn btn-primary w-100 my-1" onClick={()=>{this.setState({vacationDaysWindow: true})}}>CERERE NOUA</button>
                    </div>                            
                </div>
                {this.state.salaryWindow &&
                        <div> 
                            <div className="blur-overlap"></div>     
                            <button type="button" className="action-close-window" onClick={()=>{this.setState({salaryWindow: false})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                            <div className="overlapping-component-inner">
                                <div className="row g-5 p-5">
                                    <div className="col-md-7 col-lg-8">
                                        <h6>Informatii angajat</h6>
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="row g-3">
                                                <div class="col-sm-6">
                                                    <label for="firstName" class="form-label">Nume</label>
                                                    <input type="text" class="form-control" id="firstName" placeholder="" value={this.state.first_name} disabled={true} required=""></input>
                                                </div>
                                                <div class="col-sm-6">
                                                    <label for="lastName" class="form-label">Prenume</label>
                                                    <input type="text" class="form-control" id="lastName" placeholder="" value={this.state.last_name} disabled={true} required=""></input>
                                                </div>
                                            </div>
                                            <div className="row g-3">
                                                <div class="col-sm-12">
                                                    <label for="cnp" class="form-label">CNP</label>
                                                    <input type="text" class="form-control" id="cnp" placeholder="" value={this.state.identification_number} disabled={true} required=""></input>
                                                </div>   
                                            </div>
                                            <div class="col-md-5">
                                                <label for="paid_for" class="form-label">Luna</label>
                                                <select class="form-select" id="paid_for" required="" onChange={this.handleMonthChange}>
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
                                            </div>
                                            <hr></hr>
                                            <button class="w-100 btn btn-primary btn-lg" type="submit">INREGISTRARE</button>
                                        </form>
                                    </div>
                                    <div class="col-md-5 col-lg-4 order-md-last">
                                        <ul class="list-group mb-3">
                                            <li class="list-group-item d-flex justify-content-between lh-sm">
                                                <div>
                                                <h6 class="my-0">Brut</h6>
                                                    <small class="text-muted">Salariu brut aferent angajatului</small>
                                                </div>
                                                <span class="text-muted" ><b>{this.state.salary_gross}</b></span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between lh-sm">
                                                <div>
                                                <h6 class="my-0">CAS</h6>
                                                    <small class="text-muted">Asigurari Sociale</small>
                                                </div>
                                                <span class="text-muted" >{parseFloat(this.state.salary_gross*taxesPercentages.CAS)}</span>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between lh-sm">
                                                <div>
                                                <h6 class="my-0">CASS</h6>
                                                    <small class="text-muted">Asigurari Sociale Sanatate</small>
                                                </div>
                                                <span class="text-muted" >{parseFloat(this.state.salary_gross*taxesPercentages.CASS)}</span>
                                            </li>
                                            {
                                                this.state.isTaxable &&
                                                    <li class="list-group-item d-flex justify-content-between lh-sm">
                                                    <div>
                                                    <h6 class="my-0">Venit</h6>
                                                        <small class="text-muted">Impozit venit</small>
                                                    </div>
                                                    <span class="text-muted" >{parseFloat(this.state.salary_gross*taxesPercentages.TAX)}</span>
                                                </li>
                                            }
                                            <li class="list-group-item d-flex justify-content-between lh-sm">
                                                <div>
                                                <h6 class="my-0">CM</h6>
                                                    <small class="text-muted">Contributie Asiguratorie<br/>Munca</small>
                                                </div>
                                                <span class="text-muted" >{parseFloat(this.state.salary_gross*taxesPercentages.CAM)}</span>
                                            </li> 
                                            <li class="list-group-item d-flex justify-content-between">
                                                <span>Net</span>
                                                <strong>{parseFloat(this.state.salary_gross - this.state.salary_gross*taxesPercentages.CAS - this.state.salary_gross*taxesPercentages.CASS - ((this.state.salary_gross*taxesPercentages.TAX)*this.state.isTaxable))} RON</strong>
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
                        <button type="button" className="action-close-window" onClick={()=>{this.setState({vacationDaysWindow: false})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        <div className="overlapping-component-inner">
                            <div>
                                <h6>Cerere zile libere</h6>                               
                            </div>
                            <form onSubmit={this.handleVacationForm} style={{minWidth:'600px'}}>
                                <div className="list-group w-auto">
                                    {
                                        this.state.vacationDaysRequested.map((element, index)=>(
                                            <div className="row g-3">
                                                <div className="col-sm-6">
                                                    <label class="form-label">Data</label>
                                                    <input type="date" className="form-control shadow-none" name="trip-start" id={`date-${index}`} min={`${dateString.year}-${dateString.month}-${dateString.day}`} value={element.date} onChange={this.handleVacationDaysInput}></input>
                                                </div>
                                                <div className="col-md-6">
                                                    <label class="form-label">Tip</label>
                                                    <div style={{display:"flex", flexDirection:"row", alignItems:'center'}}>
                                                        <select className="form-select shadow-none" id={`type-${index}`} value={element.type} onChange={this.handleVacationDaysInput}>
                                                            <option value="vacation">Vacation</option>
                                                            <option value="medical">Medical</option>
                                                        </select>
                                                        <button type="button" style={{display:'inherit', alignItems:'center', width:'24px', height:'24px', border:'1px solid black', backgroundColor:'transparent', borderRadius:'16px', marginLeft:'5px'}} id={`removeButton-${index}`} onClick={this.handleVacationDaysInput}>X</button>
                                                    </div>
                                                </div>
                                                <div className="col-sm-2">
                                                    
                                                </div>
                                            </div>
                                        ))
                                    }                                
                                </div>   
                                <hr></hr> 
                                <button type="button" className="w-100 btn btn-primary btn-success my-1 shadow-none" onClick={this.newVacationDay}>ADAUGA ZI</button>                            
                                <button class="w-100 btn btn-primary my-1 shadow-none" type="submit">INREGISTRARE</button>                                
                            </form>
                        </div>
                    </div>             
                }
               <Snackbar text={this.state.alertUser} closeSnack={()=>{this.setState({alertUser:null})}}/>  
            </div>
        )
    }


}