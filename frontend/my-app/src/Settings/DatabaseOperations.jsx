import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

let DatabaseOperations=()=>{

    let [alertUser, setUserAlert] =React.useState({text: null})
    let [databaseInfo, setDBinfo] = React.useState({active: null, available:[]})
    let curentDate = new Date()

    React.useEffect(()=>{
        if(databaseInfo.active===null){
            fetch('http://localhost:3000/database').then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setDBinfo({active: data.data.database, available:data.data.databases})
                }else if(data.status==="SERVER_ERROR"){
                    setUserAlert({text:"Baza de date nu poate fi accesata"})
                }else{
                    setUserAlert({text:"Eroare"})
                }                
            })
        }
    },[])


    let changeDatabase=(event)=>{
        event.preventDefault()
        fetch(`http://localhost:3000/switchDatabase`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({database: databaseInfo.active})
        }).then(response=>response.json()).then(data=>{

        }).catch(error=>{

        })
    }

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

    let handleDBchange=(event)=>{
        setDBinfo({active: event.target.value, available:databaseInfo.available})
    }

    return(
        <div className="app-data-container">            
            <h6>Database</h6>
            {
                databaseInfo.available.length>0 &&
                <form onSubmit={changeDatabase}>
                    <label>Active database</label>
                    <select id="databaseSelector" className="form-select" onChange={handleDBchange}>
                        {databaseInfo.available.map(element=>(
                            <option selected={databaseInfo.active===element ? true : false} value={element}>{element}</option>
                        ))}
                    </select>      
                    <button className="w-100 btn btn-primary btn-lg" ><span className="action-button-label">SALVARE</span></button>         
                </form>
            }
            <div>
                <h6>Import/ export</h6>
                <div class="action-buttons-container">                   
                    <button class="btn btn-primary" onClick={()=>{exportDatabase()}}><div className="inner-button-content"><span className="material-icons-outlined">file_download</span>Export</div></button>
                    <button class="btn btn-primary" onClick={()=>{}}><div className="inner-button-content"><span className="material-icons-outlined">file_upload</span>Import</div></button>
                </div>
            </div>
            <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/>  
        </div>
    )

}

export default DatabaseOperations