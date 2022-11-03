import React from "react";
import Clients from './Clients.jsx'
import './ClientsComponent.css'
import Invoice from '../InvoiceComponent/Invoice.jsx';
import ClientForm from '../ClientForm/ClientForm.jsx';

export default class ClientsComponent extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          showAddNewClient: false,
          searchField: "",
          searchResult: null,
          searchActionStatus: false,
          activeClient:null,
          activeClientName: null,
          currentElement: "overview"
        };
      }

    displayClientAdder = (bool) => {
        this.setState({showAddNewClient: bool})
    }  

    searchHandle = (event) =>{
        this.setState({searchField:event.target.value})
    }

    enableInvoiceApp = (clientName, clientID) =>{
        this.setState({
            activeClientName:clientName,
            activeClient:clientID
        })
    }

    //search - not implemented
    searchInDatabase = () =>{
        fetch("/search", {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({searchTerm:this.state.searchField})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                this.setState({
                    searchResult:data.data,
                    searchActionStatus: false
                })
            }else{

            }
        })
    }

    render(){
        return(
            <div>
                <div className="app-title-container">
                    <h4>Clienti</h4>
                    <div className="app-submenu-selector">
                        <button id="overview" disabled={this.state.currentElement==="overview" ? true:false} onClick={()=>{this.setState({currentElement: "overview"})}}><span className="button-label"><span className="material-icons-outlined">home</span>Overview</span></button>
                        <button id="add-client" disabled={this.state.currentElement==="addnew" ? true:false} onClick={()=>{this.setState({currentElement: "addnew"})}}><span className="button-label"><span className="material-icons-outlined">person_add</span>Client nou</span></button>
                    </div>
                </div>

                {this.state.currentElement==="overview"&&<Clients enableInvoiceApp={this.enableInvoiceApp}/>}
                {this.state.currentElement==="addnew"&&<ClientForm editable={true} isSubmitable={true} clientID={null}/>}
                {this.state.activeClient!=null && 
                    <div> 
                        <div className="blur-overlap"></div>     
                        <button type="button" className="action-close-window" onClick={()=>{this.enableInvoiceApp(false, null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        <div className="overlapping-component-inner">
                            <span><b>Factura noua pentru {this.state.activeClientName}</b></span>
                            <Invoice activeClient={this.state.activeClient} enableInvoiceApp={this.enableInvoiceApp}/>
                        </div>              
                    </div>
                }
            </div>
        )        
    }
}

