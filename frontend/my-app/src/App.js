import './App.css';
import React from 'react';
import SideNavigation from './SideNavigation'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesComponent.jsx'
import FinancialComponent from './FinancialComponent/FinancialComponent.jsx'
import Products from './PredefinedProducts/PredefinedProducts.jsx'
import DatabaseOperations from './DatabaseOperations/DatabaseOperations.jsx'
import Expenses from './Expenses/Expenses.jsx'
import Employees from './Employees/Employees.jsx'

export default class App extends React.Component {

constructor(props) {
  super(props);
  this.state = {
    activeComponent: null
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
          {this.state.activeComponent===4 && <DatabaseOperations/>}
          {this.state.activeComponent===5 && <Expenses/>}
          {this.state.activeComponent===6 && <Employees/>}
        </div>        
      </div>
    )
  }

}



