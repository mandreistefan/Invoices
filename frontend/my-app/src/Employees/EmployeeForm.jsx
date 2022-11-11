import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

let EmployeeForm = (props)=>{

    let [data, setTheData]=React.useState({
        emp_first_name_input: "", 
        emp_last_name_input:  "", 
        emp_phone_input:  "", 
        emp_ident_no_input: "", 
        emp_adress_input: "", 
        emp_notes_input:  "",
        emp_job_name_input: "",
        emp_cur_salary_gross_input: "",
        emp_tax_input: 0,
    })

    let [alertUser, setAlertUser] = React.useState({text: null})
    let [fieldsDisabled, setFieldsDisabled] = React.useState(true)
    let [invalidDataItems, setInvalidData] = React.useState([])

    React.useEffect(()=>{
        if(props.employeeID) setEmployeeData(props.employeeID)
    },[props.clientID, props.userData])

    //for a client ID, retrieve and set form data
    let setEmployeeData=(ID)=>{
        fetch(`/employee/${ID}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                let employeeInfo = data.data.info[0]
                setTheData({
                    emp_first_name_input: employeeInfo.emp_first_name, 
                    emp_last_name_input:  employeeInfo.emp_last_name, 
                    emp_phone_input:  employeeInfo.emp_phone, 
                    emp_ident_no_input: employeeInfo.emp_ident_no, 
                    emp_adress_input: employeeInfo.emp_adress, 
                    emp_notes_input:  employeeInfo.emp_notes,
                    emp_job_name_input: employeeInfo.emp_job_name,
                    emp_cur_salary_gross_input: employeeInfo.emp_cur_salary_gross,
                    emp_tax_input: employeeInfo.emp_tax,
                    emp_notes: employeeInfo.emp_notes
                })
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Eroare"})
            }
        })
    }

    //small valdiations at submit
    let newemployeeDataValid=()=>{
        let validatingThis, invalidDataArray=[];        
        //all good
        setInvalidData([])
        return true
    }

    //validates only an key input
    let validateInput = (who, what, where) => {
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        switch(who){
            case "emp_phone":
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
            default:
                setTheData({...data,[where]:what})
                return true
        }
    }

    let changeFormData = (event)=>{
        let elementTrigger = `${event.target.name}`;
        let happenedIn = `${elementTrigger}_input`;
        if(validateInput(elementTrigger, event.target.value, happenedIn)){ 
            event.target.attributes.getNamedItem('modified').value=true;
        }
    }

    //register a new employee
    let submitNewEmployee = () =>{
            if(newemployeeDataValid()){
                fetch(`/employees`, {
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body:JSON.stringify({
                        emp_first_name: data.emp_first_name_input,
                        emp_last_name: data.emp_last_name_input,
                        emp_phone: data.emp_phone_input,
                        emp_ident_no: data.emp_ident_no_input, 
                        emp_adress: data.emp_adress_input, 
                        emp_notes: data.emp_notes_input,
                        emp_job_name: data.emp_job_name_input,
                        emp_cur_salary_gross: data.emp_cur_salary_gross_input,
                        emp_tax: data.emp_tax_input
                    })
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.status==="OK"){
                        setEmployeeData(data.data)
                        setFieldsDisabled(false) 
                        setAlertUser({text:"Employee registered"})
                    }else if(data.status==="SERVER_ERROR"){
                        setAlertUser({text:"Baza de date nu poate fi accesata"})
                    }else{
                        setAlertUser({text:"Something went wrong"})
                    }
                })
        }else{
            setAlertUser({text:"Invalid client data"})
        }

    }

    //edit the data for a registered client
    let updateExistingClient = () =>{
        let dataToBeSent ={}     
       
        if(document.getElementById("emp_first_name").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_first_name=document.getElementById("emp_first_name").value;
        if(document.getElementById("emp_last_name").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_last_name=document.getElementById("emp_last_name").value;
        if(document.getElementById("emp_ident_no").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_ident_no=document.getElementById("emp_ident_no").value;
        if(document.getElementById("emp_adress").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_adress=document.getElementById("emp_adress").value;
        if(document.getElementById("emp_phone").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_phone=document.getElementById("emp_phone").value;          
        if(document.getElementById("emp_job_name").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_job_name=document.getElementById("emp_job_name").value;          
        if(document.getElementById("emp_cur_salary_gross").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_cur_salary_gross=document.getElementById("emp_cur_salary_gross").value;          
        if(document.getElementById("emp_notes").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_notes=document.getElementById("emp_notes").value; 
        if(document.getElementById("emp_tax").attributes.getNamedItem('modified').value==="true") dataToBeSent.emp_notes=document.getElementById("emp_tax").value;          

        fetch(`/employees`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({
                employeeID:props.employeeID,
                dataToBeUpdated:dataToBeSent
            })
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAlertUser({text:"Client updated"})
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Something went wrong"})
            }
        })
    }

    //send data to the server - update if existing client, create if non-existent
    let submitemployeeData = () =>{ 
        if(props.employeeID){
            updateExistingClient()           
        }else{
            submitNewEmployee()
        } 
    }

    return(            
        <div className={(props.isSubmitable===true) ? "form-container" : ""}> 
            <h6>Date angajat</h6>
            <div className='form-row'>
                <div className="form-group col-md-3">            
                    <label className="form-subsection-label" htmlFor="emp_first_name">Nume</label><br/>
                    <input type="text" id="emp_first_name" name="emp_first_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_first_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" autoComplete="off" onChange={changeFormData} value={data.emp_first_name_input}/>
                </div>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="emp_last_name">Prenume</label><br/>
                    <input type="text" id="emp_last_name" name="emp_last_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_last_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_last_name_input}/>
                </div>
                <div className="form-group col-md-3">  
                    <label className="form-subsection-label" htmlFor="emp_phone">Telefon</label><br/>
                    <input type="text" id="emp_phone" name="emp_phone" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_phone") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_phone_input}/>
                </div>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="emp_ident_no">CNP</label><br/>
                    <input type="text" id="emp_ident_no" name="emp_ident_no" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_ident_no") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_ident_no_input}/>
                </div>
            </div>
            <div className='form-row'>
                <div className="form-group col-md-12">   
                    <label className="form-subsection-label" htmlFor="emp_adress">Adresa</label><br/>
                    <input type="text" id="emp_adress" name="emp_adress" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_adress") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_adress_input}/>
                </div>
            </div>
            <div className='form-row'>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="emp_job_name">Incadrare</label><br/>
                    <input type="text" id="emp_job_name" name="emp_job_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_job_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_job_name_input}/>
                </div>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="emp_cur_salary_gross">Salariu brut</label><br/>
                    <input type="text" id="emp_cur_salary_gross" name="emp_cur_salary_gross" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_cur_salary_gross") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_cur_salary_gross_input}/>
                </div>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="emp_cur_salary_gross">Se aplica impozit venit</label><br/>
                    <select id="emp_tax" name="emp_tax" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_tax") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_tax_input}>
                        <option value="1">Da</option>
                        <option value="0">Nu</option>
                    </select>                    
                </div>
            </div>
            <div className='form-row'>
                <div className="form-group col-md-12">   
                    <label className="form-subsection-label" htmlFor="emp_notes">Informatii aditionale:</label><br/>
                    <textarea class="form-control" id="emp_notes" name="emp_notes" rows="4" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("emp_notes") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.emp_notes_input}></textarea>
                </div>
            </div>
            <button id="edit-client-data" className="btn btn-sm btn-success actions-button"><span className="action-button-label" onClick={()=>{submitemployeeData()}}><span class="material-icons-outlined">save</span> SAVE</span></button>
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>   
        </div>
    )       
}

export default EmployeeForm;
