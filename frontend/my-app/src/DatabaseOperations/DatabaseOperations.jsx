import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'

let DatabaseOperations=()=>{

    let [alertUser, setUserAlert] =React.useState({text: null})
    let [activeDB, setActiveDB] = React.useState(null)

    React.useEffect(()=>{
        if(activeDB===null){
            fetch('./database').then(response=>response.json()).then(data=>{
                setActiveDB(data.database)
            })
        }
    },[])


    let exportDatabase=()=>{
        fetch('./export').then(response=>response.json()).then(data=>{
            console.log(data)
            setUserAlert({text:"Export done"})
        })
    }

    let importDatabase=()=>{

    }

    let switchDB=()=>{
        fetch('./switchDatabase').then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setActiveDB(data.database)
                setUserAlert({text:"Active database changed"})
            }else{
                setUserAlert({text:"An error occured"})
            }            
        })
    }

    return(
        <div className="app-data-container">
            <h4>Database operations</h4>
            <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
                <div className="col d-flex align-items-start">
                    <div className="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                        <span style={{fontSize:'30px'}} class="material-icons-outlined">file_download</span>
                    </div>
                    <div>
                        <h4>Export</h4>
                        <p>Export the database and current records in a CSV format.<br/>Path of the files is: <b>/exports/file.csv</b>.</p>
                        <button className="btn btn-primary" onClick={()=>{exportDatabase()}}>Export</button>
                    </div>
                </div>
                <div className="col d-flex align-items-start">
                    <div className="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                        <span style={{fontSize:'30px'}} class="material-icons-outlined">file_upload</span>
                    </div>
                    <div>
                        <h4>Import</h4>
                        <p>Import a CSV file. File should contain database headers and, optionally, data.</p>
                        <button className="btn btn-primary" onClick={()=>{importDatabase()}}>Import</button>
                    </div>
                </div>
                <div className="col d-flex align-items-start">
                    <div className="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3">
                        <span class="material-icons-outlined">inventory_2</span>
                    </div>
                    <div>
                        <h4>{activeDB}</h4>
                        <p>Active database</p>
                        <button className="btn btn-primary" onClick={()=>{switchDB()}}>Switch</button>
                    </div>
                </div>
            </div>
            <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/>  
        </div>
    )

}

export default DatabaseOperations