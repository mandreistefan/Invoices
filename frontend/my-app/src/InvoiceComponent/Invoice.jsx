import React from "react";
import ClientForm from '../ClientForm/ClientForm.jsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './InvoiceAdd.css';
import Snackbar from '../Snackbar/Snackbar.jsx'
import PredefinedProducts from '../PredefinedProducts/ExistingProducts.jsx'

export default class Invoice extends React.Component{
    
    //set the elements we will be working with
    constructor(props) {
        super(props);
        this.state = {
            invoiceID: (props.invoiceID) ? props.invoiceID : null,
            userData: null,
            billingType: "one-time-billing-option",
            billingFrequency: "monthly-billing",
            monthlyBillingDate: new Date(),
            yearlyBillingDate: new Date(),
            //id: products can have IDs if the products are added from the predefined products list; preloaded - the product has been preloaded from prop data; valid - i want to use this to validate form data
            tableElements: [{properties:{preloaded:false, id:null, entry: null, valid:true}, data:["", "", "", "0", "0", "", ""]}],
            total_prod_quantity: 0,
            total_prod_price: 0,  
            total_tax:0,
            activeClient: props.activeClient ? props.activeClient : null,
            alertUser: null,
            invoice_server_status: "draft",
            invoice_status: "draft",
            invoice_pay_method: "cash",            
            invoice_bank_ref: "",
            isFormDisabled: false,
            predefinedList: false,
            refreshFunction: props.refresh,
            dataModified: false
        };
    }

    //let's check for some invoice data
    componentDidMount(){
        //fill the data from the DB
        if(this.state.invoiceID){
            this.fetchInvoiceData(this.state.invoiceID)
        }
    }

    //gets all the data linked to an invoice; sets the state of certain elements based on retrieved data
    fetchInvoiceData=(invoice)=>{
        fetch(`http://localhost:3000/invoice?filter=invoiceID&filterBy=${invoice}`).then(response=>response.json()).then(data=>{
            let invoiceData = data.data
            this.setState({
                userData: {
                    client_type: invoiceData.invoiceProperty.client_type, 
                    client_fiscal_1: invoiceData.invoiceProperty.client_fiscal_1, 
                    client_fiscal_2: invoiceData.invoiceProperty.client_fiscal_2,
                    client_first_name: invoiceData.invoiceProperty.client_first_name, 
                    client_last_name: invoiceData.invoiceProperty.client_last_name, 
                    client_phone: invoiceData.invoiceProperty.client_billing_adress.phone,
                    client_email: invoiceData.invoiceProperty.client_billing_adress.email,
                    client_county: invoiceData.invoiceProperty.client_billing_adress.county,
                    client_city: invoiceData.invoiceProperty.client_billing_adress.city,
                    client_street: invoiceData.invoiceProperty.client_billing_adress.street,
                    client_adress_number: invoiceData.invoiceProperty.client_billing_adress.number,
                    client_zip: invoiceData.invoiceProperty.client_billing_adress.zip
                },
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

    //small valdiations at submit
    clientDataValid=()=>{
        let validatingThis;
        //first name
        validatingThis=document.getElementById("client_first_name").value
        if(validatingThis.length==0){
            console.log("Invalid data for first name")
            return false
        }
        //phone name
        validatingThis=document.getElementById("client_phone").value
        if(validatingThis.length!=10){
            console.log("Invalid data for phone")
            return false
        }
        //email - only if filled
        validatingThis=document.getElementById("client_email").value        
        if(validatingThis.length>0){
            if((validatingThis.indexOf("@")==-1)||(validatingThis.indexOf(".")==-1)){
                console.log("Invalid data for email")
                return false
            }
        }
        //last name
        validatingThis=document.getElementById("client_county").value
        if(validatingThis.length==0){
            console.log("Invalid data for county")
            return false
        }
        //last name
        validatingThis=document.getElementById("client_city").value
        if(validatingThis.length==0){
            console.log("Invalid data for city")
            return false
        }
        //last name
        validatingThis=document.getElementById("client_street").value
        if(validatingThis.length==0){
            console.log("Invalid data for street")
            return false
        }
        //all good
        return true
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
            //set recurrency properties
            let billingReccurencyDate;
            let isReccurent = (this.state.billingType==="one-time-billing-option") ? false : true;
            if(isReccurent){
                switch(this.state.billingFrequency){
                    case "monthly-billing":
                        billingReccurencyDate=this.state.monthlyBillingDate;
                        break;
                    case "yearly-billing":
                        billingReccurencyDate=this.state.yearlyBillingDate;
                        break;
                    default:
                        billingReccurencyDate=new Date();
                        break; 
                }
            }

            //creates an invoice for a predefined client - user-data is preloaded, shouldn't be checked
            if(this.state.activeClient!=null){ 
                //recurrent invoices           
                if(isReccurent){
                    dataToBeSent=({clientID: this.state.activeClient, billingProducts: this.billedProductsServerFormat(this.state.tableElements), billingReccurency: isReccurent, billingFrequency: this.state.billingFrequency, billingReDate: billingReccurencyDate})
                }else{
                    //non-recurrent
                    dataToBeSent=({clientID: this.state.activeClient, billingProducts: this.billedProductsServerFormat(this.state.tableElements), invoice_status: this.state.invoice_status, invoice_pay_method: this.state.invoice_pay_method, invoice_bank_ref: this.state.invoice_bank_ref})
                }
            //creates an invoice for a non-existent user - no preloaded user-data
            }else{
                //don't submit an invoice with no user data
                if(!this.clientDataValid()){
                    console.log("clientDatainvalid")
                    this.setState({alertUser:"Invalid form data!"})
                    return false
                }
                dataToBeSent=({client_type: event.target.client_type.value, client_first_name: event.target.client_first_name.value, client_last_name: event.target.client_last_name.value, client_phone: event.target.client_phone.value, client_email: event.target.client_email.value, client_county: event.target.client_county.value, client_city: event.target.client_city.value, client_street: event.target.client_street.value, client_adress_number: event.target.client_adress_number.value, client_zip: event.target.client_zip.value, client_phone: event.target.client_phone.value, billingProducts: this.billedProductsServerFormat(this.state.tableElements), invoice_status: this.state.invoice_status, invoice_pay_method: this.state.invoice_pay_method, invoice_bank_ref: this.state.invoice_bank_ref})
                if(dataToBeSent.client_type==="comp"){
                    dataToBeSent.client_fiscal_2 = event.target.client_fiscal_2.value
                    dataToBeSent.client_fiscal_1 = event.target.client_fiscal_1.value
                } 
            }
        }else{
            method="PUT";
            //editing an existing invoice that has an ID
            if(event.target.client_first_name.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_first_name=event.target.client_first_name.value;
            if(event.target.client_last_name.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_last_name=event.target.client_last_name.value;
            if(event.target.client_phone.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_phone=event.target.client_phone.value;
            if(event.target.client_type.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_type=event.target.client_type.value;
            if(event.target.client_type.value==="comp"){
                if(event.target.client_fiscal_1.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_fiscal_1=event.target.client_fiscal_1.value;
                if(event.target.client_fiscal_2.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_fiscal_2=event.target.client_fiscal_2.value;     
            }
            if(event.target.client_email.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_email=event.target.client_email.value;
            if(event.target.client_county.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_county=event.target.client_county.value;
            if(event.target.client_city.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_city=event.target.client_city.value;
            if(event.target.client_street.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_street=event.target.client_street.value;
            if(event.target.client_adress_number.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_adress_number=event.target.client_adress_number.value;
            if(event.target.client_zip.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_zip=event.target.client_zip.value;
            if(event.target.client_phone.attributes.getNamedItem('modified').value==="true") dataToBeSent.client_phone=event.target.client_phone.value;            
            if(event.target.invoice_status.attributes.getNamedItem('modified').value==="true") dataToBeSent.invoice_status=event.target.invoice_status.value;
            if(event.target.invoice_status.value==="finalised"){
                if((event.target.invoice_pay_method.attributes.getNamedItem('modified').value==="true")||(event.target.invoice_status.value==="finalised")) dataToBeSent.invoice_pay_method=event.target.invoice_pay_method.value;
                if(event.target.invoice_pay_method.value==="bank") dataToBeSent.invoice_bank_ref=event.target.invoice_bank_ref.value
            }       

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
        this.state.tableElements.map(element=>{
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
        this.state.tableElements.map(element=>{
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
            this.setState({tableElements:[...this.state.tableElements,{properties:{preloaded:false, id:dataObject.id, entry: null, valid:true}, data:[dataObject.name, dataObject.um, "1", dataObject.tax, parseFloat(((dataObject.price/100)*dataObject.tax)).toFixed(2), dataObject.price]}]})
            this.setState({total_tax:parseFloat(parseFloat(this.state.total_tax)+((dataObject.price/100)*dataObject.tax)).toFixed(2), total_prod_price:parseFloat(parseFloat(this.state.total_prod_price)+(dataObject.price)).toFixed(2)})

            //close the predefined elements list
            this.setState({predefinedList: false})
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
        fetch(`http://localhost:3000/products/${entry}`,{
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response=>response.json())
        .then(data=>{
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

    render()
        {
            return(
                <div className="invoices-add-container">                              
                    <form id="invoice-form" onSubmit={this.submitData}>
                            <div className="client-info-container form-sub-container">
                                <ClientForm editable={((this.state.activeClient!=null)||this.state.isFormDisabled||this.state.invoiceID!=null||this.state.invoice_status==="finalised") ? false : true} isSubmitable={false} clientID={this.state.activeClient} userData={this.state.userData}/>
                            </div>  
                            <h6>Setari factura</h6>
                            <div className="row">
                                <div className="col-md-2">
                                    <span className="form-subsection-label">Tip *</span>                  
                                    <div className="form-group">  
                                        <select className="form-control form-control-sm" id="billing-type" name="billingType" value={this.state.billingType} modified="false" onChange={this.handleSelect} disabled={((this.state.activeClient!=null) ? false : true)||this.state.invoice_status==="finalised"}>
                                            <option value="one-time-billing-option">Unica</option>
                                            <option value="recurring-billing-option">Recurenta</option>
                                        </select>
                                    </div>    
                                </div>
                                {this.state.billingType==="recurring-billing-option" && this.state.activeClient &&    
                                    <div className="form-group col-md-2">  
                                        <label htmlFor="billing-frequency">Billing frequency:</label><br/>
                                        <select className="form-control form-control-sm" id="billing-frequency" name="billingFrequency" modified="false" onChange={this.handleSelect} disabled={(this.state.invoice_server_status==="finalised") ? true : false}>
                                            <option value="monthly-billing">Monthly</option>
                                            <option value="yearly-billing">Yearly</option>
                                        </select>
                                    </div> 
                                }
                                {this.state.billingType==="recurring-billing-option" && this.state.activeClient && this.state.billingFrequency==="monthly-billing" &&
                                    <div className="form-group col-md-2">  
                                        <label htmlFor="billing_rec">Billing date:</label><br/>
                                        <DatePicker id="billing-date-monthly"  selected={this.state.monthlyBillingDate} disabled={(this.state.invoice_server_status==="finalised") ? true : false} onChange={(date:Date) => this.setState({monthlyBillingDate:date})}/>
                                    </div>                                                
                                }   
                                {this.state.billingType==="recurring-billing-option" && this.state.activeClient && this.state.billingFrequency==="yearly-billing" &&
                                    <div className="form-group col-md-2">  
                                        <label htmlFor="billing_rec">Billing date:</label><br/>
                                        <DatePicker id="billing-date-yearly"  selected={this.state.yearlyBillingDate} disabled={(this.state.invoice_server_status==="finalised") ? true : false} onChange={(date:Date) => this.setState({yearlyBillingDate:date})}/>
                                    </div>
                                }                                
                            </div>
                            
                            <div>                                
                                <div className="save-as-container">                                      
                                    <div className="form-group col-md-2">  
                                        <span className="form-subsection-label">Status **</span><br/>  
                                        <select className="form-control form-control-sm shadow-none" id="invoice_status" name="invoice_status" value={this.state.invoice_status} modified="false" disabled={(this.state.invoice_server_status==="finalised") ? true : false} onChange={this.handleSelect}>
                                            <option hidden={(this.state.isFormDisabled) ? true : false} value="draft">Ciorna</option>
                                            <option value="finalised">Finalizata</option>
                                        </select>
                                    </div> 
                                    {this.state.invoice_status==="finalised" &&
                                        <div className="form-group col-md-2">  
                                            <span className="form-subsection-label">Plata cu:</span><br/>
                                            <select className="form-control form-control-sm shadow-none" id="invoice_pay_method" name="invoice_pay_method" disabled={(this.state.invoice_server_status==="finalised") ? true : false} value={this.state.invoice_pay_method} modified="false" onChange={this.handleSelect}>
                                                <option value="cash">Cash</option>
                                                <option value="bank">Banca</option>
                                            </select>
                                        </div>
                                    }
                                    {this.state.invoice_pay_method==="bank" &&
                                        <div className="form-group col-md-2">   
                                            <span className="form-subsection-label">Ref:</span><br/>
                                            <input type="text" id="invoice_bank_ref" name="invoice_bank_ref" className="form-control shadow-none" modified="false" onChange={this.handleSelect}  disabled={(this.state.invoice_server_status==="finalised") ? true : false} value={this.state.invoice_bank_ref}/>
                                        </div>
                                    }
                                </div> 
                                {false&&<div className="alert alert-secondary" style={{marginTop:'20px',marginLeft:'10px', marginRight:'10px'}} role="alert">
                                    <p className="lead" style={{fontSize: '16px', marginBottom:'0'}}>* Option not available<br/>
                                        ** Invoices ca be saved as:
                                        <ul class="info-text-list">
                                            <li><b>Drafts</b>: an invoice that is saved and can be further edited</li>
                                            <li><b>Finalised</b>: the invoice is permanenlty closed and the user has been billed</li>
                                        </ul>
                                    </p>
                                </div>}
                            </div>
                            
                            <div className="billing-products-container form-sub-container">
                                <h6>Produse facturate</h6>                                 
                                <div className="invoice-products-container form-group"> 
                                        <div className="">
                                            <div className="row billing-products-header">
                                                <div className="col-3">Nume</div>
                                                <div className="col-2">UM</div>
                                                <div className="col-1">Cantitate</div>
                                                <div className="col-1">Taxa(%)</div>
                                                <div className="col-1">Taxa</div>
                                                <div className="col-1">Pret</div>
                                                <div className="col-1">Pret total</div>
                                                <div className="col-1"></div>
                                            </div>
                                            <div className="billing-products-body">
                                                {                                                
                                                    this.state.tableElements.map((element, index)=>(
                                                        <div>
                                                            <div className="row" key={index} id={index}>
                                                                <div className="col-3"><input type="text" className={element.properties.valid ? "product_name form-control shadow-none" : "product_name form-control invalid-input shadow-none"} name="product_name" disabled={element.properties.preloaded===true ? true : false} position={[index,0]} autoComplete="off" value={element.data[0]} onChange={this.validateAndUpdate}/></div>
                                                                <div className="col-2"><input type="text" className={element.properties.valid ? "product_um form-control shadow-none": "product_um form-control invalid-input shadow-none"} name="product_um" disabled={element.properties.preloaded===true ? true : false} position={[index,1]} autoComplete="off" value={element.data[1]} onChange={this.validateAndUpdate}/></div>
                                                                <div className="col-1"><input type="text" className={element.properties.valid ? "product_q form-control shadow-none" : "product_q form-control invalid-input shadow-none"}name="product_quantity" disabled={element.properties.preloaded===true ? true : false} position={[index,2]} autoComplete="off" value={element.data[2]} onChange={this.validateAndUpdate}/></div>
                                                                <div className="col-1"><input type="text" className={element.properties.valid ? "product_tax form-control shadow-none": "product_tax form-control invalid-input shadow-none"} name="product_tax"  disabled={element.properties.preloaded===true ? true : false} position={[index,3]} autoComplete="off" value={element.data[3]} onChange={this.validateAndUpdate}/></div>
                                                                <div className="col-1"><input type="text" className={element.properties.valid ? "product_tax form-control shadow-none": "product_tax form-control invalid-input shadow-none"} name="product_tax_value"  position={[index,4]} autoComplete="off" disabled={true} value={parseFloat(element.data[4]).toFixed(2)}/></div>
                                                                <div className="col-1"><input type="text" className={element.properties.valid ? "product_ppu form-control shadow-none": "product_ppu form-control invalid-input shadow-none"} name="product_price" disabled={element.properties.preloaded===true ? true : false} position={[index,5]} autoComplete="off" value={element.data[5]} onChange={this.validateAndUpdate}/></div>
                                                                <div className="col-3" style={{display:"flex", flexDirection:"row", alignItems:'center'}}>
                                                                    <input type="text" rows="1" className="product_ppu form-control shadow-none" name="product_price" disabled={true} position={[index,6]} autoComplete="off" value={parseFloat(element.data[5]*element.data[2]).toFixed(2)} onChange={this.validateAndUpdate}/>
                                                                    <button type="button" title="Stergere" style={{marginLeft:'5px'}} className="remove-product-button" disabled={((this.state.invoice_status==="finalised") ? true : false)||(this.state.tableElements.length<2)} onClick={()=>{this.removeEntry(index)}}><span className="material-icons-outlined">close</span></button>
                                                                </div>
                                                            </div> 
                                                            <div className="row" style={{marginTop:"5px"}}>
                                                                <div className="col-12">
                                                                    <input type="text" className={element.properties.valid ? "product_description form-control shadow-none": "product_description form-control invalid-input shadow-none"} name="product_description" disabled={element.properties.preloaded===true ? true : false} position={[index,6]} autoComplete="off" value={element.data[6]} onChange={this.validateAndUpdate}/>
                                                                </div>
                                                            </div>
                                                        </div>                                                             
                                                    ))                                                
                                                }
                                            </div>
                                            <div className="row billing-products-footer">
                                                <div className="col-3" style={{visibility:'hidden'}}><input type="text" className="product_name_total billing-products-footer-input" disabled={true} /></div>
                                                <div className="col-2" style={{visibility:'hidden'}}><input type="text" className="product_um_total billing-products-footer-input" disabled={true} /></div>
                                                <div className="col-1" style={{visibility:'hidden'}}><input type="text" className="product_q_total billing-products-footer-input" disabled={true} /></div>
                                                <div className="col-1" style={{visibility:'hidden'}}><input type="text" className="product_tax billing-products-footer-input" disabled={true} /></div>
                                                <div className="col-1" style={{visibility:'hidden'}}><input type="text" className="product_tax billing-products-footer-input" disabled={true} /></div>
                                                <div className="col-1" style={{visibility:'hidden'}}><input type="text" className="product_tax_total billing-products-footer-input" disabled={true} value={`${this.state.total_tax}`}/></div>
                                                <div className="col-3"><input type="text" className="form-control shadow-none" style={{fontWeight:'600'}} id="product_price_total" disabled={true} value={`${this.state.total_prod_price} RON`}/></div>
                                            </div>
                                        </div>
                                    <button type="button" className="btn btn-light btn-sm" disabled={(this.state.invoice_server_status==="finalised") ? true : false} style={{marginRight:'5px'}} onClick={this.addNewRow}><span className="action-button-label"><span className="material-icons-outlined">add</span>Rand nou</span></button>
                                    <button type="button" className="btn btn-light btn-sm" disabled={(this.state.invoice_server_status==="finalised") ? true : false} onClick={()=>{this.setState({predefinedList: true})}}><span className="action-button-label"><span className="material-icons-outlined">apps</span>Predefinite</span></button>
                                </div>
                            </div>  
                            <button className="w-100 btn btn-primary btn-lg" disabled={(this.state.dataModified) ? false : true} form="invoice-form" id="submit-invoice-button"><span className="action-button-label">SALVARE</span></button>                                                          
                    </form>
                    {this.state.predefinedList&&
                        <div> 
                            <div className="blur-overlap"></div>     
                            <button type="button" className="action-close-window" onClick={()=>{this.setState({predefinedList: false})}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                            <div className="overlapping-component-inner">
                                <PredefinedProducts addElement={this.addPredefinedElement} insertable={true}/> 
                            </div>              
                        </div>
                    }                                              
                    <Snackbar text={this.state.alertUser} closeSnack={()=>{this.setState({alertUser:null})}}/>        
                </div>
            ) 
        }   

}

