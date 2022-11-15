import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

let DatabaseOperations=()=>{

    let [alertUser, setUserAlert] =React.useState({text: null})
    let [activeDB, setActiveDB] = React.useState(null)
    let curentDate = new Date()

    React.useEffect(()=>{
        if(activeDB===null){
            fetch('http://localhost:3000/database').then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setActiveDB(data.data.database)
                }else if(data.status==="SERVER_ERROR"){
                    setUserAlert({text:"Baza de date nu poate fi accesata"})
                }else{
                    setUserAlert({text:"Eroare"})
                }                
            })
        }
    },[])


    let exportDatabase=()=>{
        fetch('http://localhost:3000/export').then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setUserAlert({text:`Export done. ${data.data.success}/${data.data.attempts} files exported`})
            }else if(data.status==="SERVER_ERROR"){
                setUserAlert({text:"Baza de date nu poate fi accesata"})
            }else{
                setUserAlert({text:"Eroare"})
            }
        })
    }

    let switchDB=()=>{
        fetch('http://localhost:3000/switchDatabase').then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setActiveDB(data.database)
                setUserAlert({text:"Active database changed"})
            }else if(data.status==="SERVER_ERROR"){
                setUserAlert({text:"Baza de date nu poate fi accesata"})
            }else{
                setUserAlert({text:"An error occured"})
            }            
        })
    }

    return(
        <div className="app-data-container">
            <h4>Settings</h4>
            <div style={{backgroundColor:"white", display:'flex', flexDirection:"column", padding:'10px'}}>
                <h5>Database</h5>
                <span>Active database: <b>{activeDB}</b></span>
                <div class="action-buttons-container">
                    <button class="small-menu-button" onClick={()=>{switchDB()}}><div className="inner-button-content"><span className="material-icons-outlined" style={{color: "rgb(2, 117, 216)"}}>refresh</span>Switch</div></button>
                    <button class="small-menu-button" onClick={()=>{exportDatabase()}}><div className="inner-button-content"><span className="material-icons-outlined" style={{color: "rgb(2, 117, 216)"}}>file_download</span>Export</div></button>
                    <button class="small-menu-button" onClick={()=>{}}><div className="inner-button-content"><span className="material-icons-outlined" style={{color: "rgb(217, 83, 79)"}}>file_upload</span>Import</div></button>
                </div>
            </div>
            <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/>  
        </div>
    )

}

export default DatabaseOperations