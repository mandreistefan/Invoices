import './App.css';
import React from 'react';
import SideNavigation from './SideNavigation'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesComponent.jsx'
import FinancialComponent from './FinancialComponent/FinancialComponent.jsx'
import Products from './PredefinedProducts/PredefinedProducts.jsx'

export default class App extends React.Component {

constructor(props) {
  super(props);
  this.state = {
    activeComponent: 0
  };
}

setAsActive = (option) =>{
  this.setState({activeComponent: parseInt(option)})
}

render()
  {
    return(
      <div className="app-container">
        <SideNavigation setAsActive={this.setAsActive}/>
        <div className="app-content">
          {this.state.activeComponent===0 && <ClientsComponent/>}
          {this.state.activeComponent===1 && <InvoicesComponent/>}
          {this.state.activeComponent===2 && <Products/>}
          {this.state.activeComponent===3 && <FinancialComponent/>}
        </div>        
      </div>
    )
  }

}



