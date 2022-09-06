const mysql = require('mysql2');
const utile = require('../utils/util.js')
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");

const testDB = "invoicemanager"
const liveDB = "baza_date_facturi"

const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"invoicemanager"
})

connection.connect(function(err){
    if(err){
        console.log(`Error in connectiong to the database: ${err.stack}`)
        return;
    }
    console.log("Connected to the database")
})

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

function addElement(data){
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

function createNewInvoice(data)
{
    return new Promise((resolve, reject)=>{
        let querryToBeExecuted = ``;

        if(data.clientID){
            querryToBeExecuted = `INSERT INTO invoices(client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, customer_id, invoice_status, invoice_pay_method, invoice_bank_ref) SELECT client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email,  '${data.clientID}', '${data.invoice_status}', '${data.invoice_pay_method}', '${data.invoice_bank_ref}' FROM clients WHERE id='${data.clientID}'` 
        }else{
            querryToBeExecuted = `INSERT INTO invoices(client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, client_phone, client_email, invoice_status, invoice_pay_method, invoice_bank_ref) VALUES ('${data.client_first_name}', '${data.client_last_name}', '${data.client_county}', '${data.client_city}', '${data.client_street}', '${data.client_adress_number}', '${data.client_zip}', '${data.client_phone}', '${data.client_email}', '${data.invoice_status}', '${data.invoice_pay_method}', '${data.invoice_bank_ref}')`
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

function registerBilledProducts(invoiceID, billedProductsArray){
    //update the products table by adding the invoiceID to each element
    let total_tax=0
    let arr_copy = [];

    //[0] - product name, [1] - um, [2] - quantity, [3] - tax %, [4] - tax float, [5] - price per item, [6] - productID(null or hasvalue)
    billedProductsArray.forEach(element => {
        //[0] - product name, [1] - um, [2] - quantity, [3] - tax %, [4] - tax float calculated, [5] - price per item, [6] - invoiceID, [7] - quantity*ppi, [8] - productID
        arr_copy.push([element[0], element[1], element[2], element[3], parseFloat(((element[2]*element[5])/100)*element[3]), element[5], invoiceID, (element[2]*element[5]), element[6]])
        total_tax=total_tax+parseFloat(((element[2]*element[5])/100)*element[3]);
    });

    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO invoices_billed_products (product_name, product_mu, product_quantity, product_tax_pr, total_tax, product_price, invoiceID, total_price, product_id) VALUES ?`, [arr_copy], function(err, result) {
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
            .catch(data=>{
                return({
                    status:"PRODUCTS_NOT_REGISTERED",
                    data:invoiceID
                })
        })
    }
    return({status:"OK", data:invoiceID})
}

function getInvoices(querryObject){
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

function archiveClientData(clientID){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO clients_archived(id, client_first_name, client_last_name, client_adress, client_billing_adress, client_phone, client_email, client_notes, archived) select * from clients where id='${clientID}'`, function(err, result){
            if(err){
                reject({
                    status:"ERROR",
                    data:"ERROR archiving client"
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


function archiveInvoice(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO invoices_archived(rec_number, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, invoice_total_sum, invoice_date) SELECT rec_number, client_first_name, client_last_name, client_county, client_city, client_street, client_adress_number, client_zip, invoice_total_sum, invoice_date FROM invoices where rec_number=${invoiceID}`, function(err, result){
            if(err){
                console.log(err)
                reject({                    
                    status:"ERROR",
                    data:"ERROR archiving invoice"
                })
            }
            if(result){
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

function deleteInvoice(invoiceID){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM invoices WHERE rec_number=${invoiceID}`, function(err, result){
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

function fetchBilledProducts(invoiceNumber){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM invoices_billed_products WHERE invoiceID='${invoiceNumber}'`, function(err, result){
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

function editElement(data){
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
    console.log(rec, inv)
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

function getFinancialData(filterObject){
    let querry;
    switch (filterObject.timeUnit){
        case "yearly":
            querry=`SELECT invoice_pay_method, invoice_tax, invoice_total_sum, invoice_date  FROM invoices WHERE invoice_date >= "${filterObject.year}-01-01" AND invoice_date < "${filterObject.year}-12-31" AND invoice_status='finalised'`
            break  
        case "custom":
            querry=`SELECT invoice_pay_method, invoice_tax, invoice_total_sum, invoice_date  FROM invoices WHERE invoice_date >= "${filterObject.yearStart}-${filterObject.monthStart}-${filterObject.dayStart}" AND invoice_date < "${filterObject.yearEnd}-${filterObject.monthEnd}-${filterObject.dayEnd}" AND invoice_status='finalised'`
            break           
    }

    return new Promise((resolve, reject)=>{
        connection.query(querry, function(error, result){
            if(error){
                console.log(error)
                reject({status:"ERROR"})
            }
            resolve({status:"OK", data: result})
        })
    })
}

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

function getPredefinedProducts(){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM predefined_products`, function(error, result){
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

async function registerProduct(data){
    return new Promise((resolve, reject)=>{
        connection.query(`INSERT INTO predefined_products(pp_name, pp_um, pp_tax, pp_price_per_item, pp_description) VALUES ('${data.pp_name}', '${data.pp_um}', ${data.pp_tax}, '${data.pp_price_per_item}', '${data.pp_description}')`, function(error, result){
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

async function editPredefinedProduct(data){
    let productID = data.product_id;
    delete data.product_id;
    return new Promise((resolve, reject)=>{
        connection.query(`UPDATE predefined_products SET ? WHERE id=${productID}`, data, function(error, result){
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

function removeProduct(entry){
    return new Promise((resolve, reject)=>{
        connection.query(`DELETE FROM invoices_billed_products WHERE id=${entry}`, function(error, result){
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

function getProductInvoice(entry){
    return new Promise((resolve, reject)=>{
        connection.query(`SELECT invoiceID FROM invoices_billed_products WHERE id=${entry}`, function(error, result){
            if(error){
                console.log(error)
            }
            resolve(result[0].invoiceID)
        })
    })
}

//get all the products linked to the invoice from the DB; calculate the totals; update the DB totals
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
            }
            resolve("OK")
        })
    }) 
}

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
            }
            resolve(result[0].recordsNumber)
        })
    }) 
}

async function exportData(){

    if (!fs.existsSync('./exports')){
        fs.mkdirSync('./exports');
    }

    let exportInvoices = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM invoices", function(error, data, fields) {
            if (error) throw error;
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/invoices.csv", csv, function(error) {
              if (error) throw error;
              console.log("invoices.csv generated");
              resolve("OK")
            });
        });
    })

    let exportBilledProjects = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM invoices_billed_products", function(error, data, fields) {
            if (error) throw error;
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/invoices_billed_products.csv", csv, function(error) {
              if (error) throw error;
              console.log("invoices_billed_products.csv generated");
              resolve("OK")
            });
        });
    })

    let predefinedProducts = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM predefined_products", function(error, data, fields) {
            if (error) throw error;
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/predefined_products.csv", csv, function(error) {
              if (error) throw error;
              console.log("predefined_products.csv generated");
              resolve("OK")
            });
        });
    })

    let clients = new Promise((resolve, reject)=>{
        connection.query("SELECT * FROM clients", function(error, data, fields) {
            if (error) throw error;
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile("./exports/clients.csv", csv, function(error) {
              if (error) throw error;
              console.log("clients.csv generated");
              resolve("OK")
            });
        });
    })

    Promise.all([exportInvoices, exportBilledProjects, predefinedProducts, clients]).then((values) => {
        return(values)
    });

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
                    reject(false)
                }
                resolve(liveDB)
            })
        }else{
            connection.changeUser({database : testDB}, function(err) {
                if (err) reject(false)
                resolve(testDB)
            })
        }
    })

}

module.exports ={
    getAllClients:getAllClients,
    addElement:addElement,
    addInvoice:addInvoice,
    getInvoices:getInvoices,
    deleteClient: deleteClient,
    archiveClientData: archiveClientData,
    archiveInvoice: archiveInvoice,
    deleteInvoice: deleteInvoice ,
    fetchInvoiceSummary: fetchInvoiceSummary,
    fetchBilledProducts: fetchBilledProducts,
    editElement:editElement,
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
    changeDBinfo:changeDBinfo
}