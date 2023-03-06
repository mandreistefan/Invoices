import React from "react";

let DatabaseOperations=(props)=>{

    let [databaseInfo, setDBinfo] = React.useState({active: null, available:[]})

    React.useEffect(()=>{
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

    return(
        <div>
            <div style={{padding:'10px'}}> 
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
            </div> 
        </div>
    )

}

export default DatabaseOperations