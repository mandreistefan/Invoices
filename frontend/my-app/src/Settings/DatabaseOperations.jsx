import { useEffect, useState, useRef } from "react"

import { useOutletContext } from "react-router-dom"

let DatabaseOperations=(props)=>{

    let [databaseInfo, setDBinfo] = useState(null)
    let [ping, setPing] = useState({status:"NA", date:"NA"})

    let [showTables, setShowTables] = useState(false)
    let [showXMLFileSettings, setshowXMLFileSettings] = useState(false)
    let [newTable, setNewTable] = useState(false)

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    let hostRef = useRef()
    let userRef = useRef()
    let passRef = useRef()

    useEffect(()=>{
        setDBsettings()
    },[])

    let setDBsettings = () => {
        if(databaseInfo===null){
            fetch(`http://localhost:${port}/database`).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setDBinfo({active: data.data.database, available:data.data.databases})
                }else if(data.status==="SERVER_ERROR"){
                    addSnackbar({text:"Baza de date nu poate fi accesata"})
                }else{
                    addSnackbar({text:"Eroare"})
                }                
            })
        }
    }

    let handleDBchange=(event)=>{
        fetch(`http://localhost:${port}/switchDatabase`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({database: event.target.value})
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK") setDBinfo({active: event.target.value, available:databaseInfo.available})
            //if(props.changeFunction) props.changeFunction(event.target.value)
        }).catch(error=>{
            console.log(error)
        })       
    }

    let pingDatabase=()=>{
        fetch(`http://localhost:${port}/pingDatabase`, {
            method:"GET",
            headers: { 'Content-Type': 'application/json'}
        }).then(response=>response.json()).then(data=>{
            let pingstatus = "Conexiunea a esuat"
            if(data.response===true) pingstatus="Conexiunea este activa"
            let pingDate = new Date()
            setPing({status:pingstatus, date: `${pingDate.getHours()}:${pingDate.getMinutes()}:${pingDate.getSeconds()}`})
        }).catch(error=>{
            let pingDate = new Date()
            setPing({status:"FAIL", date: `${pingDate.getHours()}:${pingDate.getMinutes()}:${pingDate.getSeconds()}`})
        }) 
    }

    let databaseSettingSubmit=(event)=>{
        event.preventDefault()
        if(hostRef.current.value.length===0 && userRef.current.value.length===0 && passRef.current.value.length===0) return false
        fetch(`http://localhost:${port}/databaseSettings`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                host: hostRef.current.value,
                user: userRef.current.value,
                pass: passRef.current.value
            })
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: "Datele au fost schimbate"})
                hostRef.current.value=""
                userRef.current.value=""
                passRef.current.value=""
            }
        }).catch(error=>{
            addSnackbar({text: "A aparut o eroare"})
        }) 
    }

    let changeDBproperties=(anObject)=>{
        fetch(`http://localhost:${port}/databaseProperties`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(anObject)
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: "OK"})
                let availableDatabases = databaseInfo.available
                availableDatabases.push({alias: anObject.alias, database: anObject.name})
                setDBinfo({active: databaseInfo.active, available: availableDatabases})
            }else if(data.status==="FAIL"){
                if(data.data==="DATABASE_EXISTS"){
                    addSnackbar({text: "Baza de date exista"})
                }else{
                    addSnackbar({text: "Baza de date a fost adaugata insa tabelele nu au putut fi importate"})
                }                
            }else{
                addSnackbar({text: "A aparut o eroare, baza de date nu a fost creata"})
            }
        }).catch(error=>{
            addSnackbar({text: "A aparut o eroare"})
        }) 
    }

    let addNewDB = ( anObject )=>{
        fetch(`http://localhost:${port}/addDatabase`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(anObject)
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: "OK"})
                let availableDatabases = [...databaseInfo.available]
                availableDatabases.push({alias: anObject.alias, database: anObject.name})
                setDBinfo({active: databaseInfo.active, available: availableDatabases})
            }else{
                addSnackbar({text: "A aparut o eroare"})
            }
        }).catch(error=>{
            addSnackbar({text: "A aparut o eroare"})
        }) 
    }

    
    let deleteDB = ( name )=>{

        if(window.confirm("Stergeti baza de date?") === false) return false

        fetch(`http://localhost:${port}/database/${name}`, {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json'},
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){

            }else{
                addSnackbar({text: "A aparut o eroare"})
            }
        }).catch(error=>{
            addSnackbar({text: "A aparut o eroare"})
        })        

    }

    function exportData(){
        fetch(`http://localhost:${port}/export_data`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: `Au fost exportate ${data.data.length} tabele`})  
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({text: "Baza de date nu poate fi accesata"})    
            }else{
                addSnackbar({text: "Baza de date nu poate fi accesata"})
            }
        })
    }

    let DatabaseCard = (props) =>{

        let [properties, setProperties] = useState(null)
    
        useEffect(()=>{
            if(props.info){
                setProperties({alias: props.info.alias, name: props.info.name, changed: false})
            }else{
                setProperties({alias: "", name: "", changed: false})
            }
        },[])
    
        let submitForm=()=>{
            if(props.info){
                if(properties.alias==="") return false
                changeDBproperties({name:properties.name, alias: properties.alias})
            }else{
                if(properties.alias==="" || properties.name==="") return false
                addNewDB({name:properties.name, alias: properties.alias})
            }

        }
    
        return(
            <div style={{maxWidth:'400px'}} className="p-1">
                {properties!==null&&
                <div className="shadow-sm p-3 mb-2 bg-body-tertiary rounded">
                    <div class="form-floating mb-3">
                        <input type="text" className="form-control shadow-none" id="dbname" name="dbname" value={properties.name} disabled={props.info ?  true : false} onChange={(e)=>{setProperties({...properties, name: e.target.value, changed: true})}} placeholder="Nume"></input>
                        <label for="client_first_name">Nume</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="text" className="form-control shadow-none" id="alias" name="alias" value={properties.alias} onChange={(e)=>{setProperties({...properties, alias: e.target.value, changed: true})}} placeholder="Alias"></input>
                        <label for="client_first_name">Alias</label>
                    </div>
                    <div className="btn-group button-group-mint">
                        <button className="btn btn-light btn-sm" disabled={properties.changed===true ? false : true} onClick={()=>{submitForm()}}>{props.info ? "Schimba alias" : "Adauga"}</button>
                        {props.info && <button className="btn btn-light btn-sm" disabled={databaseInfo.active === properties.name ? true : false} onClick={()=>{deleteDB(properties.name)}}>Sterge</button>}
                    </div>
                   
                </div>}
            </div>
        )
    
    }

    return(
        <div className="app-data-container">
            <div class="bordered-container p-2" style={{display:'flex', flexDirection:'row', alignItems:'center', width:'fit-content', marginBottom:'25px'}}>
                <span class="material-icons-outlined">storage</span>
                <span style={{fontSize:'16px', fontWeight:'700', color: 'rgb(108, 117, 125)', textTransform:'uppercase', marginRight:'20px'}}>setari baza de date</span>
            </div>
            {databaseInfo!==null &&
            <div>
                <div className="row" style={{marginBottom:'25px'}}>
                    <div className="col-4">
                        <div className='financial-square'>
                            <span style={{color:'gray', fontWeight:'500', marginBottom:'10px'}} className="material-icons-outlined p-1">cloud</span>
                            <div className="p-1">
                                <span style={{color:'gray', fontWeight:'500'}}>Conexiune</span>
                                <span>Connectat la</span>
                                <form id="database-form" >
                                    <select id="databaseSelector" className="form-select form-select-sm shadow-none" onChange={handleDBchange}>
                                        {databaseInfo.available.map((element, index)=>(
                                            <option key={index} selected={databaseInfo.active===element.database ? true : false} value={element.database}>{element.alias}</option>
                                        ))}
                                    </select>           
                                </form>     
                            </div>  
                        </div>
                    </div>     
                    <div className="col-6">
                        <div className='financial-square'>
                            <span style={{color:'gray', marginBottom:'10px'}}  className="material-icons-outlined p-1">sync_problem</span>
                            <div className="p-1">
                                <span style={{color:'gray', fontWeight:'500'}}>Ping</span>
                                <span>Ultimul status: <strong>{ping.status}</strong></span>
                                <span>Ultimul ping: <strong>{ping.date}</strong></span>
                                <button className="btn btn-success btn-sm" style={{width:'fit-content'}} onClick={()=>{pingDatabase()}}>Contacteaza baza de date</button>      
                            </div> 
                        </div>         
                    </div>
                </div>
                <div className="row">
                    <div className="col-4">
                        <div className='financial-square'>
                            <span style={{color:'gray', marginBottom:'10px'}}  className="material-icons-outlined p-1">sync_problem</span>
                            <div className="p-1">
                                <h6>Setari conexiune</h6>
                                <button className="btn btn-success btn-sm" onClick={()=>{setshowXMLFileSettings(true)}}>Editare</button>
                            </div> 
                        </div>         
                    </div>
                    <div className="col-4">
                        <div className='financial-square'>
                            <span style={{color:'gray', marginBottom:'10px'}}  className="material-icons-outlined p-1">sync_problem</span>
                            <div className="p-1">
                                <h6>Tabele</h6>
                                <div className="btn-group button-group-mint">
                                    <button className="btn btn-light btn-sm" onClick={()=>{setShowTables(true)}}>Vizualizare</button>
                                    <button className="btn btn-light btn-sm" onClick={()=>{setNewTable(true)}}>Adaugare</button>
                                </div>
                            </div> 
                        </div>         
                    </div>
                </div>
                {showXMLFileSettings===true && 
                <div>
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Setari conexiune</span>
                            <button type="button" className="action-close-window" onClick={()=>{setshowXMLFileSettings(false)}}><span className="material-icons-outlined">close</span></button>
                        </div> 
                        <div style={{width:'100%'}} className="p-2">                                
                            <form onSubmit={databaseSettingSubmit} style={{width:'100%'}}>
                                <div class="col-12">
                                    <div class="form-floating mb-3">
                                        <input type="text" ref={hostRef} className="form-control shadow-none" id="host" name="host" placeholder="host" ></input>
                                        <label for="client_first_name">Host</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="form-floating mb-3">
                                        <input type="text"  ref={userRef}  className="form-control shadow-none" id="user" name="user" placeholder="user"></input>
                                        <label for="client_first_name">User</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="form-floating mb-3">
                                        <input type="text" ref={passRef}  className="form-control shadow-none" id="parola" name="parola" placeholder="parola"></input>
                                        <label for="client_first_name">Parola</label>
                                    </div>
                                </div>
                                <button className="btn btn-success btn-sm" style={{width:'fit-content'}}>Schimba setari</button>  
                            </form>
                        </div> 
                    </div>     
                </div>}
                {showTables===true && 
                <div>
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Baze de date</span>
                            <button type="button" className="action-close-window" onClick={()=>{setShowTables(false)}}><span className="material-icons-outlined">close</span></button>
                        </div> 
                        <div style={{display:'grid', gridTemplateColumns:'48% 48%'}}>
                            {databaseInfo.available.map((element, index)=>(
                                <DatabaseCard info={{alias:element.alias, name:element.database, isActive:databaseInfo.active===element.database ? true : false}} changeDBproperties={changeDBproperties}/>
                            ))}                        
                        </div> 
                    </div>     
                </div>}
                {newTable===true && 
                <div>
                    <div className="blur-overlap"></div> 
                    <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Inregistrare baza noua de date</span>
                            <button type="button" className="action-close-window" onClick={()=>{setNewTable(false)}}><span className="material-icons-outlined">close</span></button>
                        </div> 
                        <div style={{width:'100%'}} className="p-2">
                            <DatabaseCard /> 
                        </div>
                    </div>     
                </div>}
                <div>
                    <button title="Export date" className="btn btn-light btn-sm mint-button" onClick={()=>{exportData()}}><div className="inner-button-content"><span className="material-icons-outlined" style={{fontSize:'18px'}}>file_download</span>Export</div></button>                    
                </div>
            </div>} 
        </div>
    )

}

export default DatabaseOperations