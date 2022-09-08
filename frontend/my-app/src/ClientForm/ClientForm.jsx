import React from "react";
import "./clientform.css"
import Snackbar from '../Snackbar/Snackbar.jsx'

let TheClientForm = (props)=>{

    let [data, setTheData]=React.useState({
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

    let [alertUser, setAlertUser] = React.useState({text: null})
    let [clientID, setclientid] = React.useState(null)
    let [fieldsDisabled, setFieldsDisabled] = React.useState(false)

    React.useEffect(()=>{

        /*takes three props: 
            editable is true if fields cand be edited/ filled with new data
            isSubmitable is true if the component submits the form data (when editing a user or when adding a new user)
            clientID is used to load client data from the database
        */

        if(props.clientID!=null) setclientid(props.clientID)
        if(props.editable) setFieldsDisabled(props.editable)

        //preset data
        if(props.userData){
            setTheData({
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
        fetch(`/clients/?filter=id&filterBy=${ID}`,
        {
            method:"GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
            let clientData = data.data[0];
            let prettyData = {
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
        })
    }

    //small valdiations at submit
    let newClientDataValid=()=>{
        let validatingThis;
        //first name
        validatingThis=document.getElementById("client_first_name").value
        if(validatingThis.length==0){
            console.log("Invalid data for first name")
            return false
        }
        //last name
        validatingThis=document.getElementById("client_last_name").value
        if(validatingThis.length==0){
            console.log("Invalid data for last name")
            return false
        }
        //phone name
        validatingThis=document.getElementById("client_phone").value
        if(validatingThis.length!=10){
            console.log("Invalid data for phone")
            return false
        }
        //email - only if filled
        validatingThis=document.getElementById("client_email").value        
        if(validatingThis.length>0){
            if((validatingThis.indexOf("@")==-1)||(validatingThis.indexOf(".")==-1)){
                console.log("Invalid data for email")
                return false
            }
        }
        //last name
        validatingThis=document.getElementById("client_county").value
        if(validatingThis.length==0){
            console.log("Invalid data for county")
            return false
        }
        //last name
        validatingThis=document.getElementById("client_city").value
        if(validatingThis.length==0){
            console.log("Invalid data for city")
            return false
        }
        //last name
        validatingThis=document.getElementById("client_street").value
        if(validatingThis.length==0){
            console.log("Invalid data for street")
            return false
        }
        //all good
        return true
    }

    //validates only an key input
    let validateInput = (who, what, where) => {
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        switch(who){
            case "client_phone":
                if(validNumber.test(what)){
                    setTheData({...data,[where]:what})
                    return true
                }
                return false
            case "client_zip":
                if(validNumber.test(what)){
                    setTheData({...data,[where]:what})
                    return true
                }
                return false
            case "client_adress_number":
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

    //register a new client
    let submitNewClient = () =>{
            if(newClientDataValid()){
                fetch(`/clients`, {
                    method:"POST",
                    headers: { 'Content-Type': 'application/json' },
                    body:JSON.stringify({
                        client_first_name: document.getElementById("client_first_name").value,
                        client_last_name: document.getElementById("client_last_name").value,
                        client_phone: document.getElementById("client_phone").value,
                        client_email: document.getElementById("client_email").value,
                        client_county: document.getElementById("client_county").value, 
                        client_city: document.getElementById("client_city").value, 
                        client_street: document.getElementById("client_street").value, 
                        client_adress_number: document.getElementById("client_adress_number").value, 
                        client_zip: document.getElementById("client_zip").value,
                        client_notes: document.getElementById("client_notes").value
                    })
                })
                .then(response=>response.json())
                .then(data=>{
                    if(data.status==="OK"){
                        setClientData(data.data)
                        setclientid(data.data)  
                        setFieldsDisabled(false) 
                        setAlertUser({text:"Client registered"})
                    }else{
                        setAlertUser({text:"Something went wrong"})
                    }
                })
            }
        else{
            setAlertUser({text:"Invalid client data"})
        }

    }

    //edit the data for a registered client
    let updateExistingClient = () =>{
        let dataToBeSent ={}
        if(document.getElementById("client_first_name").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_first_name=document.getElementById("client_first_name").value;
        if(document.getElementById("client_last_name").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_last_name=document.getElementById("client_last_name").value;
        if(document.getElementById("client_phone").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_phone=document.getElementById("client_phone").value;
        if(document.getElementById("client_email").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_email=document.getElementById("client_email").value;
        if(document.getElementById("client_county").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_county=document.getElementById("client_county").value;
        if(document.getElementById("client_city").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_city=document.getElementById("client_city").value;
        if(document.getElementById("client_street").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_street=document.getElementById("client_street").value;
        if(document.getElementById("client_adress_number").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_adress_number=document.getElementById("client_adress_number").value;
        if(document.getElementById("client_zip").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_zip=document.getElementById("client_zip").value;
        if(document.getElementById("client_phone").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_phone=document.getElementById("client_phone").value;          
        if(document.getElementById("client_notes").attributes.getNamedItem('modified').value==="true") dataToBeSent.client_notes=document.getElementById("client_notes").value; 

        fetch(`/clients`, {
            method:"POST",
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
            }else{
                setAlertUser({text:"Something went wrong"})
            }
        })
    }

    //send data to the server - update if existing client, create if non-existent
    let submitClientData = () =>{ 
        let clientID = (props.clientID) ? props.clientID : null;
        if(clientID){
            updateExistingClient()           
        }else{
            submitNewClient()
        } 
    }

    return(            
        <div> 
            <h5>{props.title}</h5>
            <div className='form-row'>
                <div className="form-group col-md-3">            
                    <label className="form-subsection-label" htmlFor="client_first_name">First name:</label><br/>
                    <input type="text" id="client_first_name" name="client_first_name" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" autoComplete="off" onChange={changeFormData} value={data.client_first_name_input}/>
                </div>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="client_last_name">Last name:</label><br/>
                    <input type="text" id="client_last_name" name="client_last_name" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_last_name_input}/>
                </div>
                <div className="form-group col-md-3">  
                    <label className="form-subsection-label" htmlFor="client_phone">Phone number:</label><br/>
                    <input type="text" id="client_phone" name="client_phone" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_phone_input}/>
                </div>
                <div className="form-group col-md-3">   
                    <label className="form-subsection-label" htmlFor="client_email">Email Adress:</label><br/>
                    <input type="email" id="client_email" name="client_email" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_email_input}/>
                </div>
            </div>
            <div className='form-row'>
                <div className="form-group col-md-2">  
                    <label className="form-subsection-label" htmlFor="client_county">County:</label><br/>
                    <input type="text" id="client_county" name="client_county" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_county_input}/>
                </div>
                <div className="form-group col-md-2">   
                    <label className="form-subsection-label" htmlFor="client_city">City:</label><br/>
                    <input type="text" id="client_city" name="client_city" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_city_input}/>
                </div>
                <div className="form-group col-md-4">   
                    <label className="form-subsection-label" htmlFor="client_street">Street:</label><br/>
                    <input type="text" id="client_street" name="client_street" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_street_input}/>
                </div>
                <div className="form-group col-md-2">   
                    <label className="form-subsection-label" htmlFor="client_adress_number">Number:</label><br/>
                    <input type="text" id="client_adress_number" name="client_adress_number" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_adress_number_input}/>
                </div>
                <div className="form-group col-md-2">   
                    <label className="form-subsection-label" htmlFor="client_zip">ZIP:</label><br/>
                    <input type="text" id="client_zip" name="client_zip" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_zip_input}/>
                </div>
            </div>
            <div className='form-row'>
                <div className="form-group col-md-12">   
                    <label className="form-subsection-label" htmlFor="client_notes">Client notes:</label><br/>
                    <textarea class="form-control" id="client_notes" name="client_notes" rows="2" disabled={(fieldsDisabled===false) ?  true: false} className="form-control shadow-none" modified="false" onChange={changeFormData} value={data.client_notes_input}></textarea>
                    
                </div>
            </div>
            {(props.isSubmitable===true) && <button id="edit-client-data" className="actions-button action-green-button"><span className="action-button-label" onClick={()=>{submitClientData()}}><span class="material-icons-outlined">save</span> SAVE</span></button>}
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>   
        </div>
    )       
}

export default TheClientForm;
