import { useEffect, useState } from "react"

let DatabaseOperations=(props)=>{

    let [databaseInfo, setDBinfo] = useState({active: null, available:[]})
    let [ping, setPing] = useState({status:"NA", date:"NA"})

    useEffect(()=>{
        if(databaseInfo.active===null){
            fetch('http://localhost:3000/database').then(response=>response.json()).then(data=>{
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
        fetch(`http://localhost:3000/switchDatabase`, {
            method:"POST",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({database: event.target.value})
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK") setDBinfo({active: event.target.value, available:databaseInfo.available})
        }).catch(error=>{
            console.log(error)
        })       
    }

    let pingDatabase=()=>{
        fetch(`http://localhost:3000/pingDatabase`, {
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
            <div style={{padding:'10px'}} style={{display:'flex', flexDirection:'row'}}> 
                {
                    databaseInfo.available.length>0 &&
                    <form id="database-form" >
                        <select id="databaseSelector" className="form-select form-select-sm shadow-none" onChange={handleDBchange}>
                            {databaseInfo.available.map(element=>(
                                <option selected={databaseInfo.active===element ? true : false} value={element}>{element}</option>
                            ))}
                        </select>           
                    </form>                    
                }
                {props.showDetailed===true && 
                <div>
                    <button className="btn btn-success btn-sm " onClick={()=>{pingDatabase()}}>Ping</button>
                    <span>Last ping status: {ping.status} at {ping.date}</span>
                </div>
                }

            </div> 
        </div>
    )

}

export default DatabaseOperations