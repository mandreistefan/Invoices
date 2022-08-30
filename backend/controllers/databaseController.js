
const databaseOperations = require('./databaseOperations.js') 
const utile = require('../utils/util.js')

async function fetchClients(querryObject){
    //client data
    let clientData = await databaseOperations.getAllClients(querryObject)
    if(clientData.status!=="OK") return({status: "ERROR"})
    //total number of clients
    let totalRecordsNumber = await databaseOperations.getRecordsNumber("clients", querryObject.filter, querryObject.filterBy)
    return({
        status:"OK",
        totalRecordsNumber: totalRecordsNumber,
        data:clientData.data
    })
}

function handleClientData(data, callback){
    if(data.clientID!=null){
        databaseOperations.editElement(data)
        .then(result=>{
            callback(result)
        })
        .catch(err=>{
            callback(utile.returnal("ERROR", null))
        })
    }else{
        databaseOperations.addElement(data)
        .then(result=>{
            callback(result)
        })
        .catch(err=>{
            callback(utile.returnal("ERROR", null))
        })
    }
}

function addInvoice(data, callback){
    //reccurency
    if(data.billingReccurency===true){   
        let currentDate=new Date()
        currentDate.setHours(12, 00, 00)
        let billingDate=new Date(data.billingReDate)
        billingDate.setHours(12, 00, 00)
        //billing date is in the past
        console.log(`Billing date is: ${billingDate} and current date is: ${currentDate}`)
        /*if(billingDate<currentDate){
            console.log("Time travel alert")
            callback({
                status: "FAIL", 
                data: "Software is not a time traveler, invoice cannot be created in the past"
            })
            return false
        }*/
        //create a recurrent schema -> register products and link them to the schema -> check if the recurrency has the today date -> if yes, generate the first invoice of the recurrency
        //creates the recurrent scheleton by creating a SCHEMA and registering PRODUCTS linked with the schema; will be used for future invoice generator
        databaseOperations.createRecurrentBillSchema(data.clientID, data.billingFrequency, data.billingReDate, data.billingProducts)
        .then(result=>{            
            if(result.status==="OK"){
                let recSchema = result.data;    
                //adds an invoice linked to the SCHEMA 

                //billing starts today            
                if((currentDate.getFullYear()===billingDate.getFullYear())&&(currentDate.getMonth()===billingDate.getMonth())&&(currentDate.getDate()===billingDate.getDate())){
                    
                    //currently, data is an object with a productID key:value; data should be sent forward as array containing name, price, quantity, etc..
                    //for recurrencies that issue invoices "today", there is no need to re-querry the database for properties of products, the properties are up-to-date
                    data.billingProducts.forEach((element, index)=>{
                        data.billingProducts[index]=element.data
                    })                         
                    //creates an invoice in today's date
                    databaseOperations.addInvoice(data).then(result=>{
                        if(result.status==="OK"){
                            //update a common column in the database to link
                            databaseOperations.linkInvoiceToRecSchema(recSchema, result.data)
                            //calculate the next invoice date
                            let futureInvoiceDate = utile.calculateNextInvoiceDate(data.billingFrequency, data.billingReDate)
                            //update the next_billing_date field in the database that will be used to generate a new invoice in the future
                            databaseOperations.setBillingdates(futureInvoiceDate.dateAsMYSQLString, `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`, recSchema).then(response=>{
                                if(response.status==="OK"){
                                    callback(utile.returnal("OK", "Invoice has been created"))
                                }else{
                                    callback(utile.returnal("FAIL", "Something went wrong"))
                                }
                            })
                            .catch(err=>{
                                callback(utile.returnal("FAIL", "FAILED to add the invoice"))
                            })                        
                        }else{
                            callback(utile.returnal("FAILED", "FAILED to add the invoice"))
                        }
                    })
                    .catch(err=>{
                        callback(utile.returnal("ERROR", "ERROR in adding the invoice"))
                    })
                //billing starts somewhere in the future
                }else{
                    let futureInvoiceDate = utile.calculateNextInvoiceDate(data.billingFrequency, data.billingReDate)
                    databaseOperations.setBillingdates(futureInvoiceDate.dateAsMYSQLString, null, recSchema)
                    .then(response=>{
                        if(response.status==="OK"){
                            callback(utile.returnal("OK", "Invoice has been created"))
                        }else{
                            callback(utile.returnal("FAIL", "Something went wrong"))
                        }
                    })
                    .catch(err=>{
                        console.log(err)
                        callback(utile.returnal("FAIL", "FAILED to add the invoice"))
                    })    
                }
            }
        })
        .catch(err=>{
            callback(utile.returnal("ERROR", "ERROR in creating the recurrent schema"))
        })
    //non-recurrent     
    }else{
        databaseOperations.addInvoice(data).then(result=>{
            //null result means no invoice created
            if(result===null){
                callback(null)
            }else{
                callback({
                    status: result.status,
                    message: result.status==="OK" ? "Invoice created" : "Invoice created but an error occured",
                    invoiceID: result.data
                })
            }
        })
        .catch(err=>{
            callback(null)
        })
    }
}

async function fetchInvoices(querryObject){
    let totalNumberOfRecords = 0;
    let invoicesObj = await databaseOperations.getInvoices(querryObject)
    //if we have 10 records, let's check the total number of records for the desired filtering
    if(invoicesObj.data.length===10){
        totalNumberOfRecords = await databaseOperations.getRecordsNumber(querryObject.target, querryObject.filter, querryObject.filterBy)
    }
    if(invoicesObj.status==="OK"){
        return({
            status:"OK", 
            totalRecordsNumber: totalNumberOfRecords,
            data: (querryObject.target==="invoices_recurrent") ? utile.procesRecData(invoicesObj.data) : invoicesObj.data            
        })               
    }else{
        return({status:"ERROR"})
    }
}

function fetchRecInvData(queryFilter, queryFilterData, callback){
    let returnArr={
        generalInfo:[],
        nextBilling: null
    }
    databaseOperations.getRecInfo(queryFilter, queryFilterData,)
    .then(data=>{
        if(data.status==="OK"){
            returnArr.generalInfo=data.data
            let recDate=null;
           //pretty billing recurrency info
            if(returnArr.generalInfo[0].invoice_recurrency==="monthly-billing"){
                returnArr.generalInfo[0].invoice_recurrency="monthly";
                recDate=returnArr.generalInfo[0].invoice_re_mo_date;
            }else if(returnArr.generalInfo[0].invoice_recurrency==="yearly-billing"){
                returnArr.generalInfo[0].invoice_recurrency="yearly";
                recDate=returnArr.generalInfo[0].invoice_re_y_date;
            }

            returnArr.nextBilling = utile.calculateNextInvoiceDate(data.data[0].invoice_recurrency, recDate)

            callback(utile.returnal("OK", returnArr));   
        }else{
            callback(utile.returnal("FAIL", null));   
        }
    })
    .catch(err=>{
        callback(utile.returnal("ERROR", null))
    })
}

function archiveClient(clientID, callback){
    if(clientID!=null){
        databaseOperations.archiveClientData(clientID)
        .then((data)=>{
            if(data.status==="OK"){
                databaseOperations.deleteClient(clientID)
                .then((data)=>{
                    if(data.status==="OK"){
                        callback({status:"OK"})
                    }else{
                        callback(utile.returnal("FAIL", "FAILED to delete"))
                    }                
                })
                .catch((err)=>{
                    callback(utile.returnal("ERROR", "ERROR at delete"))
                })
            }
        })
        .catch((err)=>{
            callback(utile.returnal("ERROR", "ERROR at archiving"))
        })
    }else{
        callback(utile.returnal("ERROR", "INVALID clientID"))
    }
}

function archiveInvoice(invoiceID, callback){
    if(invoiceID!=null){
        databaseOperations.archiveInvoice(invoiceID)
        .then((data)=>{
            if(data.status==="OK"){
                databaseOperations.deleteInvoice(invoiceID)
                .then((data)=>{
                    if(data.status==="OK"){
                        callback({status:"OK"})
                    }else{
                        callback(utile.returnal("FAIL", "FAILED to delete"))
                    }                
                })
                .catch((err)=>{
                    callback(utile.returnal("ERROR", "ERROR at delete"))
                })
            }
        })
        .catch((err)=>{
            callback(utile.returnal("ERROR", "ERROR archiving invoice data"))
        })
    }else{
        callback(utile.returnal("ERROR", "INVALID invoiceID"))
    }
}

async function fetchInvoiceData(querryObject){
    let dataArray={
        invoiceProperty:({number:"", client_first_name:"", client_last_name:"", client_billing_adress:{county:"", city:"", street:"", number:"", zip:"", phone:"", email:""}, date:"", total:({price:0, tax:0, items:0})}),
        invoiceProducts:{}
    }

    let invoiceData = await databaseOperations.getInvoices(querryObject)
    //if we don't have data, probably the invoice number is not okay
    if(invoiceData.status!=="OK") return ({status:"INVALID_REQUEST"})

    //populate the object
    dataArray.invoiceProperty.number=invoiceData.data[0].invoice_number
    dataArray.invoiceProperty.client_first_name=invoiceData.data[0].client_first_name
    dataArray.invoiceProperty.client_last_name=invoiceData.data[0].client_last_name
    dataArray.invoiceProperty.client_billing_adress.county=invoiceData.data[0].client_county
    dataArray.invoiceProperty.client_billing_adress.city=invoiceData.data[0].client_city
    dataArray.invoiceProperty.client_billing_adress.street=invoiceData.data[0].client_street
    dataArray.invoiceProperty.client_billing_adress.number=invoiceData.data[0].client_adress_number
    dataArray.invoiceProperty.client_billing_adress.zip=invoiceData.data[0].client_zip
    dataArray.invoiceProperty.client_billing_adress.phone=invoiceData.data[0].client_phone
    dataArray.invoiceProperty.client_billing_adress.email=invoiceData.data[0].client_email
    dataArray.invoiceProperty.invoice_date=invoiceData.data[0].invoice_date
    dataArray.invoiceProperty.total.price=invoiceData.data[0].invoice_total_sum

    //products linked with the invoice
    let productData = await databaseOperations.fetchBilledProducts(querryObject.filterBy)

    //can't find the products
    if(productData.status!=="OK") return ({status:"ERROR"})
    let processedProductsData = utile.procesBilledProductsData(productData.data)
    dataArray.invoiceProducts=processedProductsData[0];
    dataArray.invoiceProperty.total.items=processedProductsData[1]
    dataArray.invoiceProperty.total.tax=processedProductsData[2]  

    return dataArray;

}

//processes the data in filterBy and populates the object
function assignCustomDates(filterBy, object){
    //format should be ddmmyy-ddmmyy, to 13 characters
    if(filterBy.length!=13) return false
    //format is start-end
    if(filterBy.indexOf("-")!=6) return false
    let dataArray = filterBy.split("-")
    object.dayStart=dataArray[0][0]+dataArray[0][1]
    object.monthStart=dataArray[0][2]+dataArray[0][3]
    object.yearStart=dataArray[0][4]+dataArray[0][5]
    object.dayEnd=dataArray[1][0]+dataArray[1][1]
    object.monthEnd=dataArray[1][2]+dataArray[1][3]
    object.yearEnd=dataArray[1][4]+dataArray[1][5]

    return true
}

async function getFinancials(querryObject){

    let filterObject = {timeUnit:null, year: null, yearStart:null, yearEnd:null, monthStart:null, monthEnd:null, dayStart:null, dayEnd:null, quarter: null}
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    //filter is y=yearly, q=quarterly, c=custom
    //custom needs to have a ddmmyy-ddmmyy formated string in filterBy
    //q=quarterly uses custom fetcher
    switch(querryObject.filter){
        case "y":
            filterObject.timeUnit="yearly"
            filterObject.year=querryObject.filterBy
            break
        case "q":
            filterObject.timeUnit="custom"
            filterObject.yearStart=currentYear
            filterObject.yearEnd=currentYear
            switch(querryObject.filterBy.toLowerCase()){
                case "q1":
                    filterObject.monthStart="01"
                    filterObject.dayStart="01"
                    filterObject.monthEnd="03"
                    filterObject.dayEnd="31"
                    break
                case "q2":
                    filterObject.monthStart="04"
                    filterObject.dayStart="01"
                    filterObject.monthEnd="06"
                    filterObject.dayEnd="30"
                    break
                case "q3":
                    filterObject.monthStart="07"
                    filterObject.dayStart="01"
                    filterObject.monthEnd="09"
                    filterObject.dayEnd="30"
                    break
                case "q4":
                    filterObject.monthStart="10"
                    filterObject.dayStart="01"
                    filterObject.monthEnd="12"
                    filterObject.dayEnd="31"
                    break
                default:
                    return({status:"INVALID_REQUEST"})
            }
            break
        case "c":
            if(assignCustomDates(querryObject.filterBy, filterObject)===false) return({status:"INVALID_REQUEST"})
            filterObject.timeUnit="custom"
            break
        default:
            return({status:"INVALID_REQUEST"})
    }

    let data = await databaseOperations.getFinancialData(filterObject)
    if(data.status==="OK"){
        return({status:data.data.length===0 ? "NO_DATA" : "OK", data: utile.processFinancial(data.data)})        
    }else{
        return({status:"ERROR", data: null})       
    }   
    
}

async function updateInvoice(data){
    let databaseStatus = await databaseOperations.checkInvoiceStatus(data.invoiceID)
    //will contain the attached products, if any
    let billingProducts=null;
    if(databaseStatus!=null){
        //draft invoice, so editable
        if(databaseStatus==="draft"){            
            //get invoice number and remove it from the data set
            let invoice_number = data.invoiceID;
            delete data.invoiceID;        
            //if we have products in the data set, store them in a separate variable and update the invoice with the remaining data
            if(data.billingProducts){
                billingProducts = data.billingProducts;
                delete data.billingProducts;
            } 
            //invoice data to be updated
            if(Object.keys(data).length>0){
                let updateStatus = await databaseOperations.updateInvoice(invoice_number, data)
                //an error occured
                if(updateStatus===0){
                    return("UPDATE_INVOICE_ERROR")
                }                
            }
            //new products to be added
            if(billingProducts.length>0){
                //register products
                let productsUpdateStatus = await databaseOperations.registerBilledProducts(invoice_number, billingProducts)
                if(productsUpdateStatus.status!="OK") return("UPDATE_PRODUCTS_ERROR")                
            }
            return "OK"
        }
        //the invoice has to be "draft"
        return("UPDATE_INVOICE_NOT_POSSIBLE")        
    }
    //no invoice found?
    return("UPDATE_INVOICE_NOT_FOUND")
    
}

async function getRecurrentInvoiceProducts(invoiceID){
    try{
        let data = await databaseOperations.getRecurrentInvoiceProducts(invoiceID)
        if(data.status==="OK"){       
            let totalPrice=0
            let productsArr=new Array                
            if(billedProducts.length!=0){
                billedProducts.forEach(element=>{
                    totalPrice=element.product_quantity*element.pp_price_per_item
                    productsArr.push([element.pp_name, element.pp_um, element.product_quantity, element.pp_tax, utile.calculateTax(element.product_quantity, element.pp_tax, element.pp_price_per_item), element.pp_price_per_item])
                })
                return ({
                    totalPrice: totalPrice,
                    products: productsArr
                })
            }
        }
        console.log("No products found!")
        return null
    }
    catch{
        console.log("Error ocurred when fetching recurrent products!")
        return
    }
}

async function getPredefinedProducts(){
    let products=await databaseOperations.getPredefinedProducts()
    if(products.status==="OK") return products.data
    console.log("ERROR in retrieving predefined products")  
    return null
}

async function handleProduct(data){
    let status=null
    if(data.product_id!=null){
        status = await databaseOperations.editPredefinedProduct(data) 
    }else{
        status = await databaseOperations.registerProduct(data) 
    }
    return status   
}

//find the invoice of the product; remove the product from the database; calculate and update the total invoice SUM and TAX
async function removeProduct(entry){
    if(entry===null)  return({status: "ERROR", data: "Entry invalid"})
    //find its invoice
    let invoiceID = await databaseOperations.getProductInvoice(entry)
    //this removes the entry from the database
    let removeOp = await databaseOperations.removeProduct(entry)
    //this recalculates the total sum of the invoice
    databaseOperations.updateInvoiceTotals(invoiceID) 
    if(removeOp.status==="OK"){
        return({
            status: "OK",
            data: "Element removed!"
        })
    }
}

module.exports={
    fetchClients:fetchClients,
    addInvoice:addInvoice,
    fetchInvoices:fetchInvoices,
    archiveClient: archiveClient,
    archiveInvoice: archiveInvoice,
    fetchInvoiceData: fetchInvoiceData,
    handleClientData: handleClientData,
    fetchRecInvData: fetchRecInvData,
    getFinancials: getFinancials,
    updateInvoice:updateInvoice,
    getRecurrentInvoiceProducts: getRecurrentInvoiceProducts,
    getPredefinedProducts:getPredefinedProducts,
    handleProduct:handleProduct,
    removeProduct:removeProduct
}