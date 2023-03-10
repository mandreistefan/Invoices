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
    let [dataModified, setdataModified] = React.useState(false)
    let carlig=React.useRef();

    //received some data as props
    React.useEffect(()=>{
        if(props.productID){ 
            fetch(`http://localhost:3000/products/${props.productID}`, {
                method:"GET"
            })
            .then(response=>response.json())
            .then(data=>{
                
                if(data.status==="OK"){
                    setData({
                        product_id: props.productID,
                        pp_name: {value: data.data[0].pp_name, modified:false}, 
                        pp_um: {value: data.data[0].pp_um, modified:false}, 
                        pp_price_per_item: {value: data.data[0].pp_price_per_item, modified:false}, 
                        pp_tax: {value: data.data[0].pp_tax, modified:false}, 
                        pp_description: {value: data.data[0].pp_description, modified:false}
                    })
                }else if(data.status==="SERVER_ERROR"){
                    setSnackBarText("Baza de date nu poate fi accesata")
                }else{
                    setSnackBarText("An error ocurred")
                }
            })                 
        }
    }, [])

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
            //edit, so send just the relevant data
            if(arrayData.pp_name.modified) sendData.pp_name = arrayData.pp_name.value
            if(arrayData.pp_um.modified) sendData.pp_um = arrayData.pp_um.value
            if(arrayData.pp_price_per_item.modified) sendData.pp_price_per_item = arrayData.pp_price_per_item.value
            if(arrayData.pp_tax.modified) sendData.pp_tax = arrayData.pp_tax.value
            if(arrayData.pp_description.modified) sendData.pp_description = arrayData.pp_description.value
        }   
        
        
        //submit data; same PUT request for new product and editing a product; when the ID is sent, the data is edited
        fetch(`http://localhost:3000/products`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(sendData)
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setSnackBarText("Success")
            }else if(data.status==="SERVER_ERROR"){
                setSnackBarText("Baza de date nu poate fi accesata")
            }else{
                setSnackBarText("An error ocurred")
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
            setdataModified(true)
        }
    }

    return (
        <div id="new-product-form">  
            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="pp_name" name="pp_name" className="form-control shadow-none" placeHolder="Nume" onChange={changeFormData} value={arrayData.pp_name.value}/>
                    <label className="form-subsection-label" htmlFor="pp_name">Nume</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="pp_um" name="pp_um" placeHolder="UM" className="form-control shadow-none" onChange={changeFormData} value={arrayData.pp_um.value}/>
                    <label className="form-subsection-label" htmlFor="pp_um">UM</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="pp_price_per_item" name="pp_price_per_item" placeHolder="PPU" className="form-control shadow-none"onChange={changeFormData} value={arrayData.pp_price_per_item.value}/>
                    <label className="form-subsection-label" htmlFor="pp_price_per_item">Pret per unitate</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="pp_tax" name="pp_tax"  className="form-control shadow-none" placeHolder="Taxa" onChange={changeFormData} value={arrayData.pp_tax.value}/>
                    <label className="form-subsection-label" htmlFor="pp_price_per_item">Taxa</label>
                </div>
            </div>

            <div class="col-md">
                <div class="form-floating mb-3">
                    <input type="text" id="pp_description" name="pp_description"  className="form-control shadow-none" placeHolder="Descriere" onChange={changeFormData} value={arrayData.pp_description.value}/>
                    <label className="form-subsection-label" htmlFor="pp_price_per_item">Descriere</label>
                </div>
            </div>
            <button class="btn btn-light btn-sm" onClick={()=>{submitData()}} disabled={dataModified ? false : true}><span class="action-button-label"><span class="material-icons-outlined">check</span>Salvare</span></button>
            <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
        </div>
    )
}

export default ProductForm