import {useState, useEffect} from "react";
import "./clientform.css"
import Snackbar from '../Snackbar/Snackbar.jsx'

let TheClientForm = (props)=>{

    let [data, setTheData]=useState({
        client_fiscal_1_input: (props.userData) ? props.userData.client_fiscal_1 : "-", 
        client_fiscal_2_input: (props.userData) ? props.userData.client_fiscal_2 : "-", 
        client_type_input: (props.userData) ? props.userData.client_type : "pers", 
        client_first_name_input: (props.userData) ? props.userData.client_first_name : "", 
        client_last_name_input:  (props.userData) ? props.userData.client_last_name : "", 
        client_phone_input: (props.userData) ? props.userData.client_phone : "", 
        client_email_input: (props.userData) ? props.userData.client_email : "", 
        client_county_input: (props.userData) ? props.userData.client_county : "", 
        client_city_input: (props.userData) ? props.userData.client_city : "", 
        client_street_input: (props.userData) ? props.userData.client_street : "", 
        client_adress_number_input: (props.userData) ? props.userData.client_adress_number : "", 
        client_zip_input: (props.userData) ? props.userData.client_zip : "",
        client_notes_input: (props.userData) ? props.userData.client_notes : ""
    })

    let [alertUser, setAlertUser] = useState({text: null})
    let [fieldsDisabled, setFieldsDisabled] = useState(false)
    let [invalidDataItems, setInvalidData] = useState([])
    let [dataModified, setdataModified] = useState(false)

    useEffect(()=>{

        /*takes three props: 
            editable is true if fields cand be edited/ filled with new data
            isSubmitable is true if the component submits the form data (when editing a user or when adding a new user)
            clientID is used to load client data from the database
        */

        if(props.editable) setFieldsDisabled(props.editable)

        //preset data
        if(props.userData){
            setTheData({
                client_fiscal_1_input: (props.userData) ? props.userData.client_fiscal_1 : "", 
                client_fiscal_2_input: (props.userData) ? props.userData.client_fiscal_2 : "", 
                client_type_input: (props.userData) ? props.userData.client_type : "", 
                client_first_name_input: (props.userData) ? props.userData.client_first_name : "", 
                client_last_name_input:  (props.userData) ? props.userData.client_last_name : "", 
                client_phone_input: (props.userData) ? props.userData.client_phone : "", 
                client_email_input: (props.userData) ? props.userData.client_email : "", 
                client_county_input: (props.userData) ? props.userData.client_county : "", 
                client_city_input: (props.userData) ? props.userData.client_city : "", 
                client_street_input: (props.userData) ? props.userData.client_street : "", 
                client_adress_number_input: (props.userData) ? props.userData.client_adress_number : "", 
                client_zip_input: (props.userData) ? props.userData.client_zip : ""
            })
        //just an ID, fetch the data from the DB
        }else if(props.clientID!=null){
            setClientData(props.clientID)            
        }        
    },[props.clientID, props.userData])

    //for a client ID, retrieve and set form data
    let setClientData=(ID)=>{
        fetch(`http://localhost:3000/clients?filter=id&filterBy=${ID}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                let clientData = data.data[0];
                let prettyData = {
                    client_fiscal_1_input: (clientData) ? clientData.client_fiscal_1 : "", 
                    client_fiscal_2_input: (clientData) ? clientData.client_fiscal_2 : "", 
                    client_type_input: (clientData) ? clientData.client_type : "", 
                    client_first_name_input: (clientData) ?  clientData.client_first_name: "",
                    client_last_name_input: (clientData) ?  clientData.client_last_name: "", 
                    client_phone_input: (clientData) ?  clientData.client_phone: "", 
                    client_email_input: (clientData) ?  clientData.client_email: "", 
                    client_county_input: (clientData) ?  clientData.client_county: "", 
                    client_city_input: (clientData) ?  clientData.client_city: "", 
                    client_street_input: (clientData) ?  clientData.client_street: "", 
                    client_adress_number_input: (clientData) ?  clientData.client_adress_number: "", 
                    client_zip_input: (clientData) ?  clientData.client_zip: "",
                    client_notes_input: (clientData) ?  clientData.client_notes: ""
                } 
                setTheData(prettyData)
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text:"Baza de date nu poate fi accesata"})
            }else{
                setAlertUser({text:"Eroare"})
            }
        })
    }

    //small validations at submit
    let newClientDataValid=(event)=>{
        let invalidDataArray=[];
        //first name
        if(event.target.client_first_name.value.length===0){
            console.log("Invalid data for first name")
            invalidDataArray.push("client_first_name")
        }
        //phone number have data
        if(event.target.client_phone.value.length!==10){
            console.log("Invalid data for phone")
            invalidDataArray.push("client_phone")
        }
        //email - only if filled       
        if(event.target.client_email.value.length>0){
            if((event.target.client_email.value.indexOf("@")===-1)||(event.target.client_email.value.indexOf(".")==-1)){
                console.log("Invalid data for email")
            }
        }
        //county
        if(event.target.client_county.value.length===0){
            console.log("Invalid data for county")
            invalidDataArray.push("client_county")
        }
        //city
        if(event.target.client_city.value.length===0){
            console.log("Invalid data for city")
            invalidDataArray.push("client_city")
        }
        //street
        if(event.target.client_street.value.length===0){
            console.log("Invalid data for street")
            invalidDataArray.push("client_street")
        }
        if(invalidDataArray.length>0){
            setInvalidData(invalidDataArray)
            return false
        }
        //all good
        setInvalidData([])
        return true
    }

    //validates only an key input
    let validateInput = (who, what, where) => {
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        switch(who){
            case "client_phone":
                //only numbers
                if(validNumber.test(what)){
                    setTheData({...data,[where]:what})
                    return true
                }
                return false
            case "client_zip":
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
        setdataModified(true)
    }

    //send data to the server - update if existing client, create if non-existent
    let submitClientData = (event) =>{ 
        //prevent default submit
        event.preventDefault()

        let clientID = (props.clientID) ? props.clientID : null;
        //update a client logic
        if(clientID){
            let dataToBeSent ={}
            if(event.target.client_type.value==="comp"){
                if(event.target.client_fiscal_1.attributes.modified.value==="true") dataToBeSent.client_fiscal_1=event.target.client_fiscal_1.value
                if(event.target.client_fiscal_2.attributes.modified.value==="true") dataToBeSent.client_fiscal_2=event.target.client_fiscal_2.value
            }      
            if(event.target.client_type.attributes.modified.value==="true") dataToBeSent.client_type=event.target.client_type.value
            if(event.target.client_first_name.attributes.modified.value==="true") dataToBeSent.client_first_name=event.target.client_first_name.value
            if(event.target.client_last_name.attributes.modified.value==="true") dataToBeSent.client_last_name=event.target.client_last_name.value
            if(event.target.client_phone.attributes.modified.value==="true") dataToBeSent.client_phone=event.target.client_phone.value
            if(event.target.client_email.attributes.modified.value==="true") dataToBeSent.client_email=event.target.client_email.value
            if(event.target.client_county.attributes.modified.value==="true") dataToBeSent.client_county=event.target.client_county.value
            if(event.target.client_city.attributes.modified.value==="true") dataToBeSent.client_city=event.target.client_city.value
            if(event.target.client_street.attributes.modified.value==="true") dataToBeSent.client_street=event.target.client_street.value
            if(event.target.client_adress_number.attributes.modified.value==="true") dataToBeSent.client_adress_number=event.target.client_adress_number.value
            if(event.target.client_zip.attributes.modified.value==="true") dataToBeSent.client_zip=event.target.client_zip.value       
            if(event.target.client_notes.attributes.modified.value==="true") dataToBeSent.client_notes=event.target.client_notes.value
    
            fetch(`http://localhost:3000/clients`, {
                method:"PUT",
                headers: { 'Content-Type': 'application/json' },
                body:JSON.stringify({
                    clientID:props.clientID,
                    dataToBeUpdated:dataToBeSent
                })
            })
            .then(response=>response.json())
            .then(data=>{
                if(data.status==="OK"){
                    setAlertUser({text:"Client updated"})
                    setdataModified(false)
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
            if(newClientDataValid(event)){
                fetch(`http://localhost:3000/clients`, {
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body:JSON.stringify({
                        client_fiscal_1: data.client_type_input==="comp" ? data.client_fiscal_1_input: null,
                        client_fiscal_2: data.client_type_input==="comp" ? data.client_fiscal_2_input: null,
                        client_type: data.client_type_input, 
                        client_first_name: data.client_first_name_input,
                        client_last_name: data.client_last_name_input,
                        client_phone: data.client_phone_input,
                        client_email: data.client_email_input,
                        client_county: data.client_county_input, 
                        client_city: data.client_city_input, 
                        client_street: data.client_street_input, 
                        client_adress_number: data.client_adress_number_input, 
                        client_zip: data.client_zip_input,
                        client_notes: data.client_notes_input
                    })
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.status==="OK"){
                        setClientData(data.data)
                        setFieldsDisabled(false) 
                        setAlertUser({text:"Client inregistrat"})
                        setdataModified(false)
                    }else if(data.status==="SERVER_ERROR"){
                        setAlertUser({text:"Baza de date nu poate fi accesata"})
                    }else{
                        setAlertUser({text:"Eroare"})
                    }
                })
                .catch(error=>{
                    setAlertUser({text:"Eroare"})
                })
        }else{
            setAlertUser({text:"Datele sunt invalide"})
        }
        } 
    }

    return(            
        <div className={(props.isSubmitable===true) ? "form-container" : ""}> 
            {(props.isSubmitable===true) ? 
            <form onSubmit={submitClientData} id="client_form" name="client_form">
                <div className='form-row'>
                    <div className="form-group col-md-4">
                        <label className="form-subsection-label" htmlFor="client_type">Tip client</label><br/>               
                        <select className="form-control form-control shadow-none" id="client_type" name="client_type"disabled={(fieldsDisabled===false) ?  true: false} modified="false" autoComplete="off" onChange={changeFormData} value={data.client_type_input}>
                            <option value="pers">Persoana fizica</option>
                            <option value="comp">Companie</option>
                        </select>  
                    </div>
                    {data.client_type_input==="comp" && 
                        <div className="form-group col-md-4">            
                            <label className="form-subsection-label" htmlFor="client_fiscal_1">Nr. Reg. Com</label><br/>
                            <input type="text" id="client_fiscal_1" name="client_fiscal_1" disabled={(fieldsDisabled===false ? true: false || data.client_type_input==="pers")} className={invalidDataItems.includes("client_fiscal_1") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" autoComplete="off" onChange={changeFormData} value={data.client_fiscal_1_input}/>
                        </div>
                    }
                    {data.client_type_input==="comp" && 
                        <div className="form-group col-md-4">   
                            <label className="form-subsection-label" htmlFor="client_fiscal_2">CIF</label><br/>
                            <input type="text" id="client_fiscal_2" name="client_fiscal_2" disabled={(fieldsDisabled===false ?  true: false || data.client_type_input==="pers")} className={invalidDataItems.includes("client_fiscal_2") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_fiscal_2_input}/>
                        </div>
                    }
                </div>

                <div className='form-row'>
                    <div className="form-group col-md-3">            
                        <label className="form-subsection-label" htmlFor="client_first_name">Nume/ Nume companie</label><br/>
                        <input type="text" id="client_first_name" name="client_first_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_first_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" autoComplete="off" onChange={changeFormData} value={data.client_first_name_input}/>
                    </div>
                    <div className="form-group col-md-3">   
                        <label className="form-subsection-label" htmlFor="client_last_name">Prenume (persoane fizice)</label><br/>
                        <input type="text" id="client_last_name" name="client_last_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_last_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_last_name_input}/>
                    </div>
                    <div className="form-group col-md-3">  
                        <label className="form-subsection-label" htmlFor="client_phone">Telefon*</label><br/>
                        <input type="text" id="client_phone" name="client_phone" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_phone") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_phone_input}/>
                    </div>
                    <div className="form-group col-md-3">   
                        <label className="form-subsection-label" htmlFor="client_email">Adresa email</label><br/>
                        <input type="email" id="client_email" name="client_email" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_email") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_email_input}/>
                    </div>
                </div>
                <div className='form-row'>
                    <div className="form-group col-md-2">  
                        <label className="form-subsection-label" htmlFor="client_county">Judet*</label><br/>
                        <input type="text" id="client_county" name="client_county" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_county") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_county_input}/>
                    </div>
                    <div className="form-group col-md-2">   
                        <label className="form-subsection-label" htmlFor="client_city">Oras*</label><br/>
                        <input type="text" id="client_city" name="client_city" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_city") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_city_input}/>
                    </div>
                    <div className="form-group col-md-4">   
                        <label className="form-subsection-label" htmlFor="client_street">Strada*</label><br/>
                        <input type="text" id="client_street" name="client_street" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_street") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_street_input}/>
                    </div>
                    <div className="form-group col-md-2">   
                        <label className="form-subsection-label" htmlFor="client_adress_number">Numar</label><br/>
                        <input type="text" id="client_adress_number" name="client_adress_number" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_adress_number") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_adress_number_input}/>
                    </div>
                    <div className="form-group col-md-2">   
                        <label className="form-subsection-label" htmlFor="client_zip">ZIP</label><br/>
                        <input type="text" id="client_zip" name="client_zip" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_zip") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_zip_input}/>
                    </div>
                </div>
                <div className='form-row'>
                    <div className="form-group col-md-12">   
                        <label className="form-subsection-label" htmlFor="client_notes">Informatii aditionale:</label><br/>
                        <textarea id="client_notes" name="client_notes" rows="4" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_notes") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_notes_input}></textarea>
                    </div>
                </div>
                <button id="edit-client-data" className="btn btn-primary" disabled={dataModified ? false:true}><span className="action-button-label">SALVARE</span></button>
            </form> : 
            <div>
                <div className='form-row'>
                    <div className="form-group col-md-3">
                        <label className="form-subsection-label" htmlFor="client_type">Tip client</label><br/>               
                        <select className="form-control form-control shadow-none" id="client_type" name="client_type"disabled={(fieldsDisabled===false) ?  true: false} modified="false" autoComplete="off" onChange={changeFormData} value={data.client_type_input}>
                            <option value="pers">Persoana fizica</option>
                            <option value="comp">Companie</option>
                        </select>  
                    </div>
                    {data.client_type_input==="comp" && 
                        <div className="form-group col-md-3">            
                            <label className="form-subsection-label" htmlFor="client_fiscal_1">Nr. Reg. Com</label><br/>
                            <input type="text" id="client_fiscal_1" name="client_fiscal_1" disabled={(fieldsDisabled===false ? true: false || data.client_type_input==="pers")} className={invalidDataItems.includes("client_fiscal_1") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" autoComplete="off" onChange={changeFormData} value={data.client_fiscal_1_input}/>
                        </div>
                    }
                    {data.client_type_input==="comp" && 
                        <div className="form-group col-md-3">   
                            <label className="form-subsection-label" htmlFor="client_fiscal_2">CIF</label><br/>
                            <input type="text" id="client_fiscal_2" name="client_fiscal_2" disabled={(fieldsDisabled===false ?  true: false || data.client_type_input==="pers")} className={invalidDataItems.includes("client_fiscal_2") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_fiscal_2_input}/>
                        </div>
                    }
                </div>

                <div className='form-row'>
                    <div className="form-group col-md-3">            
                        <label className="form-subsection-label" htmlFor="client_first_name">Nume/ Nume companie</label><br/>
                        <input type="text" id="client_first_name" name="client_first_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_first_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" autoComplete="off" onChange={changeFormData} value={data.client_first_name_input}/>
                    </div>
                    <div className="form-group col-md-3">   
                        <label className="form-subsection-label" htmlFor="client_last_name">Prenume (persoane fizice)</label><br/>
                        <input type="text" id="client_last_name" name="client_last_name" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_last_name") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_last_name_input}/>
                    </div>
                    <div className="form-group col-md-3">  
                        <label className="form-subsection-label" htmlFor="client_phone">Telefon*</label><br/>
                        <input type="text" id="client_phone" name="client_phone" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_phone") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_phone_input}/>
                    </div>
                    <div className="form-group col-md-3">   
                        <label className="form-subsection-label" htmlFor="client_email">Adresa email</label><br/>
                        <input type="email" id="client_email" name="client_email" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_email") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_email_input}/>
                    </div>
                </div>
                <div className='form-row'>
                    <div className="form-group col-md-2">  
                        <label className="form-subsection-label" htmlFor="client_county">Judet*</label><br/>
                        <input type="text" id="client_county" name="client_county" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_county") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_county_input}/>
                    </div>
                    <div className="form-group col-md-2">   
                        <label className="form-subsection-label" htmlFor="client_city">Oras*</label><br/>
                        <input type="text" id="client_city" name="client_city" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_city") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_city_input}/>
                    </div>
                    <div className="form-group col-md-4">   
                        <label className="form-subsection-label" htmlFor="client_street">Strada*</label><br/>
                        <input type="text" id="client_street" name="client_street" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_street") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_street_input}/>
                    </div>
                    <div className="form-group col-md-2">   
                        <label className="form-subsection-label" htmlFor="client_adress_number">Numar</label><br/>
                        <input type="text" id="client_adress_number" name="client_adress_number" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_adress_number") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_adress_number_input}/>
                    </div>
                    <div className="form-group col-md-2">   
                        <label className="form-subsection-label" htmlFor="client_zip">ZIP</label><br/>
                        <input type="text" id="client_zip" name="client_zip" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_zip") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_zip_input}/>
                    </div>
                </div>
                <div className='form-row'>
                    <div className="form-group col-md-12">   
                        <label className="form-subsection-label" htmlFor="client_notes">Informatii aditionale:</label><br/>
                        <textarea id="client_notes" name="client_notes" rows="4" disabled={(fieldsDisabled===false) ?  true: false} className={invalidDataItems.includes("client_notes") ? "form-control shadow-none invalid-data" : "form-control shadow-none"} modified="false" onChange={changeFormData} value={data.client_notes_input}></textarea>
                    </div>
                </div>
            </div>
            }
            
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>   
        </div>
    )       
}

export default TheClientForm;
