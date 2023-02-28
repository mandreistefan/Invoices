import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

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
            vacationDays:[],
            salaryWindow: false,
            newSalaryMonth:1,
            alertUser:null, 
            vacationDaysWindow:false,
            vacationDaysRequested:[{date: `${dateString.year}-${dateString.month}-${dateString.day}`, type:"vacation"}], 
            availableVacationDays:0,
            emp_notes: "", 
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
            return bool ? `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}` : `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()}`
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
            fetch(`http://localhost:3000/employee/${this.state.id}`).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
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
                        emp_notes: data.data.info[0].emp_notes ? data.data.info[0].emp_notes : "",
                        availableVacationDays: data.data.info[0].emp_vacation_days
                    })
                    this.calculateNet()
                }else{
                    this.setState({alertUser:"Eroare"})
                }
            }).catch(error=>{
                this.setState({alertUser:"Eroare"})
            })
        }
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
            body:JSON.stringify({paid_to:this.state.id, salary_month:this.state.newSalaryMonth, bank_ref:document.getElementById("bankref").value, taxes})
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
            if(curVac.length===1) return false
            curVac.splice(theID, 1)
        }
        this.setState({vacationDaysRequested: curVac})
    }

    //month starts with 0
    parseDate=(date)=>{
        let theDate = date.split('/')    
        return `${theDate[0]}/${parseInt(theDate[1])+1}/${theDate[2]}`
    }

    updateEmployeeSalaries=()=>{
        fetch(`http://localhost:3000/employee_salary?filter=paid_to&filterBy=${this.state.id}`
        ).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({salaries:data.data})
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

     render(){
        return(
            <div style={{padding:'16px'}}>
                <div style={{display:'flex', alignItems:'center'}} className='bordered-container p-3'>
                    <div style={{width:"50%", paddingRight:'10px'}}>
                        <div>
                            <h4>{this.state.first_name} {this.state.last_name}</h4>
                            <h5 id="employee-title">{this.state.job_name}</h5>
                            <div>
                                <ul id="employee-info">
                                    <li><b>Nume:</b> {this.state.first_name}</li>
                                    <li><b>Prenume:</b> {this.state.last_name}</li>
                                    <li><b>Adresa:</b> {this.state.adress}</li>
                                    <li><b>CNP:</b> {this.state.identification_number}</li>
                                    <li><b>Salariu de baza:</b> {this.state.salary_gross} RON</li>
                                    <li><b>Data angajarii:</b> {this.state.registration_date}</li>
                                    <li><b>Zile concediu:</b> {this.state.availableVacationDays}</li>
                                </ul>
                            </div>                            
                        </div>
                    </div>
                    <div style={{width:"50%", paddingLeft:'10px'}}>
                        <div>
                            <label>Note angajat</label>
                            <textarea style={{height:'100%'}} rows="4" className="form-control" disabled={true} value={this.state.emp_notes}></textarea>
                        </div>
                    </div>
                </div>
                <div id="additional-employee-info-container">
                    <div style={{width:'100%', marginBottom:'25px', marginTop:'25px', display:'flex', flexDirection:'column'}} className="bordered-container">  
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} className='p-3'>
                                <h5>Salarii</h5>
                                <div className="btn-group">                               
                                    <button className='btn btn-light' type="button" onClick={()=>{this.setState({salaryWindow:true})}} title="Plata noua" ><div className="inner-button-content"><span className="material-icons-outlined">add</span></div></button>
                                    <button className='btn btn-light' type="button" onClick={()=>{this.updateEmployeeSalaries()}} title="Reincarca" ><div className="inner-button-content"><span className="material-icons-outlined">refresh</span></div></button>
                                </div>
                            </div>
                            <table className='table' id="salaries-table">
                                <thead>
                                    <tr>
                                        <td>Luna</td>
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
                                    {this.state.salaries!=[] ? this.state.salaries.map((element, index)=>(
                                        <tr key={index}>
                                            <td><b>{element.month}</b></td>
                                            <td>{element.date}</td>
                                            <td><b>{element.gross}</b></td>
                                            <td>{element.taxes.cas}</td>
                                            <td>{element.taxes.cass}</td>
                                            <td>{element.taxes.income}</td>
                                            <td>{element.taxes.cm}</td>
                                            <td><b>{element.net}</b></td>
                                        </tr>
                                    )):"Nu exista inregistrari"}
                                </tbody>
                            </table>
                    </div>   
                    <div style={{width:'100%', marginBottom:'25px', display:'flex', flexDirection:'row'}}>                        
                            <div style={{width:'100%'}} className="bordered-container">
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} className='p-3'>
                                    <h5>Zile libere</h5>
                                    <div className="btn-group">                               
                                        <button className='btn btn-light' type="button" onClick={()=>{this.setState({vacationDaysWindow:true})}} title="Cerere noua" ><div className="inner-button-content"><span className="material-icons-outlined">add</span></div></button>
                                        <button className='btn btn-light' type="button" onClick={()=>{this.updateEmployeeSalaries()}}  title="Reincarca" ><div className="inner-button-content"><span className="material-icons-outlined">refresh</span></div></button>
                                    </div>
                                </div>
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
                {this.state.salaryWindow &&
                    <div> 
                        <div className="blur-overlap"></div>     
                        <button type="button" className="action-close-window" onClick={()=>{this.setState({salaryWindow: false})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        <div className="overlapping-component-inner">
                            <div className="row g-5 p-5">
                                <div className="col-md-7 col-lg-6">
                                    <h6>Informatii angajat</h6>
                                    <form onSubmit={this.handleSubmit}>
                                        <div className="row g-3">
                                            <div className="col-sm-6">
                                                <label for="firstName" className="form-label">Nume</label>
                                                <input type="text" className="form-control" id="firstName" placeholder="" value={this.state.first_name} disabled={true} required=""></input>
                                            </div>
                                            <div className="col-sm-6">
                                                <label for="lastName" className="form-label">Prenume</label>
                                                <input type="text" className="form-control" id="lastName" placeholder="" value={this.state.last_name} disabled={true} required=""></input>
                                            </div>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-sm-12">
                                                <label for="cnp" className="form-label">CNP</label>
                                                <input type="text" className="form-control" id="cnp" placeholder="" value={this.state.identification_number} disabled={true} required=""></input>
                                            </div>   
                                        </div>
                                        <div className="col-md-5">
                                            <label for="paid_for" className="form-label">Luna</label>
                                            <select className="form-select" id="paid_for" required="" onChange={this.handleMonthChange}>
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
                                        <div className="col-sm-6">
                                            <label for="bankref" className="form-label">ID tranzactie bancara</label>
                                            <input type="text" className="form-control" id="bankref" placeholder=""></input>
                                        </div>
                                        <hr></hr>
                                        <button className="w-100 btn btn-primary btn-lg" type="submit">INREGISTRARE</button>
                                    </form>
                                </div>
                                <div className="col-md-5 col-lg-6 order-md-last">
                                    <ul className="list-group mb-3">
                                        {
                                            this.state.taxesPercentages.map(element=>(
                                                <li className="list-group-item d-flex justify-content-between lh-sm">
                                                <div>
                                                    <h6 className="my-0">{element.key}</h6>
                                                    <small className="text-muted">{element.description}</small>
                                                </div>
                                                <div>
                                                    <div class="input-group">                                                    
                                                        <input type="text" className="form-control shadow-none" style={{width:'50px', padding:'2px'}} value={element.value} onChange={this.reacalculateTaxesWithThis} name={element.key}></input>
                                                        <span class="input-group-text" style={{padding:'2px'}}>%</span>
                                                    </div>
                                                    <div class="input-group">  
                                                        <input type="text" className="form-control shadow-none" disabled={true}  style={{width:'50px', padding:'2px'}} value={parseFloat(this.state.salary_gross/100)*parseFloat(element.value)}></input>
                                                        <span class="input-group-text" style={{padding:'2px'}}>RON</span>
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
                        <button type="button" className="action-close-window" onClick={()=>{this.setState({vacationDaysWindow: false})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        <div className="overlapping-component-inner">
                            <div>
                                <h6>Cerere zile libere</h6>                               
                            </div>
                            <form onSubmit={this.handleVacationForm} id="vacationDaysForm" style={{minWidth:'600px'}}>
                                <div className="list-group w-auto">
                                    {
                                        this.state.vacationDaysRequested.map((element, index)=>(
                                            <div key={index} className="row g-3">
                                                <div className="col-sm-6">
                                                    <label className="form-label">Data</label>
                                                    <input type="date" className="form-control shadow-none" name="trip-start" id={`date-${index}`} min={`${dateString.year}-${dateString.month}-${dateString.day}`} value={element.date} onChange={this.handleVacationDaysInput}></input>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Tip</label>
                                                    <div style={{display:"flex", flexDirection:"row", alignItems:'center'}}>
                                                        <select className="form-select shadow-none" id={`type-${index}`} value={element.type} onChange={this.handleVacationDaysInput}>
                                                            <option value="vacation">Vacation</option>
                                                            <option value="medical">Medical</option>
                                                        </select>
                                                        <button type="button" className="btn btn-light" title="Sterge data" style={{display:'inherit', alignItems:'center', marginLeft:'5px'}} id={`removeButton-${index}`} onClick={this.handleVacationDaysInput}>X</button>
                                                    </div>
                                                </div>            
                                            </div>
                                        ))
                                    }                                
                                </div>   
                                <hr></hr> 
                                <button type="button" className="w-100 btn btn-primary btn-success my-1 shadow-none" onClick={this.newVacationDay}>ADAUGA ZI</button>                            
                                <button className="w-100 btn btn-primary my-1 shadow-none" type="submit">INREGISTRARE</button>                                
                            </form>
                        </div>
                    </div>             
                }
               <Snackbar text={this.state.alertUser} closeSnack={()=>{this.setState({alertUser:null})}}/>  
            </div>
        )
    }


}