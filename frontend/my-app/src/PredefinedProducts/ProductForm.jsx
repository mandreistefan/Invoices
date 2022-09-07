import Snackbar from '../Snackbar/Snackbar.jsx'
import React from "react";

let ProductForm = (props) =>{

    //default values
    let [arrayData, setData] = React.useState({
        product_id:null, 
        pp_name: {value:"", modified:false}, 
        pp_um: {value: "", modified:false}, 
        pp_price_per_item: {value: "", modified:false}, 
        pp_tax: {value: 10, modified:false}, 
        pp_description:{value: "", modified:false}
    })
    let [snackBarText, setSnackBarText] = React.useState(null)
    let carlig=React.useRef();

    //received some data as props
    React.useEffect(()=>{
        if(props.data){                    
            setData({
                product_id: props.data.product_id,
                pp_name: {value: props.data.product_name, modified:false}, 
                pp_um: {value: props.data.product_um, modified:false}, 
                pp_price_per_item: {value: props.data.product_price, modified:false}, 
                pp_tax: {value: props.data.product_tax, modified:false}, 
                pp_description: {value: props.data.product_description, modified:false}
            })
        }
    }, [props])

    //add a new product to the database
    let submitData=()=>{
        //some data validation
        if(arrayData.pp_name.value===""){
            setSnackBarText("You need a product name")
            return false
        }
        if(arrayData.pp_um.value===""){
            setSnackBarText("You need a product UM")
            return false
        }
        if(arrayData.pp_price_per_item.value===""){
            setSnackBarText("You need a product price")
            return false
        }else{
            if(!(parseFloat(arrayData.pp_price_per_item.value))) {
                setSnackBarText("The price format is invalid")
                return false
            }
        }
       
        if(arrayData.pp_tax.value===""){
            setSnackBarText("You need a product tax")
            return false
        }else{
            if(!(parseInt(arrayData.pp_tax.value))){
                setSnackBarText("The tax format is invalid")
                return false
            }

            if(parseInt(arrayData.pp_tax.value)>=100) {
                setSnackBarText("Tax cannot be equal to, or larger than, 100")
                return false
            }
        }   

        let sendData=({})
        //append the ID
        sendData.product_id=arrayData.product_id
        if(sendData.product_id==null){
            //new entry, so send all the data
            sendData.pp_name = arrayData.pp_name.value
            sendData.pp_um = arrayData.pp_um.value
            sendData.pp_price_per_item = arrayData.pp_price_per_item.value
            sendData.pp_tax = arrayData.pp_tax.value
            sendData.pp_description = arrayData.pp_description.value
        }else{
            console.log("here")
            //edit, so send just the relevant data
            if(arrayData.pp_name.modified) sendData.pp_name = arrayData.pp_name.value
            if(arrayData.pp_um.modified) sendData.pp_um = arrayData.pp_um.value
            if(arrayData.pp_price_per_item.modified) sendData.pp_price_per_item = arrayData.pp_price_per_item.value
            if(arrayData.pp_tax.modified) sendData.pp_tax = arrayData.pp_tax.value
            if(arrayData.pp_description.modified) sendData.pp_description = arrayData.pp_description.value
        }   
        
        
        //submit data
        fetch(`/products`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sendData)
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setSnackBarText("Product has been registered")
            }else{
                setSnackBarText("Product has NOT been registered")
            }
        })

    }
    
    //some fields cannot receive letters
    let validateData=(who, what)=>{
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        switch (who){
            case "pp_price_per_item":
                if(validNumber.test(what)) return true
                return false
            case "pp_tax":
                if(validNumber.test(what)) return true
                return false
            default:
                return true
        }
    }

    //updates the form data
    let changeFormData=(event)=>{
        if(validateData(event.target.id, event.target.value)){
            setData({...arrayData,[event.target.id]:{value: event.target.value, modified: true}}) 
        }
    }

    return (
        <div id="new-product-form">
        <div className='form-row' ref={carlig}>
            <div className="form-group col-2">            
                <label className="form-subsection-label" htmlFor="pp_name">Product name:</label><br/>
                <input type="text" id="pp_name" name="pp_name" className="form-control shadow-none" onChange={changeFormData} value={arrayData.pp_name.value}/>
            </div>
            <div className="form-group col-2">   
                <label className="form-subsection-label" htmlFor="pp_um">UM:</label><br/>
                <input type="text" id="pp_um" name="pp_um"  className="form-control shadow-none" onChange={changeFormData} value={arrayData.pp_um.value}/>
            </div>
            <div className="form-group col-2">  
                <label className="form-subsection-label" htmlFor="pp_price_per_item">Price per unit:</label><br/>
                <input type="text" id="pp_price_per_item" name="pp_price_per_item"  className="form-control shadow-none"onChange={changeFormData} value={arrayData.pp_price_per_item.value}/>
            </div>
            <div className="form-group col-2">   
                <label className="form-subsection-label" htmlFor="pp_tax">Tax:</label><br/>
                <input type="email" id="pp_tax" name="pp_tax"  className="form-control shadow-none"onChange={changeFormData} value={arrayData.pp_tax.value}/>
            </div>
            <div className="form-group col-4">   
                <label className="form-subsection-label" htmlFor="pp_description">Description:</label><br/>
                <input type="email" id="pp_description" name="pp_description"  className="form-control shadow-none" onChange={changeFormData} value={arrayData.pp_description.value}/>
            </div>
        </div>
        <button className='actions-button' onClick={()=>{submitData()}}><span className="action-button-label"><span class="material-icons-outlined">save</span> SAVE</span></button>
        <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
    </div>
    )
}

export default ProductForm