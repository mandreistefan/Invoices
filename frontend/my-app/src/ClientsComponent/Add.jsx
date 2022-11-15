import React from 'react';
import './AddCustomer.css';
import ClientForm from '../ClientForm/ClientForm.jsx';

let Add = (props) =>{

    let submitNewClient = (event) =>{
        event.preventDefault()
        fetch("http://localhost:3000/clients", {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_first_name: event.target.client_first_name.value,
                client_last_name: event.target.client_last_name.value,
                client_county: event.target.client_county.value, 
                client_city: event.target.client_city.value, 
                client_street: event.target.client_street.value, 
                client_adress_number: event.target.client_adress_number.value, 
                client_zip: event.target.client_zip.value, 
                client_email: event.target.client_email.value,
                client_phone: event.target.client_phone.value,
                client_notes: event.target.client_notes.value
            })
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                alert("Client registered")
            }else if(data.status==="SERVER_ERROR"){
                alert("Baza de date nu poate fi accesata")
            }else{
                alert("Failed to register client")
            }
        })
    }

    return(          
        <div>
            <div className="overlapping-component-inner">
                <div style={{width: "100%",height:"40px",padding:"5px"}}>
                    <button style={{float: "right"}} type="button" className="action-red-button" onClick={()=>{props.setDisplay(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                </div>
                <ClientForm title={"Add client"}/>
            </div>
            <div className="blur-overlap"></div>  
        </div>
    )
}

export default Add;