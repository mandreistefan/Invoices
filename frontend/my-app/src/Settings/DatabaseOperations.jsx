import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

let DatabaseOperations=()=>{

    let [alertUser, setUserAlert] =React.useState({text: null})
    let [databaseInfo, setDBinfo] = React.useState({active: null, available:[]})

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
        <div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width:'70%', display:'inherit', alignItems:'center'}} className="p-3"><h5>Setari baza de date</h5></div>
                <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0 p-3" style={{width:'30%'}}>                                
                    
                </div>
            </div> 
            <div style={{padding:'10px'}}> 
                {
                    databaseInfo.available.length>0 &&
                    <form onSubmit={changeDatabase}>
                        <label>Baza de date</label>
                        <select id="databaseSelector" className="form-select" onChange={handleDBchange}>
                            {databaseInfo.available.map(element=>(
                                <option selected={databaseInfo.active===element ? true : false} value={element}>{element}</option>
                            ))}
                        </select>      
                        <button className="w-100 btn btn-primary btn-lg" style={{marginTop:'10px'}}><span className="action-button-label">SALVARE</span></button>         
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
        </div>
    )

}

export default DatabaseOperations