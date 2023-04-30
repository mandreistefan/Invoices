import { useEffect, useState } from "react"

let DatabaseCard = (props) =>{

    let [properties, setProperties] = useState(null)

    useEffect(()=>{
        if(props.info){
            setProperties({alias: props.info.alias, name: props.info.name, changed: false})
        }
    },[])

    let changeDBproperties=()=>{
        if(properties.alias==="") return false
        props.changeDBproperties({name:properties.name, alias: properties.alias})
    }

    return(
        <div style={{maxWidth:'400px'}} className="p-1">
            {properties!==null&&
                <div className="shadow-sm p-3 mb-2 bg-body-tertiary rounded">
                    <div style={{display:'flex', alignItems:'center'}}>
                        {props.info.isActive===true && <span title="Activa" className="material-icons-outlined p-1">verified</span>}
                        <span>{properties.name}</span>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="text" className="form-control shadow-none" id="alias" name="alias" value={properties.alias} onChange={(e)=>{setProperties({...properties, alias: e.target.value, changed: true})}} placeholder="Alias"></input>
                        <label for="client_first_name">Alias</label>
                    </div>
                    <button className="btn btn-success btn-sm" disabled={properties.changed===true ? false : true} onClick={()=>{changeDBproperties()}}>Schimba alias</button>
                </div>
            }
        </div>
    )

}

export default DatabaseCard