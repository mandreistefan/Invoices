const mysql = require('mysql2');
const utile = require('../utils/util.js')
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");
const path=require('path');

//get some database options from a JSON file
let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
//globals
const queryStep = 10
let offSet = 0
//connection parameters
const connection = mysql.createConnection({
    host: databasesObject.host,
    user: databasesObject.user,
    password: databasesObject.password,
    database: databasesObject.databases[0].database,
    multipleStatements: true
})
//handle connection error
connection.on('error', function (err) {
    console.log(err.code) 
    connection.destroy()
    return false
});
//connect to the DB
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
    connection.destroy()
    return false
}

function currentDate(){
    let date = new Date()
    return(`${date.getFullYear()}-${(date.getMonth()+1)<10 ? "0"+(date.getMonth()+1) : (date.getMonth()+1)}-${date.getDate()<10 ? "0"+date.getDate() : date.getDate()}`)
}

function databaseLog(message){
    connection.query(`INSERT INTO log (message) VALUES('${message}')`, function(error,result){
        if(error){
            console.log(`An error occured: ${error}`)
        }
    })
}

function checkForDatabases(){
    let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
    if(databasesObject.databases.length === 0 ) return false
    return true
}

async function addDatabase(alias, name){
    //if the datbaase in is the XML file, stop
    let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
    for(let i=0;i<databasesObject.databases.length;i++){
        if(databasesObject.databases[i].database===name){
            return ({status:"FAIL", data:"DATABASE_EXISTS"}) 
        }     
    }
    //create the new database
    let createDB = new Promise((resolve, reject)=>{
        connection.query(`CREATE DATABASE ${name}`, function(error,result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject("ERROR")
                return
            }else{
                databasesObject.databases.push({"database": name, "alias": alias})
                fs.writeFileSync('./database.json', JSON.stringify(databasesObject));
                resolve("OK")
            }
        })
    })
    //switch to the new database
    let changeDB = new Promise((resolve, reject)=>{ 
        connection.changeUser({database : name}, function(err) {
            if (err){
                console.log(err)
                reject("ERROR")
            }
            resolve("OK")
        })   
    })
    //create tables for the database
    let applyDBSchema = new Promise((resolve, reject)=>{
        //read tables structure
        let tables = fs.readFileSync(path.join(__dirname, '../createTables.txt'), 'utf8')
        //build query
        let query = ""
        tables.split(";").forEach(element=>{ query = query + element + ";" })
        //create tables
        connection.query(query, function(error,result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject({
                    status: "FAIL",
                    data: null
                })
                return 
            }
            if(result){
                resolve("OK")
            }else{
                resolve("ERROR")
            }
        })
    }) 

    let results =  await Promise.all([createDB, changeDB, applyDBSchema])
    if(results[0]==="OK" && results[1]==="OK" && results[2]==="OK"){
        return ({status:"OK", data:null})
    }else{
        return({status:"ERROR", data:null})
    }
}

function deleteDatabase(databaseName){
    if( databaseName === connection.config.database ) return ({status:"ERROR", data:"DATA DE BAZE E SELECTATA"})
    return new Promise((resolve, reject)=>{
        connection.query(`DROP DATABASE ${databaseName}`, function(error,result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject({status:"ERROR", data:null})
                return
            }else{
                let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
                for(let i=0;i<databasesObject.databases.length;i++){
                    if(databasesObject.databases[i].database === databaseName){
                        databasesObject.databases.splice(i, 1)
                        break
                    }     
                }
                fs.writeFileSync('./database.json', JSON.stringify(databasesObject));
                resolve({status:"OK", data:null})
            }
        })
    })
}

/**
 * 
 * @param {{filter: string, filterBy: string, page:int, target:string}} querryObject filter is the case, filterBy is the value, page is the page(offset), target can be used to specify the table
 * @returns {Promise<{status: string, data: array}>} status of the OP as string and the data as array containing key:pair values
 */

async function getClients(querryObject){    
    if(querryObject.page>1) offSet = (querryObject.page-1) * queryStep
    let queryStatement;
    let step = 10
    if(querryObject.step) step = querryObject.step
    if(querryObject.filter==="search" && querryObject.filterBy.length===0) return ({status:"NO_DATA", data:null})
    switch(querryObject.filter){
        case "id":
            queryStatement=`SELECT * FROM clients WHERE id='${querryObject.filterBy}' ORDER by id desc`;
            break;
        case "all":
            queryStatement=`SELECT * FROM clients  ORDER by id desc LIMIT ${step} OFFSET ${step*querryObject.page}`;
            break;
        case "search":
            queryStatement=`SELECT * FROM clients WHERE id IN (${querryObject.filterBy}) ORDER by id desc`
            break
        default:
            queryStatement=`SELECT * FROM clients ORDER by id desc LIMIT ${step} OFFSET ${step*querryObject.page}`;
    }        
    return new Promise((resolve,reject)=>{
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
                databaseLog(`Clientul ${result.insertId} a fost creat`)
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
            querryToBeExecuted = `INSERT INTO invoices(client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, customer_id, invoice_status, invoice_pay_method, invoice_bank_ref) SELECT client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email,  '${data.clientID}', 'draft', '${data.invoice_pay_method}', '${data.invoice_bank_ref}' FROM clients WHERE id='${data.clientID}'` 
        }else{
            querryToBeExecuted = `INSERT INTO invoices(client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, invoice_status, invoice_pay_method, invoice_bank_ref, invoice_date) VALUES ('${data.client_type}', '${data.client_fiscal_1}', '${data.client_fiscal_2}', '${data.client_first_name}', '${data.client_last_name}', '${data.client_county}', '${data.client_city}', '${data.client_street}', '${data.client_adress_number}', '${data.client_zip}', '${data.client_phone}', '${data.client_email}', 'draft', '${data.invoice_pay_method}', '${data.invoice_bank_ref}', ${currentDate()})`
        }  

        connection.query(querryToBeExecuted, function(error, result){
            if(error){
                console.log(`An error occured: ${error}`)
                reject(null)
            }
            if(result.insertId){
                databaseLog(`Factura cu numarul ${result.insertId} a fost creata`)
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
                databaseLog(`Unul sau mai multe produse au fost adaugate in factura cu numarul ${invoiceID}`)
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
 * @returns {Promise<{status: string, data: array}>} status of the OP as string and the data as array containing key:pair values
 */

async function getInvoices(querryObject){
    if(querryObject.page>1) offSet = (querryObject.page-1) * queryStep
    //filtering params
    if(querryObject.filter==="search" && querryObject.filterBy.length===0) return ({status:"NO_DATA", data:null})
    //the step
    let step = 10
    if(querryObject.step) step=querryObject.step
    //orderBy
    let orderBy=" ORDER BY invoice_number DESC ";
    if(querryObject.order!==undefined){
        if(querryObject.orderBy!==undefined) orderAscDesc = querryObject.orderBy
        switch(querryObject.order){
            case "invoice_number":
                orderBy=` ORDER BY invoice_number ${orderAscDesc}`
                break
            case "total":
                orderBy=` ORDER BY invoice_total_sum ${orderAscDesc}`
                break;
            default:
                orderBy=`ORDER BY invoice_number DESC`
                break
        }
    }

    //at search the IDs are pre-filtered
    let querryInterval = ""
    if(querryObject.filter!=="search"){
        if(querryObject.processedInterval!==undefined && querryObject.processedInterval!==null){        
            querryInterval = ` AND invoice_date >= "${querryObject.processedInterval.startYear}-${querryObject.processedInterval.startMonth}-${querryObject.processedInterval.startDay}" AND invoice_date <= "${querryObject.processedInterval.endYear}-${querryObject.processedInterval.endMonth}-${querryObject.processedInterval.endDay}" `
        }
    }

    switch(querryObject.filter){
        case "all":
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM ${querryObject.target} WHERE 1 ${querryInterval} ${orderBy} LIMIT ${step} OFFSET ${step*querryObject.page}`
            break
        case "clientID":
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM ${querryObject.target} WHERE customer_id=${querryObject.filterBy} ${querryInterval} LIMIT ${step} OFFSET ${step*querryObject.page} ${orderBy}`
            break;
        case "invoiceID":
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM ${querryObject.target} WHERE invoice_number=${querryObject.filterBy}`
            break;
        case "recID":
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM ${querryObject.target} WHERE rec_number=${querryObject.filterBy} ${querryInterval} LIMIT ${step} OFFSET ${step*querryObject.page} ${orderBy}`
            break;
        case "active":
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM ${querryObject.target} WHERE invoice_active=${querryObject.filterBy} ${querryInterval} LIMIT ${step} OFFSET ${step*querryObject.page} ${orderBy}`
            break;
        case "search":
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM invoices WHERE invoice_number in (${querryObject.filterBy}) ${orderBy}`
            break
        default:
            querry=`SELECT *, DATE_FORMAT(invoice_date, '%d-%m-%Y') as normal_date FROM ${querryObject.target} WHERE 1 ${querryInterval} LIMIT ${step} OFFSET ${step*querryObject.page} ${orderBy}`
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
            connection.query(`INSERT INTO clients_archived SELECT * from clients WHERE id='${clientID}'`, function(err, result){
                if(err){
                    reject({
                        status:"ERROR",
                        data:"ERROR archiving client"
                    })
                }
                console.log(result)
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
                databaseLog(`Factura cu numarul ${invoiceID} a fost arhivata`)
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

function fetchBilledProductsFromInvoice(invoiceNumber){
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
 * Retrieves billed products
 * @returns {Promise<{status: string, data:Array|null}>} An object with two keys, the status of the OP and an array containing the data
 */

function fetchBilledProducts(orderobject){
    let query = "select id, invoiceID, product_name, product_price, total_price, product_description from invoices_billed_products order by product_name asc"
    if(orderobject.by!=null){
        query = `select id, invoiceID, product_name, product_price, total_price, product_description from invoices_billed_products order by ${orderobject.by} ${orderobject.order}`
    }
    return new Promise((resolve, reject)=>{
        connection.query(query, function(err, result){
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


/**
 * 
 * @param {{startYear:string, startMonth:string, startDay:string, endYear:string, endMonth:string, endDay:string}} filterObject Object containing the interval to filter the data (ex: 2022, 10, 10, 2021, 10, 12)
 * @returns {Promise<{status:string, data:object}>} Status of the OP and an object containing the data from the DB
 */

function getFinancialData(filterObject){
    return new Promise((resolve, reject)=>{  
        connection.query(`SELECT invoice_number, invoiceID, invoice_status, invoice_pay_method, invoice_date, product_id, product_name, product_description, product_quantity, product_tax_pr, total_tax, product_price, total_price FROM invoices join invoices_billed_products productsTable on productsTable.invoiceID=invoice_number WHERE invoice_date >= "${filterObject.startYear}-${filterObject.startMonth}-${filterObject.startDay}" AND invoice_date <= "${filterObject.endYear}-${filterObject.endMonth}-${filterObject.endDay}" AND invoice_status='finalised' order by invoice_number;`, function(error, result){
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
 * @returns {Promise<{status:string, data:object}>} The status of the invoice(draft/ finalised)
 */

async function checkInvoiceStatus(invoiceID){
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
                databaseLog(`Factura cu numarul ${invoice_number} a fost modificata`)
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


/**
 * Gets all predefined products
 * @param {{filter: string, filterBy: string, page:integer}} queryObject filter is the case, filterBy is the value, page is the page(offset)
 * @returns {Promise<status:string, data:Object>}
 */

function getPredefinedProducts(queryObject){

    let querry;
    switch(queryObject.filter){
        case "search":
            querry = `SELECT * FROM predefined_products WHERE id in (${queryObject.filterBy})`;
            break
        default:
            querry = `SELECT * FROM predefined_products`;
            break
    }

    return new Promise((resolve, reject)=>{
        connection.query(querry, function(error, result){
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
 * 
 * @param {*} productID ID of a predefined product
 * @returns status of the OP and data
 */
async function getProductInfo(productID){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM predefined_products WHERE id=${productID}`, function(error, result){
            if(error){
                console.log(error)
                reject({
                    status:"ERROR",
                    data:null
                })
            }
            if(result.length>0){
                resolve({status:"OK", data: result})
            }else{
                resolve({status:"NO_DATA", data: null})
            }
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
            databaseLog(`Un produs a fost sters`)
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
    let data = await fetchBilledProductsFromInvoice(invoiceID)
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

function getDBinfo(){
    let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
    return({
        host: connection.config.host,
        user: connection.config.user,
        database: connection.config.database,
        databases: databasesObject.databases
    })
}

/**
 * Switch to a certain DB
 * @param {String} database The name of the database
 * @returns {Promise<{status:string}>} Status of the OP
 */

function changeDatabase(databaseName){
    return new Promise((resolve, reject)=>{ 
        connection.changeUser({database : `${databaseName}`}, function(err) {
            if (err){
                console.log(err)
                reject({status:"ERROR"})
            }
            resolve({status:"OK"})
        })   
    })
}

/**
 * 
 * @param {{startYear:string, startMonth:string, startDay:string, endYear:string, endMonth:string, endDay:string}} filterObject Object containing the interval to filter the data (ex: 2022, 10, 10, 2021, 10, 12)
 * @param {boolean} getAll True to retrieve all expenses, False to retrieve only deductible expenses
 * @returns {Promise<{status:string, data:object}>} An object containing the status of the OP and the retrieved data, as object
 */

function getExpenses(filterObject, getAll){

    let querryToBeExec = `SELECT id, exp_name, exp_sum, exp_description, exp_type, DATE_FORMAT(exp_date, '%Y-%m-%d') as exp_date, exp_deduct FROM expenses WHERE exp_date >= "${filterObject.startYear}-${filterObject.startMonth}-${filterObject.startDay}" AND exp_date <= "${filterObject.endYear}-${filterObject.endMonth}-${filterObject.endDay}" order by id`
    
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
        connection.query(`INSERT INTO expenses(exp_name, exp_sum, exp_description, exp_date, exp_deduct, exp_type) VALUES ('${object.exp_name}', '${object.exp_sum}', '${object.exp_description}','${object.exp_date}','${object.exp_deduct ? 1 : 0}', '${object.exp_type}')`, function(error, result){
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
 * @returns {Promise<{string}>} ERROR, OK or FAIL(no error but no rows affected)
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
 * @returns {Promise<Array>} An array containing id's that can be used to filter a DB or an empty array if nothing is found. The array can contain arrays!
 */

 async function searchDatabase(queryObject){
    switch(queryObject.target){
        case "invoices":

            let querryInterval = ""
            if(queryObject.processedInterval!==null){        
                querryInterval = ` AND invoice_date >= "${queryObject.processedInterval.startYear}-${queryObject.processedInterval.startMonth}-${queryObject.processedInterval.startDay}" AND invoice_date <= "${queryObject.processedInterval.endYear}-${queryObject.processedInterval.endMonth}-${queryObject.processedInterval.endDay}" `
            }

            console.log(querryInterval)

            let invoices = new Promise((resolve, reject)=>{
                connection.query(`select invoice_number from invoices where (client_county LIKE '%${queryObject.searchTerm}%' OR invoice_bank_ref LIKE '${queryObject.searchTerm}' OR client_fiscal_1 LIKE '%${queryObject.searchTerm}%' OR client_fiscal_2 LIKE '%${queryObject.searchTerm}%' OR client_first_name LIKE '%${queryObject.searchTerm}%' OR client_last_name LIKE '%${queryObject.searchTerm}%' OR client_city LIKE '%${queryObject.searchTerm}%' OR client_street LIKE '%${queryObject.searchTerm}%' OR client_adress_number LIKE '%${queryObject.searchTerm}%' OR client_zip LIKE '%${queryObject.searchTerm}%' OR client_phone LIKE '%${queryObject.searchTerm}%' OR client_email LIKE '%${queryObject.searchTerm}%' OR invoice_total_sum LIKE '%${queryObject.searchTerm}%') ${querryInterval} order by invoice_number desc `, function(error, result){
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
            let [invoicesData, productsData] = await Promise.all([invoices, products])
            return invoicesData.concat(productsData)
        case "clients":
            return new Promise((resolve, reject)=>{
                connection.query(`select id from clients where client_fiscal_1 LIKE '%${queryObject.searchTerm}%' OR client_fiscal_2 LIKE '%${queryObject.searchTerm}%' OR client_first_name LIKE '%${queryObject.searchTerm}%' OR client_last_name LIKE '%${queryObject.searchTerm}%' OR client_city LIKE '%${queryObject.searchTerm}%' OR client_street LIKE '%${queryObject.searchTerm}%' OR client_adress_number LIKE '%${queryObject.searchTerm}%' OR client_zip LIKE '%${queryObject.searchTerm}%' OR client_phone LIKE '%${queryObject.searchTerm}%' OR client_email LIKE '%${queryObject.searchTerm}%' OR client_notes LIKE '%${queryObject.searchTerm}%' order by id desc;`, function(error, result){
                    if(error){
                        console.log(error)
                        reject({status:"ERROR"})
                    }
                    let anArray=[]
                    if(result){
                        if(result.length>0){
                            result.forEach(element=>{
                                anArray.push(element.id)
                            })
                        }
                    }
                    resolve(anArray)
                })
            })
            case "employees":
                return new Promise((resolve, reject)=>{
                    connection.query(`select id from employees where emp_first_name LIKE '%${queryObject.searchTerm}%' OR emp_last_name LIKE '%${queryObject.searchTerm}%' OR emp_adress LIKE '%${queryObject.searchTerm}%' OR emp_ident_no LIKE '%${queryObject.searchTerm}%' OR emp_date LIKE '%${queryObject.searchTerm}%' or emp_job_name LIKE '%${queryObject.searchTerm}%' OR emp_cur_salary_gross LIKE '%${queryObject.searchTerm}%' OR emp_tax LIKE '%${queryObject.searchTerm}%'  order by id desc;`, function(error, result){
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
            case "predefined-products":
                return new Promise((resolve, reject)=>{
                    connection.query(`select id from predefined_products where pp_name LIKE '%${queryObject.searchTerm}%' OR pp_um LIKE '%${queryObject.searchTerm}%' OR  pp_tax LIKE '%${queryObject.searchTerm}%' OR pp_price_per_item LIKE '%${queryObject.searchTerm}%' OR pp_description LIKE '%${queryObject.searchTerm}%' order by id desc;`, function(error, result){
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

/**
 * 
 * @param {{filter: string, filterBy: string, page:integer, target:string}} querryObject filter is the case, filterBy is the value, page is the page(offset), target can be used to specify the table
 * @returns {Promise<{status: string, data: array}>} status of the OP as string and the data as array containing key:pair values
 */

async function getEmployees(queryObject){
    let step = 10;
    if(queryObject.step) step = queryObject.step
    if(queryObject.filter==="search" && queryObject.filterBy.length===0) return ({status:"NO_DATA", data:null})
    let querry;    
    switch(queryObject.filter){
        case "all":
            querry=`SELECT * FROM employees ORDER BY id DESC LIMIT ${step} OFFSET ${step*queryObject.page}`
            break
        case "id":
            querry=`SELECT * FROM employees WHERE id=${queryObject.filterBy}`
            break
        case "search":
            querry=`SELECT * FROM employees WHERE id IN (${queryObject.filterBy})`
            break
        default:
            querry=`SELECT * FROM employees`
            break
    }

    let employees =  await new Promise((resolve, reject)=>{
        connection.query(querry, function(err, result){
            if(err){
                console.log(err)
                reject(null)
                return
            }
            if(result){
                resolve(result)
            }else{
                resolve("NO_DATA")
            }
        })
    })

    let employeesDetails = await new Promise((resolve, reject)=>{
        let query = ""
        let currentYear = new Date() 
        //get the IDs of the employees
        employees.forEach(element=>{
            query = query + `SELECT DATE_FORMAT(paid_on, '%d-%m-%Y') as pay_date, sum_net, salary_month, salary_year FROM employees_salaries WHERE paid_to=${element.id} AND paid_on > '${currentYear.getFullYear()}-01-01' AND paid_on < '${currentYear.getFullYear()}-12-31' ORDER BY paid_on DESC LIMIT 1; SELECT count(*) AS count FROM employees_vacation WHERE employee_id = ${element.id} AND date > '${currentYear.getFullYear()}-01-01' AND date < '${currentYear.getFullYear()}-12-31';`
        })
        if(query === ""){
            resolve(null)
            return
        }
        connection.query(query, function(err, result){
            if(err){
                console.log(err)
                reject(null)
            }
            if(result){
                resolve(result)
            }else{
                resolve(null)
            }
        })
    })
    //client data and financial data for each client
    return Promise.all([employees, employeesDetails])

}

/**
 * 
 * @param {object} data Object containing employee data
 * @returns {Promise<{status: string, data:int|null}>} Object containing status and insertID
 */

function addEmployee(data){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO employees(emp_first_name, emp_last_name, emp_adress, emp_ident_no, emp_job_name, emp_cur_salary_gross, emp_cur_salary_net, emp_tax, emp_notes, emp_phone, emp_date) VALUES ('${data.emp_first_name}', '${data.emp_last_name}', '${data.emp_adress}', '${data.emp_ident_no}', '${data.emp_job_name}', '${data.emp_cur_salary_gross}', '${data.emp_cur_salary_net}', '${data.emp_tax}', '${data.emp_notes}', '${data.emp_phone}', '${currentDate()}')`, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            if(result.insertId){
                resolve({status:"OK", data: result.insertId})
            }else{
                resolve({status:"FAIL", data:null})
            }
        })
    })
}

/**
 * 
 * @param {*} employeeID The ID of the employee
 * @param {*} data the data to be updated, as a key:value object
 * @returns {Promise<{status:string, data:null}>} Status of the OP
 */

function editEmployee(employeeID, data){
    return new Promise((resolve, reject)=>{
        connection.query(`UPDATE employees SET ? WHERE id=${employeeID}`, data, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            if(result.affectedRows){
                resolve({status:"OK", data:null})
            }else{
                resolve({status:"FAIL", data:null})
            }
        })  
    })
}

/**
 * Check if there is a salary registered for a certain employee on a specific month
 * @param {int} employeeID ID of the employee
 * @param {int} month month, as integer from 1 to 12
 * @param {int} year year, as integer in the form XXXX
 * @returns {Promise<boolean>} true if there is already a payment
 */

function hasSalaryOnDate(employeeID, month, year){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT id FROM employees_salaries WHERE salary_month='${month}' AND salary_year='${year}' AND paid_to='${employeeID}'`, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            if(result.length>0){
                resolve(true)
            }else{
                resolve(false)
            }
        })  
    })
}

/**
 * Registers a new salary in the DB. Calculates net and taxes based on the DB data for the employee with ID paid_to
 * @param {int} paid_to The ID of the employee
 * @param {int} salary_month The month expressed as a integer, where 1 is January
 * @returns {Promise<{status:string, data:integer|string|null}>} Status can be
 * FAIL - data property contains an explanation
 * ERROR - data is null
 * OK - data is the insertID
 */

async function addSalary(paid_to, salary_month, salary_year, bank_ref, taxes){
    
    //get gross salary
    let salaryObject = await new Promise((resolve, reject)=>{
        connection.query(`SELECT emp_cur_salary_gross, emp_tax, emp_tax_cass FROM employees WHERE id='${paid_to}'`, function(error, result){
            if(error){
                console.log(error)
                reject(null)
            }
            if(result.length!=0){   
                resolve(utile.calculateSalary(result[0].emp_cur_salary_gross, taxes[0], taxes[1], taxes[2], taxes[3]))             
            }else{
                resolve(null)
            }
        })  
    })

    //no gross
    if(salaryObject.salary===null) return ({status:"FAIL", data:"FAILED_GETTING_SALARY"})
    if(salaryObject.salary==0) return ({status:"FAIL", data:"INVALID_SALARY"})

    //insert data
    return await new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO employees_salaries(sum_gross, sum_net, paid_to, salary_month, salary_year, tax_cas, tax_cass, tax_income, tax_cm, bank_ref) VALUES ('${salaryObject.gross}', '${salaryObject.salary}', '${paid_to}', '${salary_month}', '${salary_year}', '${salaryObject.cas}', '${salaryObject.cass}', '${salaryObject.tax}', '${salaryObject.cam}', '${bank_ref}')`, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            if(result){
                resolve({
                    status:"OK",
                    data:result.insertId
                })
            }else{
                resolve({
                    status:"FAIL",
                    data:null
                })
            }
        })  
    })    
}

/**
 * 
 * @param {{filter: string, filterBy: string, page:integer, target:string}} querryObject filter is the case, filterBy is the value, page is the page(offset), target can be used to specify the table
 * @returns {Promise<{status: string, data: array}>} status of the OP as string and the data as array containing key:pair values
 */

 function getSalaries(queryObject){
    let returnArr =[]
    let offSet = 0
    let step=queryStep
    if(queryObject.page>1) offSet = (queryObject.page-1) * queryStep
    let querry;    
    switch(queryObject.filter){
        case "all":
            querry=`SELECT id, DATE_FORMAT(paid_on, '%Y-%m-%d') as paid_on, sum_gross, sum_net, tax_cas, tax_cass, tax_income, tax_cm, paid_to, salary_month, salary_year, comments, bank_ref from employees_salaries ORDER BY id DESC LIMIT ${offSet}, ${step}`
            break
        case "paid_to":
            querry=`SELECT id, DATE_FORMAT(paid_on, '%Y-%m-%d') as paid_on, sum_gross, sum_net, tax_cas, tax_cass, tax_income, tax_cm, paid_to, salary_month, salary_year, comments, bank_ref from employees_salaries WHERE paid_to=${queryObject.filterBy}`
            break
        case "interval":
            querry=`SELECT id, DATE_FORMAT(paid_on, '%Y-%m-%d') as paid_on, sum_gross, sum_net, tax_cas, tax_cass, tax_income, tax_cm, paid_to, salary_month, salary_year, comments, bank_ref from employees_salaries WHERE paid_on >= "${queryObject.filterBy.startYear}-${queryObject.filterBy.startMonth}-${queryObject.filterBy.startDay}" AND paid_on <= "${queryObject.filterBy.endYear}-${queryObject.filterBy.endMonth}-${queryObject.filterBy.endDay}" `
            break
        case "employee_interval":
            querry=`SELECT id, DATE_FORMAT(paid_on, '%Y-%m-%d') as paid_on, sum_gross, sum_net, tax_cas, tax_cass, tax_income, tax_cm, paid_to, salary_month, salary_year, comments, bank_ref from employees_salaries WHERE paid_on >= "${queryObject.filterBy.startYear}-${queryObject.filterBy.startMonth}-${queryObject.filterBy.startDay}" AND paid_on <= "${queryObject.filterBy.endYear}-${queryObject.filterBy.endMonth}-${queryObject.filterBy.endDay}" AND id='${queryObject.filterBy.employeeID}' `
            break
        default:
            querry=`SELECT id, DATE_FORMAT(paid_on, '%Y-%m-%d') as paid_on, sum_gross, sum_net, tax_cas, tax_cass, tax_income, tax_cm, paid_to, salary_month, salary_year, comments, bank_ref from employees_salaries LIMIT ${offSet}, ${step}`
            break
    }

    return new Promise((resolve, reject)=>{
        connection.query(querry, function(err, result){
            if(err){
                console.log(err)
                reject({
                    status:"ERROR",
                    data:"ERROR fetching salaries"
                })
            }
            if(result){
                if(result.length>0){
                    result.forEach(element=>{
                        returnArr.push({
                            gross:element.sum_gross, 
                            net:element.sum_net, 
                            cas:element.tax_cas, 
                            cass:element.tax_cass, 
                            income: element.tax_income, 
                            cm:element.tax_cm, 
                            month:element.salary_month
                        })
                    })                    
                    resolve({
                        status:"OK",
                        data:result
                    })
                }else{
                    resolve({
                        status:"OK",
                        data:null
                    })
                }
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
 * Adds vacation days
 * @param {int} employee The id of the employee
 * @param {Array} days An array containing the dates in the format yyyy-mm-dd
 * @returns {Promise<{status:string, data:null}>} Status of the OP
 */

async function addVacationDays(employee, daysObject){

    const requestedDaysNumber = daysObject.length

    return new Promise((resolve, reject)=>{
        let anArray = []
        daysObject.forEach(element=>{
            anArray.push(element.date)
        })

        connection.query(`SELECT * FROM employees_vacation WHERE vacation_date in (?) AND employee_id=${employee} `, anArray, function(error, result){
            if(error){
                console.log(error)
                reject ("ERROR")
            }
            if(result){
                if(result.length>0){
                    reject("INVALID_DATE")
                }else{
                    //create a query element
                    let insertThing = `('${employee}', '${daysObject[0].date}', '${daysObject[0].type}', 'planned')`
                    if(daysObject.length>1){
                        daysObject.shift()
                        //build insert query
                        daysObject.forEach((element, index)=>{
                            insertThing = insertThing + `,('${employee}', '${element.date}', '${element.type}', 'planned')`
                        })
                    }
                    //add days to the DB
                    connection.query(`INSERT INTO employees_vacation(employee_id, vacation_date, vacation_type, status) VALUES ${insertThing}`, function(error, result){
                        if(error){
                            console.log(error)
                            reject ({status:"FAIL", data:null})
                        }
                        if(requestedDaysNumber==result.affectedRows){
                            resolve({status:"OK", data:null})
                        }else{
                            resolve({status:"FAIL", data:null})
                        }                           
                    })              
                }
            }else{
                reject("ERROR")
            }           
        })
    })




}

/**
 * Retrieves vacation days for a certain employee
 * @param {integer} employee ID of the employee
 * @returns {Promise<{status:string, data:array}>} Status of the OP and data
 */

function getVacationDays(employee){
    let returnArr = []
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT id, DATE_FORMAT(vacation_date, '%d-%m-%Y') as vacation_date_format, vacation_type, DATE_FORMAT(date, '%d-%m-%Y') as date, status FROM employees_vacation WHERE employee_id='${employee}' ORDER BY vacation_date ASC`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result.length>0){
                result.forEach(element=>{
                    returnArr.push({id: element.id, date:element.vacation_date_format, type:element.vacation_type, registerDate: element.date, status: element.status})
                })
                resolve({status:"OK", data:returnArr})
            }else{
                resolve({status:"OK", data:null})
            }            
        })
    })
}

/**
 * Changes the status of a vacation day
 * @param {*} id ID of the vacation day
 * @param {*} newStatus Status to be updated to
 * @returns {Promise<{status:string}>} Status of the OP
 */
function changeVacationStatus(id, newStatus){
    return new Promise((resolve, reject)=>{
        connection.query(`UPDATE employees_vacation SET status='${newStatus}' WHERE id='${id}'`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result.affectedRows>0){
                resolve({status:"OK", data: null})
            }else{
                resolve({status:"FAIL", data:null})
            }            
        })
    }) 
}

/**
 * Delete a requested vacation day; executed days will not be deleted
 * @param {*} id ID of the vacation day
 * @returns 
 */
function deleteVacationDay(id){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM invoicemanager.employees_vacation WHERE id=${id} AND NOT status='executed'`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result.affectedRows>0){
                resolve({status:"OK", data: null})
            }else{
                resolve({status:"FAIL", data:null})
            }            
        })
    })
}

function getEmployeeInfo(employeeID){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM employees WHERE id=${employeeID}`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result.length>0){
                resolve({status:"OK", data:result})
            }else{
                resolve({status:"OK", data:null})
            } 
        })
    })
}

/**
 * Moves data from the employee table to the archive table
 * @param {integer} employeeID ID of the employee
 * @returns {Promise<string>} Status of the OP
 */

function archiveEmployee(employeeID){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO employees_archived(id, emp_first_name, emp_last_name, emp_adress, emp_ident_no, emp_date, emp_active, emp_job_name, emp_cur_salary_gross, emp_tax, emp_cur_salary_net, emp_notes) SELECT * FROM employees where id=${employeeID}`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                if(result.insertId>0){
                    resolve("OK")
                }else{
                    resolve("FAIL")
                } 
            }
            resolve("FAIL")
        })
    })
}

/**
 * Delete an employee
 * @param {integer} employeeID Employee ID
 * @returns {Promise<status:string, data:null>} Status of the OP
 */

function deleteEmployee(employeeID){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM employees WHERE id='${employeeID}'`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                if(result.affectedRows>0){
                    resolve({status:"OK", data:null})
                }else{
                    resolve({status:"FAIL", data:null})
                } 
            }
            resolve({status:"FAIL", data:null})
        })
    })  
}

function removePredefinedProduct(productID){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM predefined_products WHERE id='${productID}'`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                if(result.affectedRows>0){
                    resolve({status:"OK", data:null})
                }else{
                    resolve({status:"FAIL", data:null})
                } 
            }
            resolve({status:"FAIL", data:null})
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
    let jsonData, json2csvParser, csv;
    let exportInvoices = new Promise((resolve, reject)=>{
        connection.query(`SELECT invoice_number, invoice_status, invoice_pay_method, invoice_bank_ref, rec_number, customer_id, client_type, client_fiscal_1, client_fiscal_2, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, DATE_FORMAT(invoice_date, '%y-%c-%d %H:%m:%s.%f') as invoice_date, invoice_tax, invoice_total_sum FROM invoices`, function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/invoices.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("invoices.csv generated");
              resolve("OK")
            });
        });
    })
    let exportBilledProjects = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM invoices_billed_products", function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/invoices_billed_products.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("invoices_billed_products.csv generated");
              resolve("OK")
            });
        });
    })

    let clients = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM clients", function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/clients.csv", csv, function(error) {
                if (error) reject("ERROR")
              console.log("clients.csv generated");
              resolve("OK")
            });
        });
    })
    let expenses = new Promise((resolve, reject)=>{
        connection.query("SELECT id, exp_name, exp_sum, exp_description, DATE_FORMAT(exp_date, '%y-%c-%d %H:%m:%s.%f') as exp_date, exp_deduct FROM expenses", function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/expenses.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("expenses.csv generated");
              resolve("OK")
            });
        });
    })
    let employees = new Promise((resolve, reject)=>{
        connection.query("SELECT id,emp_first_name,emp_last_name,emp_adress,emp_ident_no,emp_phone, DATE_FORMAT(emp_date, '%y-%c-%d %H:%m:%s.%f') as emp_date ,emp_active,emp_job_name,emp_cur_salary_gross,emp_tax,emp_tax_cass,emp_cur_salary_net,emp_notes,emp_vacation_days FROM employees", function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/employees.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("employees.csv generated");
              resolve("OK")
            });
        });
    })

    let emp_sal = new Promise((resolve, reject)=>{
        connection.query("SELECT id, DATE_FORMAT(paid_on, '%y-%c-%d %H:%m:%s.%f') as paid_on, sum_gross, sum_net, tax_cas, tax_cass, tax_income, tax_cm, paid_to, salary_month, salary_year, comments, bank_ref from employees_salaries", function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/employees_salaries.csv", csv, function(error) {
                if (error) reject("ERROR")
              console.log("employees_salaries.csv generated");
              resolve("OK")
            });
        });
    })

    let emp_vac = new Promise((resolve, reject)=>{
        connection.query("SELECT id, employee_id, DATE_FORMAT(vacation_date, '%y-%c-%d %H:%m:%s.%f') as vacation_date, vacation_type, DATE_FORMAT(date, '%y-%c-%d %H:%m:%s.%f') as date, status FROM employees_vacation", function(error, data, fields) {
            if(error){
                console.log(error)
                reject("ERROR")
                return false
            }
            if(data.length>0){
                jsonData = JSON.parse(JSON.stringify(data));
                json2csvParser = new Json2csvParser({ header: true});
                csv = json2csvParser.parse(jsonData);
            }else{
                //no data means there is nothing to export; resolve and end execution
                resolve("NO_DATA")
                return false
            }
            fs.writeFile("./exports/employees_vacation.csv", csv, function(error) {
              if (error) reject("ERROR")
              console.log("employees_vacation.csv generated");
              resolve("OK")
            });
        });
    })
    //chain data
    databaseLog("Au fost exportate datele")
    return await Promise.all([exportInvoices, exportBilledProjects, clients, expenses, employees, emp_sal, emp_vac])    
}

async function getDashboardData(){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT invoice_number, invoice_status, client_first_name , client_last_name , invoice_date , invoice_total_sum FROM invoices ORDER BY invoice_number DESC`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                resolve(result)
            }
            resolve({status:"FAIL", data:null})
        })
    })
}

async function pingDB(){
    return new Promise((resolve, reject)=>{
        connection.ping(function (err) {
            if(err){
                console.log(err)
                reject(false)
            }
            resolve(true)
        })   
    })
}

function checkIfTableExists(tablename){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM information_schema.tables WHERE table_name = '${tablename}' LIMIT 1;`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                resolve({status:"OK", data:result})
            }
            resolve({status:"FAIL", data:null})
        })
    })

}

async function getLatestLogs(){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * from log order by date DESC LIMIT 3`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                resolve({status:"OK", data:result})
            }
            resolve({status:"FAIL", data:null})
        })
    })
}

async function getHistory(targetTerms){
    let query = ""
    console.log(targetTerms)
    if(Array.isArray(targetTerms)){
        query = `SELECT * FROM log WHERE MESSAGE like '%${targetTerms[0]} ${targetTerms[1]}%'`
    }else{
        query = `SELECT * FROM log WHERE MESSAGE like '%${targetTerms}%'`
    }
    return new Promise((resolve, reject)=>{
        connection.query(query, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result){
                resolve({status:"OK", data:result})
            }
            resolve({status:"FAIL", data:null})
        })
    })
}

async function getEmployeesDetails(clientsArray){
    let query = ""
    let date = currentDate()
    clientsArray.forEach(element=>{
        query = query + `SELECT paid_on, sum_net, salary_month, salary_year FROM employees_salaries WHERE paid_to=${element};`
    })
    console.log(query)
    return null
}

async function deleteSalary(id){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM employees_salaries WHERE id='${id}'`, function(error, result){
            if(error){
                console.log(error)
                reject ({status:"ERROR", data:null})
            }
            if(result.affectedRows>0){
                resolve({status:"OK", data:result})
            }
            resolve({status:"FAIL", data:null})
        })
    })
}

function getSalary(id){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * from employees_salaries WHERE id='${id}'`, function(error, result){
            if(error){
                console.log(error)
                reject (null)
            }
            if(result){
                resolve(result[0])
            }
            resolve(null)
        })
    })
}

/**
 * Changes DB connection properties in the JSON file
 * @param {*} host 
 * @param {*} user 
 * @param {*} pass 
 * @returns {Promise<{status: string, data: array}>} status of the OP as string and the data as array containing key:pair values
 */
function changeDBsettings(host, user, pass){
    let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
    if(host) databasesObject.host = host
    if(user) databasesObject.user = user
    if(pass) databasesObject.password = pass
    fs.writeFileSync('./database.json', JSON.stringify(databasesObject));
    return ({status:"OK", data: null})
}

/**
 * Changes the "alias" of a DB table
 * @param {*} alias The alias of the table
 * @param {*} name Database name
 * @returns 
 */
function changeTableProperties(alias, name){
    let databasesObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'))
    for(let i=0;i<databasesObject.databases.length;i++){
        if(databasesObject.databases[i].database===name){
            databasesObject.databases[i].alias = alias
            fs.writeFileSync('./database.json', JSON.stringify(databasesObject));
            return({status:"OK", data: null})
        }        
    }
    return({status:"FAIL", data: "NOT_FOUND"})
}

function fetchHolidays(){
    let holidaysText = fs.readFileSync(path.join(__dirname, '../zilelibere.txt'), 'utf8')
    console.log(holidaysText)
    return holidaysText.length > 0 ? holidaysText.split(";") : null
}


module.exports ={
    getClients:getClients,
    addClient:addClient,
    addInvoice:addInvoice,
    getInvoices:getInvoices,
    deleteClient: deleteClient,
    archiveClientData: archiveClientData,
    archiveInvoice: archiveInvoice,
    deleteInvoice: deleteInvoice ,
    fetchInvoiceSummary: fetchInvoiceSummary,
    fetchBilledProductsFromInvoice, fetchBilledProducts,
    editClient:editClient,
    getFinancialData: getFinancialData,
    checkInvoiceStatus:checkInvoiceStatus,
    updateInvoice: updateInvoice,
    getActiveRecurrentInvoices: getActiveRecurrentInvoices,
    getPredefinedProducts: getPredefinedProducts, getProductInfo,
    registerProduct:registerProduct,
    editPredefinedProduct:editPredefinedProduct,
    removeProduct:removeProduct,
    getProductInvoice:getProductInvoice,
    updateInvoiceTotals:updateInvoiceTotals,
    registerBilledProducts: registerBilledProducts,
    getRecordsNumber:getRecordsNumber, getDBinfo:getDBinfo, changeDatabase, getExpenses,addExpense, deleteExpense, searchDatabase, getEmployees, addEmployee, editEmployee, hasSalaryOnDate, addSalary, getSalaries, addVacationDays, getVacationDays, getEmployeeInfo, archiveEmployee, deleteEmployee, removePredefinedProduct,
    exportData,
    getDashboardData, pingDB, databaseLog, getLatestLogs,
    getHistory, getEmployeesDetails, changeVacationStatus, deleteVacationDay, deleteSalary, getSalary, changeDBsettings, changeTableProperties, addDatabase, deleteDatabase, checkForDatabases, fetchHolidays
}