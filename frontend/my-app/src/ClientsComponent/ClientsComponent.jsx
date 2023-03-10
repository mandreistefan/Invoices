import React from "react";
import Clients from './Clients.jsx'
import Invoice from '../InvoiceComponent/Invoice.jsx';

export default class ClientsComponent extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          showAddNewClient: false,
          searchField: "",
          searchResult: null,
          searchActionStatus: false,
          activeClient:null
        };
      }

    displayClientAdder = (bool) => {
        this.setState({showAddNewClient: bool})
    }  

    searchHandle = (event) =>{
        this.setState({searchField:event.target.value})
    }

    enableInvoiceApp = (clientID, first_name, last_name, phone, email, notes) =>{
        this.setState({
            activeClient: clientID,
            clientData: [first_name, last_name, phone, email, notes]
        })
    }

    render(){
        return(
            <div className="app-data-container">
                <Clients enableInvoiceApp={this.enableInvoiceApp}/>
                {this.state.activeClient!=null && 
                    <div> 
                        <div className="blur-overlap"></div>     
                        <button type="button" className="action-close-window" onClick={()=>{this.enableInvoiceApp(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        <div className="overlapping-component-inner">
                            <Invoice activeClient={this.state.activeClient} enableInvoiceApp={this.enableInvoiceApp}/>
                        </div>              
                    </div>
                }
            </div>
        )        
    }
}

