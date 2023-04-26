import { useEffect, useState, useRef } from "react"
import DatabaseCard from "./DatabaseCard"

let DatabaseOperations=(props)=>{

    let [databaseInfo, setDBinfo] = useState({active: null, available:[]})
    let [ping, setPing] = useState({status:"NA", date:"NA"})
    let [advancedSettings, setAdvancedSettings] = useState(false)

    let hostRef = useRef()
    let userRef = useRef()
    let passRef = useRef()

    const port = useRef(navigator.userAgent.indexOf('Electron')>-1 ? "3001" : "3000") 

    useEffect(()=>{
        if(databaseInfo.active===null){
            fetch(`http://localhost:${port.current}/database`).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setDBinfo({active: data.data.database, available:data.data.databases})
                }else if(data.status==="SERVER_ERROR"){
                    props.addSnackbar({text:"Baza de date nu poate fi accesata"})
                }else{
                    props.addSnackbar({text:"Eroare"})
                }                
            })
        }
    },[])


    let handleDBchange=(event)=>{
        fetch(`http://localhost:${port.current}/switchDatabase`, {
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
        fetch(`http://localhost:${port.current}/pingDatabase`, {
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
        fetch(`http://localhost:${port.current}/databaseSettings`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                host: hostRef.current.value,
                user: userRef.current.value,
                pass: passRef.current.value
            })
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                props.addSnackbar({text: "Datele au fost schimbate"})
                hostRef.current.value=""
                userRef.current.value=""
                passRef.current.value=""
            }
        }).catch(error=>{
            props.addSnackbar({text: "A aparut o eroare"})
        }) 
    }

    let changeDBproperties=(anObject)=>{
        fetch(`http://localhost:${port.current}/databaseProperties`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(anObject)
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                props.addSnackbar({text: "OK"})
                let aCopy = databaseInfo
                aCopy.available.forEach(element=>{
                    if(element.database===anObject.name) element.alias = anObject.alias                    
                })
                setDBinfo(aCopy)
            }else if(data.status==="FAIL"){
                props.addSnackbar({text: "Baza de date nu a fost gasita"})
            }else{
                props.addSnackbar({text: "A aparut o eroare"})
            }
        }).catch(error=>{
            props.addSnackbar({text: "A aparut o eroare"})
        }) 
    }

    return(
        <div>
            {props.showDetailed===true&&
                <div className="row">
                    {databaseInfo.available.length>0 &&
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
                    }            
                    <div className="col-4">
                        <div className='financial-square'>
                            <span style={{color:'gray', marginBottom:'10px'}}  className="material-icons-outlined p-1">sync_problem</span>
                            <div className="p-1">
                                <span style={{color:'gray', fontWeight:'500'}}>Ping</span>
                                <span>Ultimul status: <strong>{ping.status}</strong></span>
                                <span>Ultimul ping: <strong>{ping.date}</strong></span>
                                <button className="btn btn-success btn-sm" style={{width:'fit-content'}} onClick={()=>{pingDatabase()}}>Ping</button>      
                            </div> 
                        </div>         
                    </div>
                    <div className="col-4">
                        <div className='financial-square'>
                            <span style={{color:'gray', fontWeight:'500', marginBottom:'10px'}} className="material-icons-outlined p-1">cloud</span>
                            <div className="p-1">
                                <span style={{color:'gray', fontWeight:'500'}}>Setari avansate</span>
                                <button className="btn btn-success btn-sm" style={{display:'flex', alignItems:'center', justifyContent:'center', width:'fit-content'}} onClick={()=>{setAdvancedSettings(true)}}><span style={{fontSize:'16px'}} className="material-icons-outlined">settings</span>Setari</button>      
                                <span style={{fontWeight:'400'}}><small>Modificare setari fisier conexiune baza de date</small></span>
                            </div> 
                        </div>         
                    </div>
                    {advancedSettings &&
                    <div>
                        <div className="blur-overlap"></div>
                        <div className="overlapping-component-inner">
                            <div className='overlapping-component-header'>
                                <span>Setari baza de date</span>
                                <button type="button" className="action-close-window" onClick={()=>{setAdvancedSettings(false)}}><span className="material-icons-outlined">close</span></button>
                            </div>
                            <div style={{width:'100%'}} className="p-3">
                                <h6>Setari conexiune</h6>
                                <form onSubmit={databaseSettingSubmit} >
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
                                </form><br/>
                                <h6>Tabele actuale</h6>
                                {databaseInfo.available.map((element, index)=>(
                                    <DatabaseCard info={{alias:element.alias, name:element.database, isActive:databaseInfo.active===element.database ? true : false}} changeDBproperties={changeDBproperties}/>
                                ))}    
                            </div>
                        </div>
                    </div>}
                </div>
            } 
            {props.showDetailed===undefined&&
            <div>
                <form id="database-form" >
                    <select id="databaseSelector" className="form-select form-select-sm shadow-none" onChange={handleDBchange}>
                        {databaseInfo.available.map((element, index)=>(
                            <option  key={index} selected={databaseInfo.active===element ? true : false} value={element}>{element}</option>
                        ))}
                    </select>           
                </form>   
            </div>}
        </div>
    )

}

export default DatabaseOperations