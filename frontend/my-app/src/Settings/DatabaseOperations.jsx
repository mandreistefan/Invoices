import { useEffect, useState, useRef } from "react"

let DatabaseOperations=(props)=>{

    let [databaseInfo, setDBinfo] = useState({active: null, available:[]})
    let [ping, setPing] = useState({status:"NA", date:"NA"})

    const port = useRef(navigator.userAgent.indexOf('Electron')>-1 ? "3001" : "3000") 

    useEffect(()=>{
        if(databaseInfo.active===null){
            fetch(`http://localhost:${port.current}/database`).then(response=>response.json()).then(data=>{
                if(data.status==="OK"){
                    setDBinfo({active: data.data.database, available:data.data.databases})
                }else if(data.status==="SERVER_ERROR"){
                    props.snackbar({text:"Baza de date nu poate fi accesata"})
                }else{
                    props.snackbar({text:"Eroare"})
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
            let pingstatus = "FAIL"
            if(data.response===true) pingstatus="OK"
            let pingDate = new Date()
            setPing({status:pingstatus, date: `${pingDate.getHours()}:${pingDate.getMinutes()}:${pingDate.getSeconds()}`})
        }).catch(error=>{
            let pingDate = new Date()
            setPing({status:"FAIL", date: `${pingDate.getHours()}:${pingDate.getMinutes()}:${pingDate.getSeconds()}`})
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
                                            <option key={index} selected={databaseInfo.active===element ? true : false} value={element}>{element}</option>
                                        ))}
                                    </select>           
                                </form>     
                            </div>  
                        </div>
                    </div>                   
                    }            
                    {props.showDetailed===true && 
                    <div className="col-4">
                        <div className='financial-square'>
                            <span style={{color:'gray', marginBottom:'10px'}}  className="material-icons-outlined p-1">sync_problem</span>
                            <div className="p-1">
                                <span style={{color:'gray', fontWeight:'500'}}>Ping</span>
                                <span>Last status: <strong>{ping.status}</strong></span>
                                <span>Ping time: <strong>{ping.date}</strong></span>
                                <button className="btn btn-success btn-sm" style={{width:'fit-content'}} onClick={()=>{pingDatabase()}}>Ping</button>      
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