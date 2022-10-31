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
        exp_date: {value: `${currentDate.getFullYear()}-${currentDate.getMonth()+1>9 ? currentDate.getMonth()+1 : "0"(currentDate.getMonth()+1)}-${currentDate.getDate()}`, modified:false}
    })
    let [snackBarText, setSnackBarText] = React.useState(null)
    let carlig=React.useRef();

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
        //append the ID
        sendData.id=arrayData.id
        if(sendData.id==null){
            //new entry, so send all the data
            sendData.exp_name = arrayData.exp_name.value
            sendData.exp_sum = arrayData.exp_sum.value
            sendData.exp_description = arrayData.exp_description.value
            sendData.exp_deduct = arrayData.exp_deduct.value
            sendData.exp_date = arrayData.exp_date.value
            method="POST"
        }else{
            //edit, so send just the relevant data
            if(arrayData.exp_name.modified) sendData.exp_name = arrayData.exp_name.value
            if(arrayData.exp_sum.modified) sendData.exp_sum = arrayData.exp_sum.value
            if(arrayData.exp_description.modified) sendData.exp_description = arrayData.exp_description.value
            if(arrayData.exp_deduct.modified) sendData.exp_deduct = arrayData.exp_deduct.value
            if(arrayData.exp_date.modified) sendData.exp_date = arrayData.exp_date.value
            method="PUT"
        }   
    
        //submit data
        fetch(`/expenses`, {
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
            setData({
                id:null, 
                exp_name: {value:"", modified:false}, 
                exp_sum: {value: 0, modified:false}, 
                exp_description: {value: "", modified:false}, 
                exp_deduct:{value:true, modified:false},
                exp_date: {value: `${currentDate.getFullYear()}-${currentDate.getMonth()+1>9 ? currentDate.getMonth()+1 : "0"(currentDate.getMonth()+1)}-${currentDate.getDate()}`, modified:false}
            })
        })

    }
    
    //updates the form data
    let changeFormData=(event)=>{
        if(event.target.name==="exp_sum"){
            let validNumber = new RegExp(/^\d*\.?\d*$/);
            if(!(validNumber.test(event.target.value))) return false
        }
        setData({...arrayData,[event.target.id]:{value: event.target.value, modified: true}})         
    }

    let changeDate=(event)=>{
        setData({...arrayData, exp_date:{value:event.target.value, modified:true}})
    }

    return (
        <div id="new-product-form">
            <h6>Adaugare cheltuiala</h6>
            <div className='form-row' ref={carlig}>
                <div className="form-group col-3">            
                    <label className="form-subsection-label" htmlFor="exp_name">Nume</label><br/>
                    <input type="text" id="exp_name" name="exp_name" className="form-control shadow-none" onChange={changeFormData} value={arrayData.exp_name.value}/>
                </div>
                <div className="form-group col-1">   
                    <label className="form-subsection-label" htmlFor="exp_sum">Suma</label><br/>
                    <input type="text" id="exp_sum" name="exp_sum"  className="form-control shadow-none" onChange={changeFormData} value={arrayData.exp_sum.value}/>
                </div>
                <div className="form-group col-5">  
                    <label className="form-subsection-label" htmlFor="exp_description">Descriere</label><br/>
                    <input type="text" id="exp_description" rows="2" name="exp_description"  className="form-control shadow-none" onChange={changeFormData} value={arrayData.exp_description.value}/>
                </div>
                <div className="form-group col-1">  
                    <label className="form-subsection-label" htmlFor="exp_deduct">Deductibil</label><br/>                    
                    <select className="form-control-sm shadow-none" id="exp_deduct" name="exp_deduct" onChange={changeFormData} value={arrayData.exp_deduct.value}>
                        <option value="true">Da</option>
                        <option value="false">Nu</option>
                    </select>
                </div>
                <div className="form-group col-2">   
                    <label className="form-subsection-label" htmlFor="exp_date">Data</label><br/>
                    <input type="date" id="end" name="trip-end" value={arrayData.exp_date.value} onChange={changeDate}></input>
                </div>
            </div>
            <button className='btn btn-sm btn-success actions-button' onClick={()=>{submitData()}}><span className="action-button-label"><span class="material-icons-outlined">save</span> SAVE</span></button>
            <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
        </div>
    )
}

export default ExpenseForm