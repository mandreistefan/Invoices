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
          activeClientName: null
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

    render(){
        return(
            <div>
                <Clients enableInvoiceApp={this.enableInvoiceApp}/>
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

