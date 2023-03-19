import {useState, useEffect} from "react";
import "./clientform.css"
import Snackbar from '../Snackbar/Snackbar.jsx'

let ClientForm = (props)=>{

    let [data, clientData]=useState({
        client_type: {value: "pers", modified: false, invalid: false}, 
        client_fiscal_1: {value: "", modified: false, invalid: false}, 
        client_fiscal_2: {value: "", modified: false, invalid: false}, 
        client_first_name: {value: "", modified: false, invalid: false}, 
        client_last_name:  {value: "", modified: false, invalid: false}, 
        client_phone: {value: "", modified: false, invalid: false}, 
        client_email: {value: "", modified: false, invalid: false},  
        client_county: {value: "", modified: false, invalid: false},  
        client_city: {value: "", modified: false, invalid: false}, 
        client_street: {value: "", modified: false}, 
        client_adress_number: {value: "", modified: false, invalid: false}, 
        client_zip: {value: "", modified: false, invalid: false}, 
        client_notes: {value: "", modified: false, invalid: false}, 
    })

    let [alertUser, setAlertUser] = useState({text: null})
    let [fieldsDisabled, setFieldsDisabled] = useState(false)
    let [clientID, setID] = useState (props.clientID ? props.clientID : null)

    useEffect(()=>{
        /*takes three props: 
            editable is true if fields cand be edited/ filled with new data
            isSubmitable is true if the component submits the form data (when editing a user or when adding a new user)
            clientID is used to load client data from the database
        */
        if(props.editable) setFieldsDisabled(!props.editable)
        //preset data
        if(props.userData){
            let shallowCopy = {...data}
            for (const [key, value] of Object.entries(shallowCopy)) {
                if(props.userData[key]) shallowCopy[key].value = props.userData[key]       
            }
            clientData(shallowCopy)
        //just an ID, fetch the data from the DB
        }else if(props.clientID!=null){
            fetch(`http://localhost:3000/clients?filter=id&filterBy=${clientID}`,
            {
                method:"GET",
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response=>response.json()).then(responseData=>{
                if(responseData.status==="OK"){
                    let shallowCopy = {...data}
                    for (const [key, value] of Object.entries(shallowCopy)) {
                        shallowCopy[key].value=responseData.data[0][key]
                    }
                    clientData(shallowCopy)
                }else if(responseData.status==="SERVER_ERROR"){
                    setAlertUser({text:"Baza de date nu poate fi accesata"})
                }else{
                    setAlertUser({text:"Eroare"})
                }
            })        
        }        
    },[])


    //small validations at submit
    let validateData=(who, what)=>{
        switch(who){
            //first name
            case "client_first_name":
                return what.length===0 ? false : true
            //phone number have data
            case "client_phone":
                return what.length!==10 ? false : true
            //email - only if filled       
            case "client_email":
                return what.length===0 ? false : true
            //county
            case "client_county":
                return what.length===0 ? false : true
            //city
            case "client_city":
                return what.length===0 ? false : true
            //street/
            case "client_street":
                return what.length===0 ? false : true
            default:
                return true
        }
    }

    //validates numbers
    let validateInput = (who, what) => {
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        switch(who){
            case "client_phone":
                //only numbers
                if(validNumber.test(what)){
                    return true
                }
                return false
            case "client_zip":
                //only numbers
                if(validNumber.test(what)){
                    return true
                }
                return false
            default:
                return true
        }
    }

    //whenever a input changes
    let changeFormData = (event)=>{
        let shallowCopy = {...data}
        let elementTrigger = `${event.target.name}`;
        if(validateInput(elementTrigger, event.target.value)){
            if(data[elementTrigger].modified===false) data[elementTrigger].modified = true
            data[elementTrigger].value=event.target.value        
            clientData(shallowCopy) 
        }       
    }

    //send data to the server - update if existing client, create if non-existent
    let submitClientData = (event) =>{ 
        //prevent default submit
        event.preventDefault()

        let clientID = (props.clientID) ? props.clientID : null;
        //update a client logic
        if(clientID){
            let dataToBeSent ={}
            let shallowCopy = {...data}
            for (const [key, value] of Object.entries(shallowCopy)) {
                if(shallowCopy[key].modified===true){
                    dataToBeSent[key] = shallowCopy[key].value
                    shallowCopy[key].modified=false
                }      
            }

            if(dataToBeSent.length===undefined) return false

            fetch(`http://localhost:3000/clients`, {
                method:"PUT",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({
                    clientID:props.clientID,
                    dataToBeUpdated:dataToBeSent
                })
            }).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setAlertUser({text:"Client updated"})
                }else if(data.status==="SERVER_ERROR"){
                    setAlertUser({text:"Baza de date nu poate fi accesata"})
                }else{
                    setAlertUser({text:"Eroare"})
                }
            }).catch(error=>{
                setAlertUser({text:"Eroare"})
            })       
        }else{
            //new client logic
            let flag = true
            let dataToBeSent={}
            let shallowCopy = {...data}
            for (const [key, value] of Object.entries(shallowCopy)) { 
                if(validateData(key, shallowCopy[key].value)) {
                    dataToBeSent[key] = shallowCopy[key].value
                    if(shallowCopy[key].invalid=true) shallowCopy[key].invalid=false 
                }else{
                    shallowCopy[key].invalid=true
                    flag=false
                }            
            }

            //at least one invalid element
            if(!flag){
                clientData(shallowCopy)
                return false
            }
            //no data to be sent
            if(dataToBeSent==={}) return false
            
            fetch(`http://localhost:3000/clients`, {
                method:"POST",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify(dataToBeSent)
            })
            .then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setAlertUser({text:"Client inregistrat"})
                    clientData(shallowCopy) 
                }else if(data.status==="SERVER_ERROR"){
                    setAlertUser({text:"Baza de date nu poate fi accesata"})
                }else{
                    setAlertUser({text:"Eroare"})
                }
            })
            .catch(error=>{
                setAlertUser({text:"Eroare"})
            })
        } 
    }

    return(            
        <div className={(props.editable===true) ? "form-container" : ""}>
            {data && 
            <form onSubmit={submitClientData} id="client_form" name="client_form" aria-disabled={props.editable ? "false" : "true"}>  
                <div class="form-floating  mb-3">
                    <select class="form-select" aria-label="Floating label select example" id="client_type" name="client_type" onChange={changeFormData} value={data.client_type.value} disabled={fieldsDisabled}>
                        <option value="pers">Persoana fizica</option>
                        <option value="comp">Companie</option>
                    </select>
                    <label for="floatingSelect">Tip client</label>
                </div>
                <div class="row g-2">
                    <div class="col-md">
                        <div class="form-floating mb-3">
                            <input type="text" className={data.client_first_name.invalid ? "form-control shadow-none is-invalid" : data.client_first_name.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_first_name" name="client_first_name" placeholder="Nume" onChange={changeFormData} value={data.client_first_name.value} disabled={fieldsDisabled}></input>
                            <label for="client_first_name">Nume</label>
                        </div>
                    </div>
                    <div class="col-md">
                        <div class="form-floating mb-3">
                            <input type="text" className={data.client_last_name.invalid ? "form-control shadow-none is-invalid" : data.client_last_name.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_last_name" name="client_last_name" placeholder="Prenume" onChange={changeFormData} value={data.client_last_name.value} disabled={fieldsDisabled}></input>
                            <label for="client_last_name">Prenume</label>
                        </div>
                    </div>
                </div>
                <div class="form-floating mb-3">
                    <input type="text" className={data.client_phone.invalid ? "form-control shadow-none is-invalid" : data.client_phone.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_phone" name="client_phone" placeholder="Telefon" onChange={changeFormData} value={data.client_phone.value} disabled={fieldsDisabled}></input>
                    <label for="client_phone">Telefon</label>
                </div>

                <div class="form-floating mb-3">
                    <input type="email" className={data.client_email.invalid ? "form-control shadow-none is-invalid" : data.client_email.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_email" name="client_email" placeholder="Mail" onChange={changeFormData} value={data.client_email.value} disabled={fieldsDisabled}></input>
                    <label for="client_email">Email</label>
                </div>

                <div class="row g-2">
                    <div class="col-md">
                        <div class="form-floating mb-3">
                            <input type="text" className={data.client_county.invalid ? "form-control shadow-none is-invalid" : data.client_county.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_county" name="client_county" placeholder="Judet" onChange={changeFormData} value={data.client_county.value} disabled={fieldsDisabled}></input>
                            <label for="client_county">Judet</label>
                        </div>
                    </div>
                    <div class="col-md">
                        <div class="form-floating mb-3">
                            <input type="text" className={data.client_city.invalid ? "form-control shadow-none is-invalid" : data.client_city.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_city" name="client_city" placeholder="Oras" onChange={changeFormData} value={data.client_city.value} disabled={fieldsDisabled}></input>
                            <label for="client_city">Oras</label>
                        </div>
                    </div>
                </div>

                <div class="row g-2">
                    <div class="col-md">
                        <div class="form-floating mb-3">
                            <input type="text" className={data.client_street.invalid ? "form-control shadow-none is-invalid" : data.client_street.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_street" name="client_street" placeholder="Strada" onChange={changeFormData} value={data.client_street.value} disabled={fieldsDisabled}></input>
                            <label for="client_street">Strada</label>
                        </div>
                    </div>
                    <div class="col-md">
                        <div class="form-floating mb-3">
                            <input type="text" className={data.client_adress_number.invalid ? "form-control shadow-none is-invalid" : data.client_adress_number.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_adress_number" name="client_adress_number" placeholder="Numar" onChange={changeFormData} value={data.client_adress_number.value} disabled={fieldsDisabled}></input>
                            <label for="client_adress_number">Numar</label>
                        </div>
                    </div>
                </div>
                <div class="form-floating mb-3">
                    <input type="text" className={data.client_zip.invalid ? "form-control shadow-none is-invalid" : data.client_zip.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_zip" name="client_zip" placeholder="Numar" onChange={changeFormData} value={data.client_zip.value} disabled={fieldsDisabled}></input>
                    <label for="client_zip">ZIP</label>
                </div>

                <div class="form-floating mb-3">
                    <textarea className={data.client_notes.invalid ? "form-control shadow-none is-invalid" : data.client_notes.modified ? "form-control shadow-none modified-data" : "form-control shadow-none"} id="client_notes" name="client_notes" placeholder="Informatii aditionale" onChange={changeFormData} value={data.client_notes.value} disabled={fieldsDisabled}></textarea>
                    <label for="client_notes">Informatii aditionale</label>
                </div>

                {props.editable && <button id="edit-client-data" class="btn btn-success btn-sm" ><span class="action-button-label"><span class="material-icons-outlined">check</span>Salvare</span></button>}
            </form>            
}
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>   
        </div>
    )       
}

export default ClientForm;
