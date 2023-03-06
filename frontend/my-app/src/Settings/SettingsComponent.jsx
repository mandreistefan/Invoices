import { useState} from "react";
import DatabaseOperations from './DatabaseOperations.jsx'

let SettingsComponent=(props)=>{

return(
    <div className='app-data-container'>
            <div className="bordered-container">
                <DatabaseOperations/>
            </div> 
    </div>
)

}

export default SettingsComponent;