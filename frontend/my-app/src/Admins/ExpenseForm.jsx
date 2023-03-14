import Snackbar from '../Snackbar/Snackbar.jsx'
import React from "react";

let ExpenseForm = (props) =>{

    let currentDate = new Date()
    //default values
    let [arrayData, setData] = React.useState({
        id:null, 
        exp_name: {value:"", modified:false}, 
        exp_sum: {value: 0, modified:false}, 
        exp_description: {value: "", modified:false}, 
        exp_deduct: {value:true, modified:false},
        exp_date: {value: currentDate, modified:false},
        exp_type: {value: "tools", modified:false},
    })
    let [snackBarText, setSnackBarText] = React.useState(null)
    let [dataModified, setdataModified] = React.useState(false)

    //received some data as props
    React.useEffect(()=>{
        if(props.data){                    
            setData({
                id: props.data.id,
                exp_name: {value: props.data.exp_name, modified:false}, 
                exp_sum: {value: props.data.exp_sum, modified:false}, 
                exp_description: {value: props.data.exp_description, modified:false}, 
                exp_deduct: {value:props.data.exp_deduct, modified:false},
                exp_date: {value: props.data.exp_date, modified:false}
            })
        }
    }, [props])

    //add a new product to the database
    let submitData=()=>{
        //some data validation
        if(arrayData.exp_name.value===""){
            setSnackBarText("You need a name")
            return false
        }
        if(arrayData.exp_sum.value===""){
            setSnackBarText("You need a sum")
            return false
        }
        if(arrayData.exp_description.value===""){
            setSnackBarText("You need a description")
            return false
        }  

        let sendData=({})
        let method;
        let shallowCopy = {...arrayData}
        if(arrayData.id==null){
            delete shallowCopy.id
            for (const [key, value] of Object.entries(shallowCopy)) {
                sendData[key] = shallowCopy[key].value                              
            }
            method="POST"
        }else{
            //edit, so send just the relevant data
            for (const [key, value] of Object.entries(shallowCopy)) {
                if(shallowCopy[key].modified===true){
                    sendData[key] = shallowCopy[key].value 
                }                                             
            }
            method="PUT"
        }   

        if(sendData.length===0) return false
    
        //submit data
        fetch(`http://localhost:3000/expenses`, {
            method:method,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sendData)
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setSnackBarText("Success")
                props.reFetch()
            }else if(data.status==="SERVER_ERROR"){
                setSnackBarText("Baza de date nu poate fi accesata") 
            }else{
                setSnackBarText("An error ocurred")
            }

            for (const [key, value] of Object.entries(shallowCopy)) {
                if(shallowCopy[key].modified===true) shallowCopy[key].modified=false                                            
            }
            shallowCopy.id = data.data.data
            setData(shallowCopy)
        })

    }
    
    //updates the form data
    let changeFormData=(event)=>{
        if(event.target.name==="exp_sum"){
            let validNumber = new RegExp(/^\d*\.?\d*$/);
            if(!(validNumber.test(event.target.value))) return false
        }
        setData({...arrayData,[event.target.id]:{value: event.target.value, modified: true}})  
        setdataModified(true)       
    }

    let changeDate=(event)=>{
        setData({...arrayData, exp_date:{value:event.target.value, modified:true}})
        setdataModified(true)    
    }

    return (
        <div id="new-product-form">
            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="exp_name" name="exp_name" className="form-control shadow-none" placeHolder="Nume" onChange={changeFormData} value={arrayData.exp_name.value}/>
                    <label className="form-subsection-label" htmlFor="exp_name">Nume</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="exp_sum" name="exp_sum"  className="form-control shadow-none" placeHolder="Suma" onChange={changeFormData} value={arrayData.exp_sum.value}/>
                    <label className="form-subsection-label" htmlFor="exp_sum">Suma</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="exp_description" rows="2" name="exp_description"  className="form-control shadow-none" placeHolder="Descriere" onChange={changeFormData} value={arrayData.exp_description.value}/>
                    <label className="form-subsection-label" htmlFor="exp_description">Descriere</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <select className="form-control shadow-none" id="exp_deduct" name="exp_deduct" onChange={changeFormData} value={arrayData.exp_deduct.value} placeholder="Deductibil">
                        <option value="true">Da</option>
                        <option value="false">Nu</option>
                    </select>
                    <label className="form-subsection-label" htmlFor="exp_deduct">Deductibil</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <select className="form-control shadow-none" id="exp_type" name="exp_type" onChange={changeFormData} value={arrayData.exp_type.value} placeholder="Tip">
                        <option value="tools">Unelte</option>
                        <option value="transport">Transport</option>
                        <option value="administrative">Administrative</option>
                    </select>
                    <label className="form-subsection-label" htmlFor="exp_type">Tip</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="date" className="form-control shadow-none" id="end" name="trip-end" value={arrayData.exp_date.value} onChange={changeDate} placeHolder="Data"></input>
                    <label className="form-subsection-label" htmlFor="exp_date">Data</label>
                </div>
            </div>
            <button class="btn btn-light btn-sm" onClick={()=>{submitData()}} disabled={dataModified ? false : true}><span class="action-button-label"><span class="material-icons-outlined">check</span>Salvare</span></button>
            <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
        </div>
    )
}

export default ExpenseForm