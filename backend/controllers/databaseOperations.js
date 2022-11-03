const mysql = require('mysql2');
const utile = require('../utils/util.js')
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const { resolve } = require('path');

const testDB = "invoicemanager"
const liveDB = "baza_date_facturi"

const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"invoicemanager"
})

connection.on('error', function (err) {
    console.log(err.code) 
    connection.destroy()
    return false
});

try{
    connection.connect(function(err){
        if(err) {
            console.log(`Error in connecting to the database: ${err.stack}`)
            return false
        }
        console.log("Connected to the database")
    })
}catch(error){
    console.log(`${error}`)
    return false
}

/**
 * 
 * @param {{filter: string, filterBy: string, page:int, target:string}} querryObject filter is the case, filterBy is the value, page is the page(offset), target can be used to specify the table
 * @returns {{status: string, data: array}} status of the OP as string and the data as array containing key:pair values
 */

function getAllClients(querryObject){
    return new Promise((resolve,reject)=>{
        let offSet = 0
        let step=10
        if(querryObject.page>1) offSet = (querryObject.page-1) * 10
        let queryStatement;
        switch(querryObject.filter){
            case "id":
                queryStatement=`SELECT * FROM clients WHERE id='${querryObject.filterBy}'`;
                break;
            case "all":
                queryStatement=`SELECT * FROM clients LIMIT ${offSet}, ${step}`;
                break;
            case "search":
                queryStatement=`SELECT * FROM clients WHERE id IN (${querryObject.filterBy}) LIMIT ${offSet}, ${step}`
                break
            default:
                queryStatement=`SELECT * FROM clients LIMIT ${offSet}, ${step}`;
        }        

        connection.query(queryStatement, function(error,result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject("ERROR")
            }
            if(result.length>0){
                resolve({
                    status: "OK",
                    data: result
                })
            }else{
                resolve({
                    status: "OK",
                    data: null
                })
            }
        })
    })
}

/**
 * 
 * @param {Object} data the client info, as object
 * @returns {Promise} Object with two keys, status and data, which contains the ID of the newly inserted client
 */

function addClient(data){
    return new Promise((resolve, reject)=>{
        connection.query('INSERT INTO clients SET ?',data, function(error, result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject("ERROR")
            }
            if(result.insertId){
                resolve({
                    status: "OK",
                    data: result.insertId
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

/**
 * 
 * @param {Object} data the invoice data, as object
 * @returns {Promise} the id of the invoice
 */

function createNewInvoice(data)
{
    return new Promise((resolve, reject)=>{
        let querryToBeExecuted = ``;

        if(data.clientID){
            querryToBeExecuted = `INSERT INTO invoices(client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, customer_id, invoice_status, invoice_pay_method, invoice_bank_ref) SELECT client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email,  '${data.clientID}', '${data.invoice_status}', '${data.invoice_pay_method}', '${data.invoice_bank_ref}' FROM clients WHERE id='${data.clientID}'` 
        }else{
            querryToBeExecuted = `INSERT INTO invoices(client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, invoice_status, invoice_pay_method, invoice_bank_ref) VALUES ('${data.client_type}', '${data.client_fiscal_1}', '${data.client_fiscal_2}', '${data.client_first_name}', '${data.client_last_name}', '${data.client_county}', '${data.client_city}', '${data.client_street}', '${data.client_adress_number}', '${data.client_zip}', '${data.client_phone}', '${data.client_email}', '${data.invoice_status}', '${data.invoice_pay_method}', '${data.invoice_bank_ref}')`
        }  

        connection.query(querryToBeExecuted, function(error, result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject(null)
            }
            if(result.insertId){
                resolve(result.insertId)
            }else{
                resolve(null)
            }
        })
    })
}

/**
 * 
 * @param {integer} invoiceID The ID of the invoice that will be linked with the products
 * @param {Array} billedProductsArray An array containing the billed product data
 * @returns {Promise} Object with two keys, status and data
 */

function registerBilledProducts(invoiceID, billedProductsArray){
    //update the products table by adding the invoiceID to each element
    let total_tax=0
    let arr_copy = [];

    //[0] - product name, [1] - um, [2] - quantity, [3] - tax %, [4] - tax float, [5] - price per item, [6] - description, [7] - productID(null or hasvalue)
    billedProductsArray.forEach(element => {
        //[0] - product name, [1] - um, [2] - quantity, [3] - tax %, [4] - tax float calculated, [5] - price per item, [6] - invoiceID, [7] - quantity*ppi, [8] - productID
        arr_copy.push([element[0], element[1], element[2], element[3], parseFloat(((element[2]*element[5])/100)*element[3]), element[5], invoiceID, (element[2]*element[5]), element[6], element[7]])
        total_tax=total_tax+parseFloat(((element[2]*element[5])/100)*element[3]);
    });

    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO invoices_billed_products (product_name, product_mu, product_quantity, product_tax_pr, total_tax, product_price, invoiceID, total_price, product_description, product_id) VALUES ?`, [arr_copy], function(err, result) {
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:"ERROR when inserting billed products"
                })
            }
            if(result.insertId>0){
                //products registered, update the totals
                updateInvoiceTotals(invoiceID)
                resolve({
                    status:"OK",
                    data:total_tax
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
            
        });
    })    
}

function updateInvoiceTax(invoiceID, tax){
    connection.query(`UPDATE invoices SET invoice_tax='${tax}' WHERE invoice_number='${invoiceID}'`, function(error){
        if(error){
            console.log(`Could not update the tax of invoice ${invoiceID} because: ${error}`)
        }
    })
}

/**
 * Adds an invoice
 * @param {Object} data An object, containing the data of the invoice and the billed products
 * @returns {Promise<{status: string; data: integer}>} Status of the OP and the invoice ID
 */

async function addInvoice(data){
    //register the invoice in the DB; returns null if no deal or the invoiceID if all good
    let invoiceID = await createNewInvoice(data)
    if(invoiceID===null) return(null)
    //register the products 
    if(data.billingProducts.length>0){
        registerBilledProducts(invoiceID, data.billingProducts).then(response=>{
            if(response.status==="OK"){
                return({
                    status:(response.status==="OK" ? "OK" : "PRODUCTS_NOT_REGISTERED"),
                    data:invoiceID
                })
            }})
            .catch(error=>{
                console.log(error)
                return({
                    status:"PRODUCTS_NOT_REGISTERED",
                    data:invoiceID
                })
            })
    }
    return({status:"OK", data:invoiceID})
}

/**
 * 
 * @param {{filter: string, filterBy: string, page:BigInteger, target:string}} querryObject filter is the case, filterBy is the value, page is the page(offset), target can be used to specify the table
 * @returns {{status: string, data: array}} status of the OP as string and the data as array containing key:pair values
 */

async function getInvoices(querryObject){
    let offSet = 0
    let step=10
    if(querryObject.page>1) offSet = (querryObject.page-1) * 10
    let querry;    
    switch(querryObject.filter){
        case "all":
            querry=`SELECT * FROM ${querryObject.target} ORDER BY invoice_number DESC LIMIT ${offSet}, ${step}`
            break
        case "clientID":
            querry=`SELECT * FROM ${querryObject.target} WHERE customer_id=${querryObject.filterBy} LIMIT ${offSet}, ${step}`
            break;
        case "invoiceID":
            querry=`SELECT * FROM ${querryObject.target} WHERE invoice_number=${querryObject.filterBy}`
            break;
        case "recID":
            querry=`SELECT * FROM ${querryObject.target} WHERE rec_number=${querryObject.filterBy} LIMIT ${offSet}, ${step}`
            break;
        case "active":
            querry=`SELECT * FROM ${querryObject.target} WHERE invoice_active=${querryObject.filterBy} LIMIT ${offSet}, ${step}`
            break;
        case "search":
            querry=`SELECT * FROM invoices WHERE invoice_number in (${querryObject.filterBy}) order by invoice_number DESC LIMIT ${offSet}, ${step}`
            break
        default:
            querry=`SELECT * FROM ${querryObject.target} LIMIT ${offSet}, ${step}`
            break
    }

    return new Promise((resolve, reject)=>{
        connection.query(querry, function(err, result){
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:"ERROR fetching invoices"
                })
            }
            if(result){
                resolve({
                    status:"OK",
                    data:result
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

/**
 * Inserts the data of a user in the "archived" table
 * @param {integer} clientID The ID of the client
 * @returns {Promise<{status: string; data: integer}>} Status of the OP and, in case of an error, an explanation
 */

function archiveClientData(clientID){
    return new Promise((resolve, reject)=>{
        try{
            connection.query(`INSERT INTO clients_archived(id, client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_billing_adress, client_phone, client_email, client_notes, client_gui_color) select * from clients where id='${clientID}'`, function(err, result){
                if(err){
                    reject({
                        status:"ERROR",
                        data:"ERROR archiving client"
                    })
                }
                if(result.insertId>0){
                    resolve({
                        status:"OK",
                        data:null
                    })
                }else{
                    resolve({
                        status: "FAILED",
                        data: null
                    })
                }
            })
        }catch(err){
            console.log(err)
            resolve({
                status: "FAILED",
                data: null
            })
        }
    })
}

/**
 * Removes a client from the DB
 * @param {integer} clientID The ID of the client
 * @returns {Promise<{status: string; data: integer}>} Status of the OP and, in case of an error, an explanation
 */

function deleteClient(clientID){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM clients WHERE id=${clientID}`, function(err, result){
            if(err){
                reject({
                    status:"ERROR",
                    data:"ERROR deleteing client"
                })
            }
            if(result.affectedRows>0){
                resolve({
                    status:"OK",
                    data:null
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

/**
 * Moves the invoide data to the "archived" table
 * @param {integer} invoiceID The ID of the invoice
 * @returns {Promise<{status: string; data: integer}>} Status of the OP and, in case of an error, an explanation
 */

function archiveInvoice(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO invoices_archived(invoice_number, invoice_status, invoice_pay_method, invoice_bank_ref, rec_number, customer_id, client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, invoice_date, invoice_tax, invoice_total_sum) SELECT * FROM invoices where invoice_number=${invoiceID}`, function(err, result){
            if(err){
                console.log(err)
                reject({                    
                    status:"ERROR",
                    data:"ERROR archiving invoice"
                })
            }
            if(result.insertId>0){
                resolve({
                    status:"OK",
                    data:null
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

/**
 * Removes an invoice from the DB
 * @param {integer} clientID The ID of the invoice
 * @returns {Promise<{status: string; data: integer}>} Status of the OP and, in case of an error, an explanation
 */

function deleteInvoice(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM invoices WHERE invoice_number=${invoiceID}`, function(err, result){
            if(err){
                reject({
                    status:"ERROR",
                    data:"ERROR deleteing invoice"
                })
            }
            if(result.affectedRows>0){
                resolve({
                    status:"OK",
                    data:null
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

function fetchInvoiceSummary(invoiceNumber){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM invoices WHERE rec_number=${invoiceNumber}`, function(err, result){
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:"ERROR deleting invoice"
                })
            }
            if(result){
                resolve({
                    status:"OK",
                    data:result[0]
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

/**
 * Retrieves products linked with an invoice
 * @param {integer} invoiceNumber The ID of the invoice
 * @returns {Promise<{status: string, data:Array|null}>} An object with two keys, the status of the OP and an array containing the data
 */

function fetchBilledProducts(invoiceNumber){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM invoices_billed_products WHERE invoiceID='${invoiceNumber}'`, function(err, result){
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:null
                })
            }
            if(result){
                resolve({
                    status:"OK",
                    data:result
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }
        })
    })
}

/**
 * Updates a client
 * @param {{clientID: integer, dataToBeUpdated: object}} data Object containing keys and pairs representing data to be updated
 * @returns {Promise<{status:string, data:string}>} An object with the status of the OP and some info in case of an error
 */

function editClient(data){
    return new Promise((resolve, reject)=>{
        let clientID = data.clientID;
        let updateThis = data.dataToBeUpdated
        connection.query(`UPDATE clients SET ? where id=${clientID}`, updateThis, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:"ERROR updating client data"
                })
            }
            if(result){
                if(result.affectedRows>0){
                    resolve({
                        status:"OK",
                        data:null
                    })
                }else{
                    resolve({
                        status:"FAILED",
                        data:"NO ROWS affected"
                    })
                }
            }
        })
    })
}

function createRecurrentBill(clientID, recurrencyType, recurrencyDate){

    switch (recurrencyType){
        case "monthly-billing":
            querry=`INSERT INTO invoices_recurrent(client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, customer_id, invoice_recurrency, invoice_re_mo_date) SELECT client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, '${clientID}', '${recurrencyType}', '${recurrencyDate}' FROM clients WHERE id=${clientID}`
            break;
        case "yearly-billing":
            querry=`INSERT INTO invoices_recurrent(client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, customer_id, invoice_recurrency, invoice_re_y_date) SELECT client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, '${clientID}', '${recurrencyType}', '${recurrencyDate}' FROM clients WHERE id=${clientID}`
            break;
        }

    return new Promise((resolve, reject)=>{
        connection.query(querry, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data: "ERROR in creating recurrent schema"
                })
            }
            
            if(result.insertId){
                resolve({
                    status:"OK",
                    data: result.insertId 
                })
            }else{
                resolve({
                    status:"FAILED",
                    data: null
                })
            }
            
        })
    })
}

function registerProductsToRecBill(invoiceID, billedProductsArray){

    let total_tax=0
    let curent_element_tax=0;
    //don't want to modify the original array
    let arr_copy=[]

    billedProductsArray.forEach(element => {
        curent_element_tax=utile.calculateTax(element.data[2], element.data[3], element.data[5])
        element.data[4]=curent_element_tax;        
        arr_copy.push([element.id, element.data[0], element.data[1], element.data[2], element.data[3], element.data[4], element.data[5], invoiceID, (parseFloat(element.data[2])*parseFloat(element.data[5]))])
        total_tax=total_tax+curent_element_tax;
    });

    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO invoices_recurrent_products (product_id, product_name, product_mu, product_quantity, product_tax_pr, total_tax, product_price, invoiceID, total_price) VALUES ?`, [arr_copy], function(err, result) {
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:"ERROR when inserting billed products"
                })
            }
            if(result.insertId>0){
                resolve({
                    status:"OK",
                    data:total_tax
                })
            }else{
                resolve({
                    status: "FAILED",
                    data: null
                })
            }            
        });
    })    
}

function retrieveRecurrentProducts(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM invoices_recurrent_products WHERE invoiceID=${invoiceID}`, function(err, result) {
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:"ERROR when retrieving billed products"
                })
            }
            resolve({
                status:"OK",
                data:result
            })        
        });
    })
}

function createRecurrentBillSchema(clientID, recurrencyType, recurrencyDate, products){
    return new Promise((resolve, reject)=>{
        createRecurrentBill(clientID, recurrencyType, recurrencyDate)
        .then(data=>{
            if(data.status==="OK"){
                let recInvoiceSchema = data.data;
                registerProductsToRecBill(recInvoiceSchema, products).then(data=>{
                    if(data.status==="OK"){
                        resolve({
                            status:"OK",
                            data:recInvoiceSchema
                        })
                    }else{
                        resolve({
                            status: "FAILED",
                            data: null
                        })
                    }
                })
                .catch(error=>{
                    console.log(error)
                    reject({
                        status: "ERROR",
                        data: "ERROR in registering products to a recurrent schema"
                    })
                })
            }else{
                reject({
                    status: "FAILED",
                    data: "FAILED creating recurrent bill schema"
                })
            }
        })
        .catch(error=>{
            console.log(error)
            reject({
                status:"ERROR",
                data: "ERROR in creating recurrent schema"
            })
        })
    })
}

function linkInvoiceToRecSchema(rec, inv){
    connection.query(`UPDATE invoices SET rec_number=${rec} WHERE invoice_number=${inv}`, function(error, result){
        if(error){
            console.log("ERROR when linking recurrentSchema with Invoice")
        }
    })
}

function getRecInfo(queryFilter, queryFilterData,){
    let querry;
    switch(queryFilter){
        case "recurrentID":
            querry = `SELECT * FROM invoices_recurrent WHERE rec_number=${queryFilterData}`;
            break
        default:
            querry = `SELECT * FROM invoices_recurrent WHERE rec_number=${queryFilterData}`;
            break
    }
    return new Promise((resolve, reject)=>{
        connection.query(querry, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data: "ERROR in getting recurrent schema"
                })
            }
            if(result){
                if(result.length!=0){
                    resolve({
                        status:"OK",
                        data: result
                    })
                }else{
                    resolve({
                        status:"FAIL",
                        data: null
                    }) 
                }
            }
        })
    })
}

/**
 * 
 * @param {{startYear:string, startMonth:string, startDay:string, endYear:string, endMonth:string, endDay:string}} filterObject Object containing the interval to filter the data (ex: 2022, 10, 10, 2021, 10, 12)
 * @returns {Promise<{status:string, data:object}>} Status of the OP and an object containing the data from the DB
 */

function getFinancialData(filterObject){
    return new Promise((resolve, reject)=>{  
        connection.query(`SELECT invoice_number, invoiceID, invoice_status, invoice_pay_method, invoice_date, product_id, product_quantity, product_tax_pr, total_tax, product_price, total_price FROM invoices join invoices_billed_products productsTable on productsTable.invoiceID=invoice_number WHERE invoice_date >= "${filterObject.startYear}-${filterObject.startMonth}-${filterObject.startDay}" AND invoice_date <= "${filterObject.endYear}-${filterObject.endMonth}-${filterObject.endDay}" AND invoice_status='finalised' order by invoice_number;`, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            resolve({status:"OK", data: result})
        })
    })
}

/**
 * 
 * @param {integer} invoiceID The id of the invoice 
 * @returns {string} The status of the invoice(draft/ finalised)
 */

function checkInvoiceStatus(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT invoice_status FROM invoices WHERE invoice_number=${invoiceID}`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data: "ERROR in checking invoice status"
                })
            }
            if(result){                
                resolve(result[0].invoice_status)
            }else{
                resolve(null)                 
            }
        })
    })
}

/**
 * Updates data in a invoice
 * @param {integer} invoice_number Invoice ID
 * @param {Object} data Object containing key:value pairs representing the data to be updated
 * @returns {integer} 0 - error, 1 - no affected rows, 2 - all ok
 */

function updateInvoice(invoice_number, data){
    return new Promise((resolve, reject)=>{
        //updates invoice data
        connection.query(`UPDATE invoices SET ? WHERE invoice_number='${invoice_number}'`, data, function(error, result){
            if(error){
                console.log(error)
                reject(0)
            }
            if(result.affectedRows!=0){
                resolve(1)
            }else{
                resolve(2)
            }               
        })
    })
}

function getActiveRecurrentInvoices(date){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM invoices_recurrent WHERE next_invoice_date='${date}'`, function(error, result){
           if(error){
                reject({
                    status:"ERROR",
                    data:"ERROR"
                })
           }
           resolve({
                status:"OK",
                data:result
           })
        })
    })
}

function setBillingdates(nextInvoice, lastInvoice, reccurent_schema){
    return new Promise((resolve, reject)=>{
        connection.query(`UPDATE invoices_recurrent SET next_invoice_date='${nextInvoice}', last_invoice_date='${lastInvoice}' WHERE rec_number='${reccurent_schema}'`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:"ERROR"
                })
           }
           resolve({
                status:"OK",
                data:null
           })
        })
    })
}

function getRecurrentInvoiceProducts(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM invoices_recurrent_products irp left join predefined_products pp on pp.id=irp.product_id  WHERE invoiceID='${invoiceID}'`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:"ERROR"
                })
           }
           resolve({
                status:"OK",
                data:result
           })
        })
    })
}

/**
 * Retrieves predefined products
 * @returns {Promise<{status:string, data:object}>} Status of the OP and the data as object
 */

function getPredefinedProducts(){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM predefined_products`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:null
                })
           }
           resolve({
                status:"OK",
                data:result
           })
        })
    })
}

/**
 * Registers a predefined product
 * @param {Object} data Object containing the data to be inserted
 * @returns {Promise<{status:string, data:null}>} Status of the OP
 */

async function registerProduct(data){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO predefined_products(pp_name, pp_um, pp_tax, pp_price_per_item, pp_description) VALUES ('${data.pp_name}', '${data.pp_um}', ${data.pp_tax}, '${data.pp_price_per_item}', '${data.pp_description}')`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:null
                })
            }
            resolve({
                status:"OK",
                data:null
            })
        })
    })
}

/**
 * 
 * @param {Object} data Object containing data to be updated; the ID of the product is the key "product_id"
 * @returns {Promise<{status:string, data:null}>} Status of the OP
 */

async function editPredefinedProduct(data){
    let productID = data.product_id;
    delete data.product_id;
    return new Promise((resolve, reject)=>{
        connection.query(`UPDATE predefined_products SET ? WHERE id=${productID}`, data, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:null
                })
            }
            resolve({
                status:"OK",
                data:null
            })
        })
    })
}

/**
 * Deletes a product from the DB
 * @param {integer} id The id of the product 
 * @returns {Promise<{status:string, data:null}>} Status of the OP
 */

function removeProduct(id){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM invoices_billed_products WHERE id=${id}`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:null
                })
            }
            resolve({
                status:"OK",
                data:null
            })
        })
    })
}

/**
 * Retrieves the invoice ID of the invoice linked with a billed product
 * @param {integer} id The ID of the product
 * @returns {integer} The ID of the invoice
 */

function getProductInvoice(id){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT invoiceID FROM invoices_billed_products WHERE id=${id}`, function(error, result){
            if(error){
                console.log(error)
            }
            resolve(result[0].invoiceID)
        })
    })
}

/**
 * Get all the products linked to an invoice, calculate the totals and update the invoice
 * @param {integer} invoiceID The ID of the invoice 
 * @returns {string} OK or ERROR
 */

async function updateInvoiceTotals(invoiceID){

    //get all products from db
    let data = await fetchBilledProducts(invoiceID)
    //calculate totals
    totals = data.data ? utile.calculateTotalSum(data.data) : {totalTax: 0, totalSum: 0}

    //update database
    return new Promise((resolve, reject)=>{
        connection.query(`UPDATE invoices SET invoice_tax='${totals.totalTax}', invoice_total_sum='${totals.totalSum}' WHERE invoice_number='${invoiceID}'`, function(error, result){
            if(error){
                console.log(error)
                reject("ERROR")
            }
            resolve("OK")
        })
    }) 
}

/**
 * Retrieves the total number of DB entries
 * @param {string} queryDB The database
 * @param {string} queryFilter all|clientID|invoiceID|recID|active used to prepare the query
 * @param {string} queryFilterData used in the WHERE clause
 * @returns {Promise<integer>} Number of entries
 */

function getRecordsNumber(queryDB, queryFilter, queryFilterData){
    let querry=``
    switch(queryFilter){
        case "all":
            querry=`SELECT COUNT(*) AS recordsNumber FROM ${queryDB}`
            break
        case "clientID":
            querry=`SELECT COUNT(*) AS recordsNumber FROM ${queryDB} WHERE customer_id=${queryFilterData}`
            break;
        case "invoiceID":
            querry=`SELECT COUNT(*) AS recordsNumber FROM ${queryDB} WHERE invoice_number=${queryFilterData}`
            break;
        case "recID":
            querry=`SELECT COUNT(*) AS recordsNumber FROM ${queryDB} WHERE rec_number=${queryFilterData}`
            break;
        case "active":
            querry=`SELECT COUNT(*) AS recordsNumber FROM ${queryDB} WHERE invoice_active=${queryFilterData}`
            break;
        default:
            querry=`SELECT COUNT(*) AS recordsNumber FROM ${queryDB}`
            break
    }
    return new Promise((resolve, reject)=>{
        connection.query(querry, function(error, result){
            if(error){
                console.log(error)
                reject(null)
            }
            resolve(result[0].recordsNumber)
        })
    }) 
}

/**
 * Exports the DB as multiple CSV files
 * @returns {Promise<Array>} An array containing an OK for each succesfull export
 */

async function exportData(){

    //create the directory if not existing
    if (!fs.existsSync('./exports')){
        fs.mkdirSync('./exports');
    }

    let exportInvoices = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM invoices", function(error, data, fields) {
            if (error) reject("ERROR")
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/invoices.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("invoices.csv generated");
              resolve("OK")
            });
        });
    })

    let exportBilledProjects = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM invoices_billed_products", function(error, data, fields) {
            if (error) reject("ERROR")
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/invoices_billed_products.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("invoices_billed_products.csv generated");
              resolve("OK")
            });
        });
    })

    let predefinedProducts = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM predefined_products", function(error, data, fields) {
            if (error) reject("ERROR")
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/predefined_products.csv", csv, function(error) {
                if (error) reject("ERROR")
              console.log("predefined_products.csv generated");
              resolve("OK")
            });
        });
    })

    let clients = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM clients", function(error, data, fields) {
            if (error) reject("ERROR")
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/clients.csv", csv, function(error) {
                if (error) reject("ERROR")
              console.log("clients.csv generated");
              resolve("OK")
            });
        });
    })

    let expenses = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM expenses", function(error, data, fields) {
            if (error) reject("ERROR")
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/expenses.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("expenses.csv generated");
              resolve("OK")
            });
        });
    })

    //chain data
    return await Promise.all([exportInvoices, exportBilledProjects, predefinedProducts, clients, expenses])    
}

function getDBinfo(){
    return({
        host: connection.config.host,
        user:connection.config.user,
        database:connection.config.database
    })
}

function changeDBinfo(){
    return new Promise((resolve, reject)=>{
        if(connection.config.database===testDB){
            connection.changeUser({database : liveDB}, function(err) {
                if (err){
                    connection.changeUser({database : testDB}, function(err) {})
                    reject({status:"ERROR", database:null})
                }
                resolve({status:"OK", database:liveDB})
            })
        }else{
            connection.changeUser({database : testDB}, function(err) {
                if (err) reject({status:"ERROR", database:null})
                resolve({status:"OK", database:testDB})
            })
        }
    })

}

/**
 * 
 * @param {{startYear:string, startMonth:string, startDay:string, endYear:string, endMonth:string, endDay:string}} filterObject Object containing the interval to filter the data (ex: 2022, 10, 10, 2021, 10, 12)
 * @param {boolean} getAll True to retrieve all expenses, False to retrieve only deductible expenses
 * @returns {Promise<{status:string, data:object}>} An object containing the status of the OP and the retrieved data, as object
 */

function getExpenses(filterObject, getAll){
    let querryToBeExec = `SELECT * FROM expenses WHERE exp_date >= "${filterObject.startYear}-${filterObject.startMonth}-${filterObject.startDay}" AND exp_date <= "${filterObject.endYear}-${filterObject.endMonth}-${filterObject.endDay}" order by id`
    if(!getAll) querryToBeExec = `SELECT * FROM expenses WHERE exp_date >= "${filterObject.startYear}-${filterObject.startMonth}-${filterObject.startDay}" AND exp_date <= "${filterObject.endYear}-${filterObject.endMonth}-${filterObject.endDay}" AND exp_deduct='1' order by id`
    return new Promise((resolve, reject)=>{  
        connection.query(querryToBeExec, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            resolve({
                status:"OK",
                data: result
            })
        })
    })
}

/**
 * Register a new expense
 * @param {object} object Object containing the data of the expense
 * @returns {Promise<{status:string, data:integer}>} An object containing the status of the OP and the ID of the new element
 */

function addExpense(object){
    return new Promise((resolve, reject)=>{  
        connection.query(`INSERT INTO expenses(exp_name, exp_sum, exp_description, exp_date, exp_deduct) VALUES ('${object.exp_name}', '${object.exp_sum}', '${object.exp_description}','${object.exp_date}','${object.exp_deduct}')`, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            if(result.insertId>0){
                resolve({status:"OK", data: result.insertId})
            }else{
                resolve({status:"FAIL", data: null})  
            }            
        })
    })    
}

/**
 * Removes an expense
 * @param {integer} id ID of the expense 
 * @returns {string} ERROR, OK or FAIL(no error but no rows affected)
 */

function deleteExpense(id){
    return new Promise((resolve, reject)=>{  
        connection.query(`DELETE FROM expenses WHERE id=${id}`, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            if(result.affectedRows>0){
                resolve("OK")
            }else{
                resolve("FAIL")  
            }            
        })
    })
}


/**
 * Looks for a text in the database and returns the matching IDs
 * @param {{searchTerm:string, target:invoices|clients}} queryObject searchTerm is the text to be searched for, target is the target of the search; for now, invoices and clients are the only options
 * @returns {Array} An array containing id's that can be used to filter a DB or an empty array if nothing is found. The array can contain arrays!
 */

 async function searchDatabase(queryObject){
    switch(queryObject.target){
        case "invoices":
            let invoices = new Promise((resolve, reject)=>{
                connection.query(`select invoice_number from invoices where client_county LIKE '%${queryObject.searchTerm}%' OR invoice_bank_ref LIKE '${queryObject.searchTerm}' OR client_fiscal_1 LIKE '%${queryObject.searchTerm}%' OR client_fiscal_2 LIKE '%${queryObject.searchTerm}%' OR client_first_name LIKE '%${queryObject.searchTerm}%' OR client_last_name LIKE '%${queryObject.searchTerm}%' OR client_city LIKE '%${queryObject.searchTerm}%' OR client_street LIKE '%${queryObject.searchTerm}%' OR client_adress_number LIKE '%${queryObject.searchTerm}%' OR client_zip LIKE '%${queryObject.searchTerm}%' OR client_phone LIKE '%${queryObject.searchTerm}%' OR client_email LIKE '%${queryObject.searchTerm}%' OR invoice_total_sum LIKE '%${queryObject.searchTerm}%' order by invoice_number desc `, function(error, result){
                    if(error){
                        console.log(error)
                        reject({status:"ERROR", data:null})
                    }
                    let anArray=[]
                    if(result.length>0){
                        result.forEach(element=>{
                            anArray.push(element.invoice_number)
                        })
                    }
                    resolve(anArray)
                })
            })
            let products = new Promise((resolve, reject)=>{
                connection.query(`SELECT invoiceID FROM invoices_billed_products WHERE product_name like '%${queryObject.searchTerm}%' or product_description like '%${queryObject.searchTerm}%' order by invoiceID desc `, function(error, result){
                    if(error){
                        console.log(error)
                        reject({status:"ERROR", data:null})
                    }
                    let anArray=[]
                    if(result.length>0){
                        result.forEach(element=>{
                            anArray.push(element.invoiceID)
                        })
                    }
                    resolve(anArray)
                })
            })
            return await Promise.all([invoices, products])
        case "clients":
            return new Promise((resolve, reject)=>{
                connection.query(`select id from clients where client_fiscal_1 LIKE '${queryObject.searchTerm}' OR client_fiscal_2 LIKE '${queryObject.searchTerm}' OR client_first_name LIKE '${queryObject.searchTerm}' OR client_last_name LIKE '${queryObject.searchTerm}' OR client_city LIKE '${queryObject.searchTerm}' OR client_street LIKE '${queryObject.searchTerm}' OR client_adress_number LIKE '${queryObject.searchTerm}' OR client_zip LIKE '${queryObject.searchTerm}' OR client_phone LIKE '${queryObject.searchTerm}' OR client_email LIKE '${queryObject.searchTerm}' OR client_notes LIKE '${queryObject.searchTerm}' order by id desc;`, function(error, result){
                    if(error){
                        console.log(error)
                        reject({status:"ERROR"})
                    }
                    let anArray=[]
                    if(result.length>0){
                        result.forEach(element=>{
                            anArray.push(element.id)
                        })
                    }
                    resolve(anArray)
                })
            })
        default:
            resolve(null)
    }
}

function filterDatabase(array){
    return new Promise((resolve, reject)=>{
        connection.query(`select * from invoices where invoice_number in (?)`, [array], function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR", data:null})
            }
            resolve(result)
        })
    })
}

module.exports ={
    getAllClients:getAllClients,
    addClient:addClient,
    addInvoice:addInvoice,
    getInvoices:getInvoices,
    deleteClient: deleteClient,
    archiveClientData: archiveClientData,
    archiveInvoice: archiveInvoice,
    deleteInvoice: deleteInvoice ,
    fetchInvoiceSummary: fetchInvoiceSummary,
    fetchBilledProducts: fetchBilledProducts,
    editClient:editClient,
    createRecurrentBillSchema: createRecurrentBillSchema,
    linkInvoiceToRecSchema: linkInvoiceToRecSchema,
    getRecInfo:getRecInfo,
    getFinancialData: getFinancialData,
    checkInvoiceStatus:checkInvoiceStatus,
    updateInvoice: updateInvoice,
    getActiveRecurrentInvoices: getActiveRecurrentInvoices,
    setBillingdates:setBillingdates,
    retrieveRecurrentProducts:retrieveRecurrentProducts,
    getRecurrentInvoiceProducts:getRecurrentInvoiceProducts,
    getPredefinedProducts: getPredefinedProducts,
    registerProduct:registerProduct,
    editPredefinedProduct:editPredefinedProduct,
    removeProduct:removeProduct,
    getProductInvoice:getProductInvoice,
    updateInvoiceTotals:updateInvoiceTotals,
    registerBilledProducts: registerBilledProducts,
    getRecordsNumber:getRecordsNumber,
    exportData:exportData,
    getDBinfo:getDBinfo,
    changeDBinfo:changeDBinfo,
    getExpenses,
    addExpense,
    deleteExpense,
    searchDatabase,
    filterDatabase
}