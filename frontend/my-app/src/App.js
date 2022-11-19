import './App.css';
import React from 'react';
import SideNavigation from './SideNavigation'
import ClientsComponent from './ClientsComponent/ClientsComponent.jsx'
import InvoicesComponent from './InvoiceComponent/InvoicesOverview'
import Settings from './Settings/SettingsComponent.jsx'
import Employees from './Employees/Employees.jsx'
import Admins from './Admins/AdminsOverview.jsx'

export default class App extends React.Component {

constructor(props) {
  super(props);
  this.state = {
    activeComponent: null,
    settingsShown: false
  };
}

setAsActive = (option) =>{
  this.setState({activeComponent: parseInt(option)})
}

openUserMenu=(aBool)=>{
  this.setState({settingsShown:aBool})
}

render()
  {
    return(
      <div style={{display:'flex', flexDirection:'row'}}>  
          <SideNavigation setAsActive={this.setAsActive} openUserMenu={this.openUserMenu}/>
          <div> 
            {this.state.activeComponent===0 && <ClientsComponent/>}
            {this.state.activeComponent===1 && <InvoicesComponent/>}
            {this.state.activeComponent===2 && <Admins/>}
            {this.state.activeComponent===4 && <Settings/>}
            {this.state.activeComponent===6 && <Employees/>}
            {this.state.settingsShown&&
                <div>
                  <div className="blur-overlap"></div>     
                  <button type="button" className="action-close-window" onClick={()=>{this.setState({settingsShown:false})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                  <div className="overlapping-component-inner">
                      <Settings/>
                  </div>
              </div>
            }
        </div>
      </div>
    )
  }

}



