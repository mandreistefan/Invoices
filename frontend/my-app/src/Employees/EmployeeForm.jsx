import {useState, useEffect} from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

let EmployeeForm = (props)=>{

    let [data, setTheData]=useState({
        emp_first_name: {value: "", modified: false, invalid: false}, 
        emp_last_name:  {value: "", modified: false, invalid: false}, 
        emp_phone:  {value: "", modified: false, invalid: false}, 
        emp_ident_no: {value: "", modified: false, invalid: false}, 
        emp_adress: {value: "", modified: false, invalid: false}, 
        emp_notes:  {value: "", modified: false, invalid: false},
        emp_job_name: {value: "", modified: false, invalid: false},
        emp_cur_salary_gross: {value: "", modified: false, invalid: false},
        emp_tax: {value: "0", modified: false, invalid: false}
    })

    let [alertUser, setAlertUser] = useState({text: null})
    let [fieldsDisabled, setFieldsDisabled] = useState(true)
    let [invalidDataItems, setInvalidData] = useState([])
    let [employeeID, setID] = useState(props.employeeID ?  props.employeeID : null)

    useEffect(()=>{
        if(props.employeeID){
            fetchEmployeeData()
        }
    },[])

    //for a client ID, retrieve and set form data
    let fetchEmployeeData=()=>{
        fetch(`http://localhost:3000/employee/${employeeID}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json()).then(responseData=>{
            if(responseData.status==="OK"){
                let employeeInfo = responseData.data.info[0]
                let employeesCopy = {...data}
                for(const[key, value] of Object.entries(employeesCopy)){
                    employeesCopy[key].value = employeeInfo[key]
                }
                setTheData(employeesCopy)
            }else if(responseData.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Eroare"})
            }
        })
    }

    //validates only an key input
    let validateInput = (who, what, where) => {
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        switch(who){
            case "emp_phone":
                if(what.length>10){
                    return false
                }
                //only numbers
                if(validNumber.test(what)){
                    setTheData({...data,[where]:what})
                    return true
                }
                return false
            case "emp_ident_no":
                //only numbers
                if(validNumber.test(what)){
                    setTheData({...data,[where]:what})
                    return true
                }
                return false
            case "emp_cur_salary_gross":
                //only numbers
                if(validNumber.test(what)){
                    setTheData({...data,[where]:what})
                    return true
                }
                return false
            default:
                setTheData({...data,[where]:what})
                return true
        }
    }

    let changeFormData = (event)=>{
        let shallowCopy = {...data}
        let elementTrigger = `${event.target.name}`;
        if(validateInput(elementTrigger, event.target.value)){
            if(data[elementTrigger].modified===false) data[elementTrigger].modified = true
            data[elementTrigger].value=event.target.value  
            setTheData(shallowCopy)          
        }
        
    }

    //register a new employee
    let submitNewEmployee = () =>{
            let dataToBeSent = {}
            let shallowCopy = {...data}
            let dataValidFlag = true

            if(shallowCopy.emp_first_name.value.length===0){
                shallowCopy.emp_first_name.invalid="Camp obligatoriu"
                dataValidFlag=false
            }

            
            if(shallowCopy.emp_last_name.value.length===0){
                shallowCopy.emp_last_name.invalid="Camp obligatoriu"
                dataValidFlag=false
            }

            if(shallowCopy.emp_phone.value.length===0){
                shallowCopy.emp_phone.invalid="Camp obligatoriu"
                dataValidFlag=false
            }

            if(shallowCopy.emp_job_name.value.length===0){
                shallowCopy.emp_job_name.invalid="Camp obligatoriu"
                dataValidFlag=false
            }

            if(shallowCopy.emp_cur_salary_gross.value.length===0){
                shallowCopy.emp_cur_salary_gross.invalid="Camp obligatoriu"
                dataValidFlag=false
            }

            if(dataValidFlag===false){
                setTheData(shallowCopy)
                return false
            }

            for (const [key, value] of Object.entries(shallowCopy)) {
                if(shallowCopy[key].modified===true){                        
                    shallowCopy[key].modified=false
                }   
                dataToBeSent[key] = shallowCopy[key].value  
            }

            if(dataToBeSent.length===0){
                setAlertUser({text:"Nu au fost introduse date"})
                return false
            }

            fetch(`http://localhost:3000/employees`, {
                method:"POST",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify(dataToBeSent)
            })
            .then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setAlertUser({text:"Angajat inregistrat"})
                    setID(data.data)
                }else if(data.status==="SERVER_ERROR"){
                    setAlertUser({text:"Baza de date nu poate fi accesata"})
                }else{
                    if(data.data==="INVALID_DATA"){
                        setAlertUser({text:"Datele sunt invalide"})
                    }else{
                        setAlertUser({text:"Ceva nu a functionat"})
                    }                    
                }
            })
    }

    //edit the data for a registered client
    let updateExistingClient = () =>{
        let dataToBeSent = {}
        let shallowCopy = {...data}
        for (const [key, value] of Object.entries(shallowCopy)) {
            if(shallowCopy[key].modified===true){                        
                shallowCopy[key].modified=false
                dataToBeSent[key] = shallowCopy[key].value
            }              
        }

        if(dataToBeSent==={}) return false

        fetch(`http://localhost:3000/employees`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({
                employeeID: employeeID,
                dataToBeUpdated: dataToBeSent
            })
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setAlertUser({text:"Angajat actualizat"})
                if(props.refreshParent) props.refreshParent()
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Eroare"})
            }
        }).catch(error=>{
            setAlertUser({text:"Eroare"})
        })
    }

    //send data to the server - update if existing client, create if non-existent
    let submitemployeeData = () =>{ 
        if(employeeID){
            updateExistingClient()           
        }else{
            submitNewEmployee()
        } 
    }

    return(            
        <div className={(props.isSubmitable===true) ? "form-container" : ""}> 
            <div class="row g-2   mb-3">
                <div class="col-md">
                    <div class="form-floating">
                        <input type="text"  placeholder="Name" id="emp_first_name" name="emp_first_name" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_first_name.invalid ? "form-control shadow-none is-invalid" : data.emp_first_name.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_first_name.value}/>
                        <label htmlFor="floatingInputGrid">Nume</label>
                        <div class="invalid-feedback">{data.emp_first_name.invalid}</div>
                    </div>
                </div>
                <div class="col-md">
                    <div class="form-floating">
                        <input type="text"  placeholder="Prenume" id="emp_last_name" name="emp_last_name" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_last_name.invalid  ? "form-control shadow-none is-invalid" :  data.emp_last_name.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_last_name.value}/>
                        <label htmlFor="floatingInputGrid">Prenume</label>
                        <div class="invalid-feedback">{data.emp_last_name.invalid}</div>
                    </div>
                </div>
            </div>

            <div class="form-floating  mb-3">
                <input type="text"  placeholder="Prenume" id="emp_phone" name="emp_phone" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_phone.invalid  ? "form-control shadow-none is-invalid" :  data.emp_phone.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_phone.value}/>
                <label htmlFor="floatingInputGrid">Telefon</label>
                <div class="invalid-feedback">{data.emp_phone.invalid}</div>
            </div>

            <div class="form-floating  mb-3">
                <input type="text"  placeholder="CNP" id="emp_ident_no" name="emp_ident_no" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_ident_no.invalid  ? "form-control shadow-none is-invalid" :  data.emp_ident_no.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_ident_no.value}/>
                <label htmlFor="floatingInputGrid">CNP</label>
                <div class="invalid-feedback">{data.emp_ident_no.invalid}</div>
            </div>

            <div class="form-floating  mb-3">
                <input type="text"  placeholder="Adresa" id="emp_adress" name="emp_adress" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_adress.invalid ? "form-control shadow-none is-invalid" :  data.emp_adress.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_adress.value}/>
                <label htmlFor="floatingInputGrid">Adresa</label>
                <div class="invalid-feedback">{data.emp_adress.invalid}</div>
            </div>

            <div class="form-floating  mb-3">
                <input type="text"  placeholder="Incadrare" id="emp_job_name" name="emp_job_name" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_job_name.invalid ? "form-control shadow-none is-invalid" :  data.emp_job_name.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_job_name.value}/>
                <label htmlFor="floatingInputGrid">Incadrare</label>
                <div class="invalid-feedback">{data.emp_job_name.invalid}</div>
            </div>

            <div class="row g-2">
                <div class="col-md">            
                    <div class="form-floating">
                        <input type="text"  placeholder="Salariu brut" id="emp_cur_salary_gross" name="emp_cur_salary_gross" disabled={(fieldsDisabled===false) ?  true: false} className={data.emp_cur_salary_gross.invalid ? "form-control shadow-none is-invalid" :  data.emp_cur_salary_gross.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_cur_salary_gross.value}/>
                        <label htmlFor="floatingInputGrid">Salariu brut</label>
                        <div class="invalid-feedback">{data.emp_cur_salary_gross.invalid}</div>
                    </div>
                </div>
                <div class="col-md">  
                    <div class="form-floating  mb-3">
                        <select class="form-select" aria-label="Floating label select example" id="emp_tax" name="emp_tax" onChange={changeFormData} value={data.emp_tax.value} disabled={(fieldsDisabled===false) ?  true: false}>
                            <option value="1">Da</option>
                            <option value="0">Nu</option>
                        </select>
                        <label htmlFor="floatingSelect">Impozit venit</label>
                    </div>
                </div>
            </div>

            <div class="form-floating  mb-3">
                <textarea rows="4" placeholder="Salariu brut" id="emp_notes" name="emp_notes" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_first_name") ? "form-control shadow-none is-invalid" :  data.emp_notes.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} autoComplete="off" onChange={changeFormData} value={data.emp_notes.value}/>
                <label htmlFor="emp_notes">Informatii aditionale</label>
            </div>
            <button className="btn btn-light mint-button" onClick={()=>{submitemployeeData()}} type="button" title="Editare angajat"><div class="inner-button-content"><span class="material-icons-outlined" style={{fontSize: '18px'}}>save</span>Salvare</div></button>
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>   
        </div>
    )       
}

export default EmployeeForm;
