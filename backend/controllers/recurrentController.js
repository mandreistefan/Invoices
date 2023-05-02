let databaseOperations = require('./databaseOperations.js')
let databaseController = require('./databaseController.js')
let utile = require('../utils/util.js')

const currentDate = new Date();
let currentDay = currentDate.getDate()
let currentMonth = currentDate.getMonth()
let currentYear = currentDate.getFullYear()
let today=`${currentYear}-${currentMonth+1}-${currentDay}`

async function buildInvoiceData(element){
    let data = await databaseController.getRecurrentInvoiceProducts(element.rec_number)
    return ({
        client_first_name:element.client_first_name, 
        client_last_name:element.client_last_name,
        client_county:element.client_county,
        client_city:element.client_city, 
        client_street:element.client_street, 
        client_adress_number:element.client_adress_number, 
        client_zip:element.client_zip, 
        client_phone:element.client_phone, 
        client_email:element.client_email, 
        invoice_total_sum:data.totalPrice, 
        invoice_status: 'draft', 
        invoice_pay_method: null, 
        invoice_bank_ref:null,
        rec_number:element.rec_number,
        billingProducts: data.products
    })
}

//async function that creates an invoice based on schema data and calculates and sets the next invoice date
async function createInvoiceFromSchema(invoiceData){
    //invoice data to be sent to the function that creates invoices
    let procData = await buildInvoiceData(invoiceData)
    //adds an invoice in the database
    let newInvoice = await databaseOperations.addInvoice(procData)
    if(newInvoice.status==="OK"){
        //calculate and set the next invoice date
        let futureInvoiceDate = utile.calculateNextInvoiceDate(invoiceData.invoice_recurrency, ((invoiceData.invoice_re_mo_date) ? invoiceData.invoice_re_mo_date : invoiceData.invoice_re_y_date))
        let updateStatus = await databaseOperations.setBillingdates(futureInvoiceDate.dateAsMYSQLString, today, invoiceData.rec_number)
        if(updateStatus.status==="OK"){
            return ({
                status:"OK",
                code: 200,
                data: newInvoice.data
            })
        }else{
            return ({
                status: "ERROR",
                code: 1
            })
        }
    }
    return ({
        status: "ERROR",
        code: 2
    })
}

async function createInvoices(invoices){
    let counter=0;
    invoices.forEach(element => {
        createInvoiceFromSchema(element).then(data=>{
            switch(data.code){
                case 200:
                    console.log(`Invoice no. ${data.data} has been created!`)
                    counter=counter+1
                case 1:
                    console.log(`Invoice has been created, but the recurrent schema has not been updated`)
                case 2:
                    console.log(`An error ocurred trying to create the invoice`)
            }
        })
    });
    if(counter===invoices.length){
        return true
    }
    return false
}

//should check if there are any recurrencies that should emmit invoices today
//next_invoice_date is used to filter invoices; if the process goes well, next_invoice_date will be incremented with the new date
function handleRecurrencies(){
    console.log(`handleRecurrencies -> Checking for recurrent invoices for the following date(yyyy-mm-dd): ${today}`)
    databaseOperations.getActiveRecurrentInvoices(today)
    .then(data=>{
        if(data.status==="OK"){
            let todaysInvoices=data.data
            if(todaysInvoices.length===0){
                //no invoices for today
                console.log("handleRecurrencies -> No invoices found")
            }else{
                //invoices today
                console.log("handleRecurrencies -> Invoices found")
                createInvoices(todaysInvoices).then(data=>{
                    if(data){
                        console.log("All invoices were created")
                    }else{
                        console.log("Some invoices had errors")
                    }
                })
            }
        }else{
            console.log("handleRecurrencies -> Error in fetching invoices")
        }
    })
    .catch(data=>{

    })
}

module.exports={
    handleRecurrencies: handleRecurrencies
}