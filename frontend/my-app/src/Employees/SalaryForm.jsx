import { useState, useEffect, useRef } from "react"
import { useOutletContext } from 'react-router-dom';

/**
 * 
 * @param {*} props.employeeInfo.emp_tax Value of income tax
 * @param {*} props.employeeInfo.emp_tax_cass Value of CASS tax
 * @param {*} props.employeeInfo.id ID of the employee
 * @param {*} props.employeeInfo.name
 * @param {*} props.employeeInfo.lastName
 * @param {*} props.employeeInfo.salary The gross salary
 * @param {*} props.updateEmployeeSalaries Called when a salary has been registered
 * @returns 
 */
let SalaryForm = (props) =>{

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    let [taxes, setTaxes]=useState([
        {name: "CAS", key:"CAS", description:"Asigurare sociale", value: 21.5},
        {name: "CASS", key:"CASS", description: "Asigurari sociale sanatate", value: 10},
        {name: "VENIT", key:"TAX", description: "Impozit venit", value: 10},
        {name: "CAM", key:"CAM", description:"Contributie asiguratorie munca", value: 2.25}        
    ])

    let [method, setMethod] = useState(null)
    const date = new Date()
    const currentYear = date.getFullYear() 
    //employee info
    let [employeeInfo, setEmployeeInfo] = useState(null)
    //form elements
    let salaryMonth = useRef()
    let salaryYear = useRef()
    let bankRef = useRef()

    //initial load
    useEffect(()=>{
        //register for employee
        if(props.employeeInfo){
            let taxesCopy = [...taxes]
            if(props.employeeInfo.emp_tax===0){
                taxesCopy[2].value=0;                  
            }                    
            if(props.employeeInfo.emp_tax_cass===0){
                taxesCopy[1].value=0;                  
            }
            setTaxes(taxesCopy)  
            setEmployeeInfo({
                employeeID: props.employeeInfo.id,
                employeeName:  props.employeeInfo.name,
                employeeLastName: props.employeeInfo.lastName,
                grosSalary: props.employeeInfo.salary,
                netSalary: 0
            })
            setMethod("new")
        }else if(props.salaryID){
            //edit a salary
            fetchSalary(props.salaryID)
            setMethod("edit")
        }    
    },[])

    //whenever the taxes are changed, recalculate the net
    useEffect(()=>{
        calculateNet()
    },[taxes])

    //register a new salary
    let handleSubmit = (event)=>{
        event.preventDefault();
        let taxesCopy = []
        taxes.forEach(element=>{
            taxesCopy.push(element.value)
        })
        fetch(`http://localhost:${port}/employee_salary`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({paid_to: employeeInfo.employeeID, salary_month: salaryMonth.current.value, salary_year: salaryYear.current.value, bank_ref: bankRef.current.value, taxes: taxesCopy})
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text:"Salariu inregistrat"})
                props.updateEmployeeSalaries()
            }else{
                if(data.data==="SALARY_EXISTS") addSnackbar({text:"Exista o inregistrare pentru luna respectiva"})
            }
        }).catch(error=>{
            console.log(error)
        })
    }

    function fetchSalary(id){
        fetch(`http://localhost:${port}/employee_salary/${id}`)
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                console.log(data)
                setEmployeeInfo({
                    employeeID: props.salaryID,                   
                    grosSalary: data.sum_gross,
                    netSalary: data.sum_net
                })
            }else{
                //this.props.addSnackbar({icon:"report_problem",text:"Ceva nu a functionat"})
            }                
        })
    }

    //update taxes
    let reacalculateTaxesWithThis=(event)=>{      
        for(let i=0; i< taxes.length; i++){
            if(taxes[i].key===event.target.name){
                let taxesCopy = [...taxes]
                taxesCopy[i].value = event.target.value
                setTaxes(taxesCopy)
                break
            }
        }        
    }

    //calculate net salary
    let calculateNet=()=>{
        if(employeeInfo!==null){
            let onePercentOfGross = parseFloat(employeeInfo.grosSalary/100)
            setEmployeeInfo({...employeeInfo, netSalary: parseFloat(employeeInfo.grosSalary-(onePercentOfGross*taxes[0].value + onePercentOfGross*taxes[1].value + onePercentOfGross*taxes[2].value))})        
        }       
    }

    return(
        <div> 
            {employeeInfo!==null&&
            <div className="p-3" style={{display:'flex', flexDirection:'row'}}>
                <div className="col-md-7 col-lg-6 p-2">
                    <h6>Informatii angajat</h6>
                    <form onSubmit={handleSubmit}>
                        <div class="row g-2">
                            <div class="col-md">
                                <div class="form-floating mb-3">
                                    <input type="text" placeholder="Nume" className="form-control" id="firstName" value={employeeInfo.employeeName} disabled={true} required=""></input>
                                    <label for="firstName" className="form-label">Nume</label>
                                </div>
                            </div>
                            <div class="col-md">
                                <div class="form-floating mb-3">
                                    <input type="text" className="form-control" id="lastName" placeholder="Prenume" value={employeeInfo.employeeLastName} disabled={true} required=""></input>
                                    <label for="lastName" className="form-label">Prenume</label>
                                </div>
                            </div>
                        </div>      
                        <div className="row g-2">
                            <div className="col-md">
                                <div class="form-floating mb-3">                                                    
                                    <select className="form-select" placeholder="Luna" id="paid_for" required="" ref={salaryMonth}>
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
                                    <input type="text" className="form-control" id="paid_for_year" placeholder="An" value={currentYear} ref={salaryYear}></input>
                                    <label for="paid_for_year" className="form-label">Anul</label>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div class="form-floating mb-3">                                                 
                                <input type="text" className="form-control" id="bankref" placeholder="ID bancar" ref={bankRef}></input>
                                <label for="bankref" className="form-label">ID tranzactie bancara</label>
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div class="form-floating mb-3">                                                 
                                <input type="text" disabled={true} value={`${employeeInfo.grosSalary} RON`} className="form-control" id="salariu_brut" placeholder="Salariu de baza"></input>
                                <label for="bankref" className="form-label">Salariu de baza</label>
                            </div>
                        </div>
                        <button className="btn btn-light btn-sm mt-3" type="submit"><span class="action-button-label"><span class="material-icons-outlined">check</span>Salvare</span></button>
                    </form>
                </div>
                <div className="col-md-5 col-lg-6 order-md-last p-2">
                    <ul className="list-group mb-3">
                        {
                            taxes.map(element=>(
                                <li className="list-group-item d-flex justify-content-between lh-sm">
                                <div>
                                    <h6 className="my-0">{element.key}</h6>
                                    <small className="text-muted">{element.description}</small><br/>
                                    <small className="text-muted"><b>{parseFloat(employeeInfo.grosSalary/100)*parseFloat(element.value)} RON</b></small>
                                </div>
                                <div>
                                    <br/>
                                    <div class="input-group">                                                    
                                        <input type="text" className="form-control shadow-none" style={{width:'50px', padding:'2px'}} value={element.value} onChange={reacalculateTaxesWithThis} name={element.key}></input>
                                        <span class="input-group-text" style={{padding:'2px'}}>%</span>
                                    </div>                                                    
                                </div>  
                            </li> 
                            ))
                        }
                        <li className="list-group-item d-flex justify-content-between">
                            <span>Net</span>
                            <strong>{employeeInfo.netSalary} RON</strong>
                        </li>                               
                    </ul>
                </div>
            </div>}
        </div>              
    )
}

export default SalaryForm