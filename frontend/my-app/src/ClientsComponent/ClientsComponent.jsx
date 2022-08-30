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
          billingScreenEnabled:false,
          activeClient:null
        };
      }

    displayClientAdder = (bool) => {
        this.setState({showAddNewClient: bool})
    }  

    searchHandle = (event) =>{
        this.setState({searchField:event.target.value})
    }

    enableInvoiceApp = (bool, clientID) =>{
        this.setState({
            billingScreenEnabled:bool,
            activeClient:clientID
        })
    }

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
                <div className="app-submenu-selector">
                    <button id="add-client" onClick={()=>{this.displayClientAdder(true)}}><span className="button-label"><span className="material-icons-outlined">add</span>Add client</span></button>
                </div>

                {this.state.showAddNewClient && 
                    <div> 
                        <div className="blur-overlap"></div>     
                        <div className="overlapping-component-inner">
                            <div className="overlapping-component-actions">
                                <span className="bd-lead">Invoice overview</span>
                                <button type="button" className="action-close-window" onClick={()=>{this.displayClientAdder(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                            </div>
                            <ClientForm editable={true} isSubmitable={true} clientID={null}/>
                        </div>              
                    </div>
                }

                <Clients enableInvoiceApp={this.enableInvoiceApp}/>

                {this.state.billingScreenEnabled===true && 
                    <div> 
                        <div className="blur-overlap"></div>     
                        <div className="overlapping-component-inner">
                            <div className="overlapping-component-actions">
                                <span className="bd-lead">Add a new invoice</span>
                                <button type="button" className="action-close-window" onClick={()=>{this.enableInvoiceApp(false, null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                            </div>
                            <Invoice activeClient={this.state.activeClient} enableInvoiceApp={this.enableInvoiceApp}/>
                        </div>              
                    </div>
                }
            </div>
        )        
    }
}

