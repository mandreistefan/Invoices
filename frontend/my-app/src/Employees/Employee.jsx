import React from "react";
import EmployeeForm from "./EmployeeForm.jsx";
import Header from "../Header.jsx";
import SalaryForm from "./SalaryForm.jsx";

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
            tax: false,
            cass: false,
            salaries:[],
            salariesFilter:[],
            vacationDays:[],
            vacationDaysFilter:[],
            salaryWindow: false,
            newSalaryMonth:1,
            salaryYear:2023,
            vacationDaysWindow:false,
            vacationDaysRequested:[{date: `${dateString.year}-${dateString.month}-${dateString.day}`, type:"vacation", disabled:false}], 
            availableVacationDays:0,
            emp_notes: "" ,
            windows:[{name:"Angajat", active: true}, {name:"Salarii", active:false}, {name:"Zile libere", active:false}],
            port: window.location.href.indexOf("app") > -1 ? "3001" : "3000",
            activeSalary: null     
        }
        this.handleMonthChange = this.handleMonthChange.bind(this);
    }

    months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]

    componentDidMount(){
        if(this.state.id){
            this.fetchData()
        }
    }


    fetchData=()=>{
        fetch(`http://localhost:${this.state.port}/employee/${this.state.id}`).then(response=>response.json()).then(data=>{
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
                    availableVacationDays: data.data.info[0].emp_vacation_days,
                    tax: data.data.info[0].emp_tax,
                    cass: data.data.info[0].emp_tax_cass                    
                }) 
            }else{
                this.props.addSnackbar({text:"Eroare"})
            }
        }).catch(error=>{
            console.log(error)
            this.props.addSnackbar({text:"Eroare"})
        })
    }

    convertSalaries=(salaries)=>{

        if(salaries===null) return ([])

        let readableMonth=(monthInteger)=>{
            return this.months[monthInteger]
        }

        let anArray=[]
        salaries.forEach(element=>{
            anArray.push({
                id: element.id,
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

        //initially, the filter contains everything
        let initialSalariesFilter = []
        for(let i=0;i<salaries.length;i++){
            initialSalariesFilter.push(i) 
        }
        this.setState({salariesFilter:initialSalariesFilter})

        return anArray
    }

    normalDate=((date,bool)=>{
        let dateObject=new Date(date)
        return bool ? `${dateObject.getDate()} ${this.months[dateObject.getMonth()]} ${dateObject.getFullYear()}` : `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()}`
    })

    convertVacations=(vacationsObject)=>{
        let anArray = []
        if(vacationsObject!=null){
            vacationsObject.forEach(element=>{
                anArray.push({id: element.id, date:element.date, type:element.type, registerDate:element.registerDate, status: element.status})
            })

            //initially, the filter contains everything
            let initialVacationsFilter = []
            for(let i=0;i<vacationsObject.length;i++){
                initialVacationsFilter.push(i) 
            }
            this.setState({vacationDaysFilter:initialVacationsFilter})
        }
        return anArray
    }

    handleVacationForm=(event)=>{
        event.preventDefault()
        let noRepeat = true
        let noHolidays = true
        //check that dates do not repeat
        this.state.vacationDaysRequested.forEach((element, index)=>{
            this.state.vacationDaysRequested.forEach((element2, index2)=>{
                if(index!==index2){
                    if(element.date===element2.date){  
                        noRepeat=false
                        return
                    }
                }                
            })
        })

        let holidays = localStorage.getItem('holidays') ? JSON.parse(localStorage.getItem('holidays')) : null

        let isHoliday=(date)=>{
            let dateAsArray = date.split("-")
            let reverseDate = (`${dateAsArray[2]}-${dateAsArray[1]}-${dateAsArray[0]}`)
            for(let i=0; i<holidays.length; i++){
                if(holidays[i]===reverseDate) return true
            }
        }

        if(holidays!==null){
            let copy = this.state.vacationDaysRequested
            copy.forEach((element, index)=>{
                if(isHoliday(element.date)){
                    element.holiday = true
                    noHolidays = false
                }else{
                    element.holiday = false
                }
            })
            this.setState({vacationDaysRequested: copy})
        }

        if(noRepeat===true && noHolidays===true){
            fetch(`http://localhost:${this.state.port}/employee_vacation`, {
                method:"POST",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({
                    employeeID: this.state.id,
                    dates: this.state.vacationDaysRequested
                })
            }).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    this.props.addSnackbar({text:"Cerere inregistrata"})
                    this.setState({vacationDaysRequested: [{date: `${dateString.year}-${dateString.month}-${dateString.day}`, type:"vacation", disabled:false}]})
                    document.getElementById("new-vacation-day-button").disabled=false
                    document.getElementById("submit-vacation-day-button").disabled=false
                    this.updateVacationDays()
                }else{
                    this.props.addSnackbar({icon:"report_problem",text:"Ceva nu a functionat"})
                }                
            })
        }else{
            this.props.addSnackbar({text:"Unele zile se repeta sau sunt sarbatori legale"})
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
                this.props.addSnackbar({text:"Ziua selectata este zi de weekend"})
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
        }
        this.setState({vacationDaysRequested: curVac})
    }

    removeVacationDay=(index)=>{
        let copy = this.state.vacationDaysRequested
        copy.splice(index, 1)
        this.setState({vacationDaysRequested: copy})
    }

    //month starts with 0
    parseDate=(date)=>{
        let theDate = date.split('/')    
        return `${theDate[0]}/${parseInt(theDate[1])}/${theDate[2]}`
    }

    updateEmployeeSalaries=()=>{
        fetch(`http://localhost:${this.state.port}/employee_salaries?filter=paid_to&filterBy=${this.state.id}`)
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({salaries: this.convertSalaries(data.data)})
            }else{
                this.props.addSnackbar({icon:"report_problem",text:"Ceva nu a functionat"})
            }                
        })
    }

    calculateNet=()=>{
        let onePercentOfGross = parseFloat(this.state.salary_gross/100)
        this.setState({salary_net: parseFloat(this.state.salary_gross-(onePercentOfGross*this.state.taxesPercentages[0].value + onePercentOfGross*this.state.taxesPercentages[1].value + onePercentOfGross*this.state.taxesPercentages[2].value))})        
    }

    updateVacationDays=()=>{        
        fetch(`http://localhost:${this.state.port}/employee_vacation/${this.state.id}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({vacationDays: this.convertVacations(data.data)})
            }else{
                this.props.addSnackbar({icon:"report_problem",text:"Ceva nu a functionat"})
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

    intervalSalariesFunction=(interval, appliesTo)=>{
        let filtered = []
        this.state.salaries.forEach((element, index)=>{
            if((Date.parse(element.date) >= Date.parse(interval.start)) && (Date.parse(element.date) <= Date.parse(interval.end))) filtered.push(index)
        })
        this.setState({salariesFilter:filtered})
    }

    intervalVacationsFunction=(interval, appliesTo)=>{
        let filtered = []
        switch(appliesTo){
            case "Data":
                this.state.vacationDays.forEach((element, index)=>{
                    if((Date.parse(element.date) >= Date.parse(interval.start)) && (Date.parse(element.date) <= Date.parse(interval.end))) filtered.push(index)
                })
                
                break
            case "Data inregistrare":
                this.state.vacationDays.forEach((element, index)=>{
                    if((Date.parse(element.registerDate) >= Date.parse(interval.start)) && (Date.parse(element.registerDate) <= Date.parse(interval.end))) filtered.push(index)
                })
                break
        }

        this.setState({vacationDaysFilter:filtered})
    }

    /**
     * Updates the status of a vacation day
     * @param {*} dayID ID of the vacation day
     * @param {*} newStatus status to which we update
     */
    updateDayStatus=(dayID, newStatus)=>{
        fetch(`http://localhost:${this.state.port}/employee_vacation_status`, 
        {   
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id: dayID, status: newStatus})
        }).then(response=>response.json()).then(data=>{
            console.log(data)
            if(data.status==="OK"){
                let currentVacationDays = this.state.vacationDays
                for(let i=0; i< currentVacationDays.length; i++){
                    if(currentVacationDays[i].id===dayID){
                        currentVacationDays[i].status=newStatus
                        break
                    }
                }
                this.setState({vacationDays: currentVacationDays})
                this.props.addSnackbar({text:"Ziua a fost actualizata"})
            }else{
                this.props.addSnackbar({text:"Ceva nu a mers bine"})
            }
        }).catch(error=>{
            console.log(error)
            this.props.addSnackbar({text:"A aparut o eroare"})
        })
    }

    deleteVacationDay=(id)=>{
        fetch(`http://localhost:${this.state.port}/employee_vacation/${id}`, 
        {   
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' }
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                let currentVacationDays = this.state.vacationDays
                for(let i=0; i< currentVacationDays.length; i++){
                    if(currentVacationDays[i].id===id){
                        currentVacationDays.splice(i, 1)
                        let newFilter = []
                        for(let j=0;j<currentVacationDays.length;j++){
                            newFilter.push(j) 
                        }
                        this.setState({vacationDaysFilter: newFilter})
                        break
                    }
                }                
                this.setState({vacationDays: currentVacationDays})
                this.props.addSnackbar({text:"Ziua a fost stearsa"})
            }else{
                this.props.addSnackbar({text:"Ceva nu a mers bine"})
            }
        }).catch(error=>{
            console.log(error)
            this.props.addSnackbar({text:"A aparut o eroare"})
        })
    }

    editSalary=(id)=>{
        this.setState({activeSalary: id})
    }

    deleteSalary=(id)=>{
        if(window.confirm("Stergeti salariul?") === false) return false
        fetch(`http://localhost:${this.state.port}/employee_salary/${id}`,
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.props.addSnackbar({text:"Salariu sters"})
                let salariesCopy = this.state.salaries
                for(let i=0; i< salariesCopy.length; i++){
                    if(salariesCopy[i].id===id){
                        salariesCopy.splice(i, 1)
                        let newFilter = []
                        for(let j=0;j<salariesCopy.length;j++){
                            newFilter.push(j) 
                        }
                        this.setState({salariesFilter: newFilter})
                        break
                    }
                }                
                this.setState({salaries: salariesCopy})
            }else if(data.status==="SERVER_ERROR"){
                this.props.addSnackbar({text:"A aparut o eroare"})
            }else{
                this.props.addSnackbar({text:"A aparut o eroare"})
            }            
        })
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
                            <EmployeeForm refreshParent={this.fetchData} employeeID={this.props.id} addSnackbar={this.props.addSnackbar}/>
                        </div>
                    </div>
                    <div style={{display: this.state.windows[1].active===true ? 'block' : 'none'}}> 
                        <Header title="Salarii" icon="account_circle" hasSearch="false" refreshData={this.updateEmployeeSalaries} buttons={[{title:"Salariu", action:()=>{this.setState({salaryWindow:true})}, icon:"add", name:"Salariu nou"}]} intervalFunction={this.intervalSalariesFunction} intervalSelections={["Data"]}/>    
                        <table className='table' id="salaries-table" style={{marginBottom:'1rem'}}>
                            <thead>
                                <tr>
                                    <td>Aplicabil lunii</td>
                                    <td>Data</td>
                                    <td>Brut</td>
                                    <td>CAS</td>
                                    <td>CASS</td>
                                    <td>Venit</td>
                                    <td>CM</td>
                                    <td>Net</td>
                                    <td></td>
                                </tr>    
                            </thead>
                            <tbody>
                                {this.state.salariesFilter!==[] && 
                                this.state.salariesFilter.map((element, index)=>(
                                    <tr key={index}>
                                        <td>{this.state.salaries[element].month} {this.state.salaries[element].year}</td>
                                        <td>{this.state.salaries[element].date}</td>
                                        <td><b>{this.state.salaries[element].gross}</b></td>
                                        <td>{this.state.salaries[element].taxes.cas}</td>
                                        <td>{this.state.salaries[element].taxes.cass}</td>
                                        <td>{this.state.salaries[element].taxes.income}</td>
                                        <td>{this.state.salaries[element].taxes.cm}</td>
                                        <td><b>{this.state.salaries[element].net}</b></td>
                                        <td>
                                            <div class="btn-group">                                                
                                                <button className="btn btn-light btn-sm mint-button" onClick={()=>{this.deleteSalary(this.state.salaries[element].id)}}><span class="material-icons-outlined">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {this.state.salariesFilter.length===0 && <span>Nu exista date</span>}
                        </table>
                    </div>                    
                    <div style={{display: this.state.windows[2].active===true ? 'block' : 'none'}}>                        
                        <div style={{width:'100%'}} >
                            <Header title="Zile libere" icon="account_circle" hasSearch="false" refreshData={this.updateVacationDays} buttons={[{title:"Cerere noua", action:()=>{this.setState({vacationDaysWindow:true})}, icon:"add", name:"Cerere noua"}]} intervalFunction={this.intervalVacationsFunction} intervalSelections={["Data", "Data inregistrare"]}/>    
                            <table className='table' id="vacation-days-table" style={{marginBottom:'1rem'}}>
                                <thead>
                                    <tr>
                                        <td>Data</td>
                                        <td>Data inregistrare</td>
                                        <td>Tip</td>
                                        <td>Status</td>
                                        <td></td>
                                    </tr>    
                                </thead>
                                <tbody>
                                    {this.state.vacationDaysFilter!==[] &&
                                    this.state.vacationDaysFilter.map((element,index)=>(
                                        <tr key={index}>
                                            <td><b>{this.state.vacationDays[element].date}</b></td>
                                            <td>{this.state.vacationDays[element].registerDate}</td>
                                            <td>{this.state.vacationDays[element].type}</td>
                                            <td>{this.state.vacationDays[element].status}</td>  
                                            <td>
                                                <div class="btn-group">
                                                    <button className="btn btn-light btn-sm mint-button" disabled={this.state.vacationDays[element].status==="executed" ? true : false} onClick={()=>{this.updateDayStatus(this.state.vacationDays[element].id, "executed")}}><span class="material-icons-outlined">task_alt</span></button>
                                                    <button className="btn btn-light btn-sm mint-button" disabled={this.state.vacationDays[element].status==="executed" ? true : false} onClick={()=>{this.deleteVacationDay(this.state.vacationDays[element].id)}}><span class="material-icons-outlined">delete</span></button>
                                                </div>
                                            </td>          
                                        </tr>
                                    ))}
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
                        <SalaryForm employeeInfo={{id: this.state.id, name: this.state.first_name, lastName: this.state.last_name, salary: this.state.salary_gross, netSalary: this.state.salary_net, emp_tax: this.state.tax, emp_tax_cass: this.state.cass}} updateEmployeeSalaries={this.updateEmployeeSalaries}/>
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
                                        <div className="col-md-3" style={{display: element.holiday ? "flex" : "none", alignItems:'center'}}>
                                            <span className="text-danger">Sarbatoare legala</span>
                                        </div>                
                                        <div className="col-md-1" style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>  
                                            <button type="button" title="Stergere" style={{float:"right"}} className="remove-product-button round-button" disabled={element.disabled} onClick={()=>{this.removeVacationDay(index)}}><span className="material-icons-outlined">remove</span></button>
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
                </div>}
                {this.state.activeSalary!==null &&
                <div> 
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Editare salariu</span>
                            <button type="button" className="action-close-window" onClick={()=>{this.setState({activeSalary: null})}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <SalaryForm salaryID={this.state.activeSalary} updateEmployeeSalaries={this.updateEmployeeSalaries}/>
                    </div>
                </div>
                }
            </div>
        )
    }


}