import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import Snackbar from '../Snackbar/Snackbar.jsx'
import PredefinedProducts from '../Admins/ExistingProducts.jsx'

export default class Invoice extends React.Component{
    
    //set the elements we will be working with
    constructor(props) {
        super(props);
        this.state = {
            invoiceID: (props.invoiceID) ? props.invoiceID : null,
            clientData: {client_type:"", client_first_name: "",client_last_name: "", client_phone: "", client_email: "", client_county: "", client_city: "", client_street: "", client_adress_number: "", client_zip: "", client_notes: ""},
            billingType: "one-time-billing-option",
            billingFrequency: "monthly-billing",
            monthlyBillingDate: new Date(),
            yearlyBillingDate: new Date(),
            //id: products can have IDs if the products are added from the predefined products list; preloaded - the product has been preloaded from prop data; valid - i want to use this to validate form data
            tableElements: [{properties:{preloaded:false, id:null, entry: null, valid:true}, data:["", "", "", "0", "0", "", ""]}],
            total_prod_quantity: 0,
            total_prod_price: 0,  
            total_tax:0,
            activeClient: props.activeClient ? props.activeClient.id : null,
            alertUser: null,
            invoice_server_status: "draft",
            invoice_status: "draft",
            invoice_pay_method: "cash",            
            invoice_bank_ref: "",
            isFormDisabled: false,
            predefinedList: false,
            refreshFunction: props.refresh,
            dataModified: false, 
            showClientInfo: false,
            showBilledProducts: true
        };
    }

    //let's check for some invoice data
    componentDidMount(){
        //fill the data from the DB
        if(this.state.invoiceID){
            this.fetchInvoiceData(this.state.invoiceID)
        }
        if(this.state.activeClient!==null){
            let clientDataCopy = {...this.state.clientData}
            for(const[key, value] of Object.entries(clientDataCopy)){
                clientDataCopy[key]=this.props.activeClient[key]
            }
            this.setState({clientData:clientDataCopy})
        }
    }

    //gets all the data linked to an invoice; sets the state of certain elements based on retrieved data
    fetchInvoiceData=(invoice)=>{
        fetch(`http://localhost:3000/invoice?filter=invoiceID&filterBy=${invoice}`).then(response=>response.json()).then(data=>{
            let invoiceData = data.data
            //client data
            let clientDataCopy = {...this.state.clientData}
            for(const[key, value] of Object.entries(clientDataCopy)){
                clientDataCopy[key]=invoiceData.invoiceProperty[key]
            }
            //set state
            this.setState({
                clientData:{...clientDataCopy},
                tableElements: this.decodeTableElements(invoiceData.invoiceProducts),
                total_prod_price: parseFloat(invoiceData.invoiceProperty.total.price).toFixed(2),  
                total_tax: parseFloat(invoiceData.invoiceProperty.total.tax).toFixed(2),
                invoice_server_status: invoiceData.invoiceProperty.invoice_status,
                invoice_status: invoiceData.invoiceProperty.invoice_status,
                invoice_pay_method: invoiceData.invoiceProperty.invoice_pay_method,            
                invoice_bank_ref: invoiceData.invoiceProperty.invoice_bank_ref,
                isFormDisabled: (invoiceData.invoiceProperty.invoice_status==="draft") ? false : true
            })
        })
    }

    //json data is transformed to a table containing products
    decodeTableElements =(dataAsArray)=>{
        let decodedData=[]
        dataAsArray.forEach(element=>{
            decodedData.push({properties:{preloaded:true, id:element.id, entry: element.entry, valid:true},data:[element.name, element.um, element.quantity, element.tax_percentage, element.tax, element.ppu, element.description]})
        })
        return decodedData;        
    }

    //strucutre of a products table row
    productsTableRow = () =>{
        return(
            <tr>
                <td><input type="text" name="invoice-product-name" className="form-control-sm invoice-product-name" autocomplete="off"/></td>
                <td><input type="text" name="invoice-product-um" className="form-control-sm invoice-product-um" autocomplete="off"/></td>
                <td><input type="text" name="invoice-product-quantity" className="form-control-sm invoice-product-quantity" autocomplete="off"/></td>
                <td><input type="text" name="invoice-product-tax" className="form-control-sm invoice-product-tax" disabled="true" autocomplete="off"/></td>
                <td><input type="text" name="invoice-product-ppi" className="form-control-sm invoice-product-ppi" disabled="false" autocomplete="off"/></td>
            </tr>
        )
    }

    setElementTables=(props)=>{
        this.setState({billingElements:props})
    }

    //the Array containing products data has, for each element, properties and values; based on these, return an Array that can be sent to the server
    billedProductsServerFormat=(data)=>{
        let responseArray=[]
        data.forEach((element, index)=>{
            //only the newly added
            if(element.properties.preloaded===false){
                element.data.push(element.properties.id)
                responseArray.push(element.data)
            }                        
        })        

        return responseArray;
    }

    //submits data to the server
    submitData = (event) => {
        //prevent default submit
        event.preventDefault(); 

        let method="POST";
        let dataToBeSent = ({});

        //logic for a new invoice
        if(this.state.invoiceID===null){

            //creates an invoice for a predefined client - user-data is preloaded, shouldn't be checked
            if(this.state.activeClient!=null){ 

            //non-recurrent
            dataToBeSent=({clientID: this.state.activeClient, billingProducts: this.billedProductsServerFormat(this.state.tableElements), invoice_status: this.state.invoice_status, invoice_pay_method: this.state.invoice_pay_method, invoice_bank_ref: this.state.invoice_bank_ref})
                
            //creates an invoice for a non-existent user - no preloaded user-data
            }else{
                //don't submit an invoice with no user data
                if(!this.clientDataValid()){
                    console.log("clientDatainvalid")
                    this.setState({alertUser:"Invalid form data!"})
                    return false
                }

                dataToBeSent=({
                    client_type: event.target.client_type.value, 
                    client_first_name: event.target.client_first_name.value, 
                    client_last_name: event.target.client_last_name.value, 
                    client_phone: event.target.client_phone.value, 
                    client_email: event.target.client_email.value, 
                    client_county: event.target.client_county.value, 
                    client_city: event.target.client_city.value, 
                    client_street: event.target.client_street.value, 
                    client_adress_number: event.target.client_adress_number.value, 
                    client_zip: event.target.client_zip.value, 
                    billingProducts: this.billedProductsServerFormat(this.state.tableElements), 
                    invoice_status: this.state.invoice_status, 
                    invoice_pay_method: this.state.invoice_pay_method
                })
                if(dataToBeSent.client_type==="comp"){
                    dataToBeSent.client_fiscal_2 = event.target.client_fiscal_2.value
                    dataToBeSent.client_fiscal_1 = event.target.client_fiscal_1.value
                } 
                if(dataToBeSent.invoice_pay_method==="bank")  dataToBeSent.invoice_bank_ref = this.state.invoice_bank_ref
            }
        }else{
            method="PUT";           
            dataToBeSent.billingProducts=this.billedProductsServerFormat(this.state.tableElements)
            dataToBeSent.invoiceID=this.state.invoiceID;
        }        
        
        //sends data
        fetch(`http://localhost:3000/invoices`, {
            method:method,
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify(dataToBeSent)
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                let invoiceID = this.state.invoiceID

                //if we updated some data, let's reinterogate the server and reset with the data on DB
                //this should prevent certain issues, like removing a newly submitted product that doesn't have an entry
                if(method==="POST"){
                    invoiceID = data.invoiceID
                    this.setState({invoiceID: invoiceID})
                    //notify the user
                    this.setState({alertUser:"Factura creata", dataModified:false})
                }else{
                    //notify the user
                    this.setState({alertUser:"Factura modificata", dataModified:false})  
                }
                //all is good, reload data; use a local because the state-update can be too slow and the state.invoiceID will be kept null when fetchInvoiceData is called
                this.fetchInvoiceData(invoiceID)
            }else if(data.status==="SERVER_ERROR"){
                this.setState({alertUser:"Baza de date nu poate fi accesata"})
            }else{
                this.setState({alertUser:"An error occured"})
            }
        })
    }

    handleSelect = (event) =>{
        let triggerName = event.target.name;
        
        if(triggerName==="billingType"){
            if(event.target.value==="recurring-billing-option" && this.state.activeClient===null){
                this.setState({
                    alertUser:"Recurrent invoices can be created for registered users only!",
                    billingType: "one-time-billing-option"
                })
                return;
            }
        }
        this.setState({[triggerName]: event.target.value, dataModified:true});
        event.target.attributes.getNamedItem('modified').value=true;        
    }


    //pretty obvious what it does
    calculateTotalandTax(){
        let total=0;
        let tax=0;
        this.state.tableElements.forEach(element=>{
            //quantity and price should be >0
            if(element.data[2]*element.data[5]>0){
                total=total+(element.data[2]*element.data[5])
                element.data[4]=parseFloat((((element.data[2]*element.data[5])/100)*element.data[3]))
                tax=tax+element.data[4]
            }
        })  
        this.setState({
            total_prod_price:parseFloat(total).toFixed(2),
            total_tax:parseFloat(tax).toFixed(2)
        })        
    }

    //when the value of a input changes, it is first validated
    validateAndUpdate = (event) => { 
        let value=event.target.value
        let eventName=event.target.getAttribute('name') 
        let position = event.target.getAttribute('position').split(',')     
        let validNumber = new RegExp(/^\d*\.?\d*$/);

        switch (eventName){
            case "product_name":
                this.updateTable(position, value, (this.state.invoiceID===null ? false : true))
                break
            case "product_um":
                this.updateTable(position, value, (this.state.invoiceID===null ? false : true))
                break
            case "product_quantity":
                if(validNumber.test(value)){
                    this.updateTable(position, value, (this.state.invoiceID===null ? false : true));
                    this.calculateTotalandTax()
                }
                break                 
            case "product_tax":
                if(validNumber.test(value)){
                    this.updateTable(position, value, (this.state.invoiceID===null ? false : true))
                    this.calculateTotalandTax()
                }
                break    
            case "product_price":
                if(validNumber.test(value)){
                    this.updateTable(position, value, (this.state.invoiceID===null ? false : true))
                    this.calculateTotalandTax()
                }
                break   
            default:  
                this.updateTable(position, value, (this.state.invoiceID===null ? false : true))                    
        }        
    }


    updateTable = (position, value) =>{
        let items = [...this.state.tableElements]
        items[position[0]].data[position[1]]=value;
        this.setState({tableElements: items})  
        this.setState({dataModified:true}) 
    }

    addNewRow = () =>{
        this.setState({tableElements:[...this.state.tableElements,{properties:{preloaded:false, id:null, entry:null, valid:true}, data:["", "", "1", "0", "0", ""]}]})
        this.calculateTotalandTax()
    }

    //element added from predefined products list
    addPredefinedElement = (dataObject) =>{
        let productAlready=false
        //make sure that the predefined product isnt already in the invoice
        this.state.tableElements.forEach(element=>{
            if(element.properties.id){
                if(element.properties.id===dataObject.id){
                    productAlready=true;
                    this.setState({alertUser:"Product already added!"})
                    return false
                }
            }
        })

        if(!productAlready){
            //remove the last row if it is empty
            if((this.state.tableElements[this.state.tableElements.length-1].data[0])===""){
                //create a copy of the array, modify the element and setState
                let arr = this.state.tableElements
                //remove the last element from the copy
                arr.pop()
                //update the state table
                this.setState({tableElements: arr})           
            }

            //add a new row
            this.setState({
                tableElements:[...this.state.tableElements,{properties:{preloaded:false, id:dataObject.id, entry: null, valid:true}, data:[dataObject.name, dataObject.um, "1", dataObject.tax, parseFloat(((dataObject.price/100)*dataObject.tax)).toFixed(2), dataObject.price, dataObject.description]}],
                total_tax:parseFloat(parseFloat(this.state.total_tax)+((dataObject.price/100)*dataObject.tax)).toFixed(2), total_prod_price:parseFloat(parseFloat(this.state.total_prod_price)+(dataObject.price)).toFixed(2),
                predefinedList: false,
                dataModified: true
            })
        }

    }

    //remove an entry from the products table
    //entry has value if the product is a product already saved in the database and linked with the invoice OR is null because the row has been added but not submitted
    removeEntry=(rowIndex)=>{
        let entry=this.state.tableElements[rowIndex].properties.entry
        //element does not have an entry, no need to alter the database
        if(entry===null){
            this.removeTableElement(rowIndex)
            return false
        }
        //remove the product from the database
        fetch(`http://localhost:3000/billed_products/${entry}`,{
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json()).then(data=>{
            //succesfull in removing the element from the DB
            if(data.status==="OK"){
                this.removeTableElement(rowIndex)
            }else if(data.status==="SERVER_ERROR"){
                this.setState({alertUser:"Baza de date nu poate fi accesata"})
            }else{
                this.setState({alertUser:"Eroare"})
            }
        })
    }

    //takes a row index as parameter; remove the row from the data-set, updates totals
    removeTableElement=(rowIndex)=>{
        let shallowCopy=this.state.tableElements
        shallowCopy.splice(rowIndex, 1)
        this.setState({tableElements:shallowCopy})
        this.calculateTotalandTax()
    }

    setInvoiceFinalised = () =>{
        let invoiceID = this.state.invoiceID
        fetch(`http://localhost:3000/invoices`, {
            method:"PUT",
            headers: { 'Content-Type': 'application/json' },
            body:JSON.stringify({invoice_status: "finalised", invoiceID})
        })
        .then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                this.setState({invoice_status:"finalised"})
            }else if(data.status==="SERVER_ERROR"){
                this.setState({alertUser:"Factura setata ca finalizata"})
            }else{
                this.setState({alertUser:"A aparut o eroare"})
            }
        })
    }

    generateInvoice = () =>{
        let activeInvoice = this.state.invoiceID
        window.open(`http://localhost:3001/generateInvoice/${activeInvoice}`).focus();
    }

    render()
        {
            return(
                <div className="invoices-add-container p-3">                              
                    <form id="invoice-form" onSubmit={this.submitData}>                              
                        <div className="client-info-container form-sub-container" style={{display:'flex', flexDirection:'column'}}>
                            <h6>Date client</h6>
                            <span>Nume: <b>{this.state.clientData.client_last_name} {this.state.clientData.client_first_name}</b></span>
                            <span>Telefon: <b>{this.state.clientData.client_phone}</b></span>
                            <span>Email: <b>{this.state.clientData.client_email}</b></span> 
                            <span style={{color:'gray'}}>Note: {this.state.clientData.client_notes}</span>                                   
                        </div>
                        <div className="invoice-products-container" style={{marginTop:'20px', marginBottom:'20px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <h6>Produse</h6>
                                <div class="btn-group" role="group">
                                    <button title="Rand nou" type="button" className="btn btn-light btn-sm" disabled={(this.state.invoice_status==="finalised") ? true : false} onClick={this.addNewRow}><span className="action-button-label"><span style={{fontSize:'18px'}} className="material-icons-outlined">add</span></span></button>
                                    <button title="Predefinite" type="button" className="btn btn-light btn-sm" disabled={(this.state.invoice_status==="finalised") ? true : false} onClick={()=>{this.setState({predefinedList: true})}}><span className="action-button-label"><span style={{fontSize:'18px'}} className="material-icons-outlined">apps</span></span></button>
                                </div>
                            </div>
                            <div className="billing-products-body">
                                <table className="table new-invoice-table">
                                    <thead>
                                        <tr>
                                            <td className="col-2">Nume</td>
                                            <td className="col-1">Unitate</td>
                                            <td className="col-1">Cantitate</td>
                                            <td className="col-1">Pret</td>
                                            <td className="col-6">Descriere</td>
                                            <td className="col-1">Pret total</td>                                            
                                            <td></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        this.state.tableElements.map((element, index)=>(
                                            <tr key={index}>
                                                <td><input type="text" className={element.properties.valid ? "form-control shadow-none" : "form-control invalid-input shadow-none"} name="product_name" disabled={element.properties.preloaded===true ? true : false} position={[index,0]} autoComplete="off" value={element.data[0]} onChange={this.validateAndUpdate}/></td>
                                                <td><input type="text" className={element.properties.valid ? "form-control shadow-none": "form-control invalid-input shadow-none"} name="product_um" disabled={element.properties.preloaded===true ? true : false} position={[index,1]} autoComplete="off" value={element.data[1]} onChange={this.validateAndUpdate}/></td>
                                                <td><input type="text" className={element.properties.valid ? "form-control shadow-none" : "form-control invalid-input shadow-none"}name="product_quantity" disabled={element.properties.preloaded===true ? true : false} position={[index,2]} autoComplete="off" value={element.data[2]} onChange={this.validateAndUpdate} /></td>
                                                <td><input type="text" className={element.properties.valid ? "form-control shadow-none": "invalid-input shadow-none"} name="product_price" disabled={element.properties.preloaded===true ? true : false} position={[index,5]} autoComplete="off" value={element.data[5]} onChange={this.validateAndUpdate} /></td>
                                                <td><input type="text" className={element.properties.valid ? "form-control shadow-none" : "form-control invalid-input shadow-none"}name="product_description" disabled={element.properties.preloaded===true ? true : false} position={[index,6]} autoComplete="off" value={element.data[6]} onChange={this.validateAndUpdate}/></td>
                                                <td><input type="text" rows="1" className="product_ppu form-control shadow-none" name="product_price" disabled={true} position={[index,6]} autoComplete="off" value={parseFloat(element.data[5]*element.data[2]).toFixed(2)} onChange={this.validateAndUpdate}/></td>
                                                <td style={{paddingLeft:'5px', paddingRight:'5px'}}><button type="button" title="Stergere" className="remove-product-button round-button" disabled={((this.state.invoice_status==="finalised") ? true : false)||(this.state.tableElements.length<2)} onClick={()=>{this.removeEntry(index)}}><span className="material-icons-outlined">remove</span></button></td>
                                            </tr>
                                        ))
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <div className="billing-products-footer">
                                <h6>Total: {this.state.total_prod_price}</h6>
                            </div>
                        </div>
                        <div class="btn-group" role="group">
                            <button className="btn btn-success btn-sm" disabled={(this.state.dataModified) ? false : true} form="invoice-form" id="submit-invoice-button"><span class="action-button-label"><span class="material-icons-outlined">check</span>Salvare</span></button>                                                           
                            <button title="Finalizare" type="button" className="btn btn-success btn-sm" disabled={(this.state.invoice_status==="finalised" || this.state.invoiceID===null) ? true : false} onClick={()=>{this.setInvoiceFinalised()}}><span class="action-button-label"><span class="material-icons-outlined">task_alt</span></span></button>
                            <button title="Generare" type="button" className="btn btn-success btn-sm" disabled={(this.state.invoiceID===null) ? true : false} onClick={()=>{this.generateInvoice()}}><span class="action-button-label"><span class="material-icons-outlined">file_open</span></span></button>
                        </div>
                    </form>
                    {this.state.predefinedList&&
                        <div> 
                            <div className="blur-overlap"></div>                                 
                            <div className="overlapping-component-inner">
                                <div className='overlapping-component-header'>
                                    <span>Predefinite</span>
                                    <button type="button" className="action-close-window" onClick={()=>{this.setState({predefinedList: false})}}><span className="material-icons-outlined">close</span></button>
                                </div>
                                <PredefinedProducts addElement={this.addPredefinedElement} insertable={true}/> 
                            </div>              
                        </div>
                    }                                              
                    <Snackbar text={this.state.alertUser} closeSnack={()=>{this.setState({alertUser:null})}}/>        
                </div>
            ) 
        }   

}

