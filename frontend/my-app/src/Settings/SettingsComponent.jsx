import { useState, useEffect } from "react";
import DatabaseOperations from './DatabaseOperations.jsx'

let SettingsComponent=(props)=>{

return(
    <div>
        <h5>Settings</h5>
        <div>
            <DatabaseOperations/>
        </div>
    </div>
)

}

export default SettingsComponent;