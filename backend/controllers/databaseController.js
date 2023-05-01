
const databaseOperations = require('./databaseOperations.js') 
const utile = require('../utils/util.js')

/**
 * Get the clients
 * @param {*} querryObject object that filters data 
 * @returns {object} object containing the status of the OP, number of found records and the data
 */

async function fetchClients(querryObject){
    let clientsData, recordsNumber;

    if(querryObject.filter!="search"){
        try{
            [clientsData, recordsNumber] = await Promise.all([databaseOperations.getClients(querryObject), databaseOperations.getRecordsNumber("clients", querryObject.filter, querryObject.filterBy)])
        }catch(error){
            console.log(error)
            return({status:"ERROR", data:null})
        }        
    }else{
        try{
            //can use + to replace the space in the search text
            let stringedFilterBy=querryObject.filterBy.replace("+"," ")
            clientsData = await databaseOperations.getClients({filter:"search", filterBy: await databaseOperations.searchDatabase({target:"clients", searchTerm: stringedFilterBy}), page:1})
        }catch(error){
            console.log(error)
        }
    }

    return({
        status: clientsData.status,
        totalRecordsNumber: recordsNumber,
        data:clientsData.data
    })
}

/**
 * Registers a new client
 * @param {*} data Data to be inserted in the DB
 * @returns {Object} Object containing status of the OP 
 */
async function handleClientData(data){
    return await databaseOperations.addClient(data) 
}

/**
 * Edits a client
 * @param {Object} data Contains clientID and dataToBeUpdated
 * @returns {Object} Object containing status of the OP 
 */

async function updateClientData(data){
    if(data.clientID===null) return({status:"ERROR", data:"Invalid clientID"})
    return await databaseOperations.editClient(data)
}

function addInvoice(data, callback){ 
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

async function fetchInvoices(querryObject){
    let invoicesData, recordsNumber

    if(querryObject.interval!==null){
        querryObject.processedInterval = translateInterval(querryObject.interval)
    }else{
        querryObject.processedInterval = null
    }

    if(querryObject.filter!="search"){
        try{
            [invoicesData, recordsNumber] = await Promise.all([databaseOperations.getInvoices(querryObject), databaseOperations.getRecordsNumber(querryObject.target, querryObject.filter, querryObject.filterBy)])
        }catch(error){
            console.log(error)
            return({status:"ERROR", data:null})
        }  
    }else{
        //can use + to replace the space in the search text
        let stringedFilterBy=querryObject.filterBy.replace("+"," ")
        invoicesData = await databaseOperations.getInvoices({filter:"search", filterBy:await databaseOperations.searchDatabase({target:"invoices", searchTerm:stringedFilterBy, processedInterval:querryObject.processedInterval}), page:1})
    }

    return({
        status: invoicesData.status, 
        totalRecordsNumber: recordsNumber,
        data: invoicesData.data      
    })               

}

function archiveClient(clientID, callback){
    if(clientID!=null){
        //move client data to a different table
        databaseOperations.archiveClientData(clientID).then((data)=>{
            //if data has been moved, we can remove it from the table
            if(data.status==="OK"){
                console.log(`Client ${clientID} archived`)
                databaseOperations.deleteClient(clientID)
                .then((data)=>{
                    if(data.status==="OK"){
                        callback({status:"OK"})
                    }else{
                        console.log("Could not delete the client")
                        callback({status:"FAIL"})
                    }                
                })
                .catch((err)=>{
                    console.log("Could not archive client data")
                    callback({status:"ERROR"})
                })
            }
        })
        //could not move the data
        .catch((err)=>{
            callback({status:"ERROR"})
        })
    //issue with the cliendID
    }else{
        callback({status:"INVALID_REQUEST"})
    }
}

function archiveInvoice(invoiceID, callback){
    if(invoiceID!=null){
        //move invoice data to a different table
        databaseOperations.archiveInvoice(invoiceID).then((data)=>{
            //if data has been moved, we can remove it from the table
            if(data.status==="OK"){
                console.log(`Invoice ${invoiceID} archived`)
                databaseOperations.deleteInvoice(invoiceID).then((data)=>{
                    if(data.status==="OK"){
                        callback({status:"OK"})
                    }else{
                        console.log("Could not delete invoice")
                        callback({status:"FAIL"})
                    }                
                })
                //could not move the invoice data
                .catch((err)=>{
                    console.log("Could not archive invoice")
                    callback({status:"ERROR"})
                })
            }
        })
        .catch((err)=>{
            callback({status:"ERROR"})
        })
    //issue with the invoice ID
    }else{
        callback({status:"ERROR"})
    }
}

async function fetchInvoiceData(querryObject){
    let dataArray={
        invoiceProperty:({number:"", date:"", client_type:"", client_fiscal_1:"", client_fiscal_2:"", client_first_name:"", client_last_name:"", date:"", total:({price:0, tax:0, items:0})}),
        invoiceProducts:{}
    }

    let invoiceData = await databaseOperations.getInvoices(querryObject)
    //if we don't have data, probably the invoice number is not okay
    if(invoiceData.status!=="OK") return ({status:"INVALID_REQUEST"})

    //populate the object
    dataArray.invoiceProperty.number=invoiceData.data[0].invoice_number
    dataArray.invoiceProperty.date=utile.simpleDate(invoiceData.data[0].invoice_date)
    dataArray.invoiceProperty.client_first_name=invoiceData.data[0].client_first_name
    dataArray.invoiceProperty.client_last_name=invoiceData.data[0].client_last_name
    dataArray.invoiceProperty.client_fiscal_1=invoiceData.data[0].client_fiscal_1
    dataArray.invoiceProperty.client_fiscal_2=invoiceData.data[0].client_fiscal_2
    dataArray.invoiceProperty.client_type=invoiceData.data[0].client_type
    dataArray.invoiceProperty.client_county=invoiceData.data[0].client_county
    dataArray.invoiceProperty.client_city=invoiceData.data[0].client_city
    dataArray.invoiceProperty.client_street=invoiceData.data[0].client_street
    dataArray.invoiceProperty.client_adress_number=invoiceData.data[0].client_adress_number
    dataArray.invoiceProperty.client_zip=invoiceData.data[0].client_zip
    dataArray.invoiceProperty.client_phone=invoiceData.data[0].client_phone
    dataArray.invoiceProperty.client_email=invoiceData.data[0].client_email
    dataArray.invoiceProperty.invoice_date=invoiceData.data[0].invoice_date
    dataArray.invoiceProperty.invoice_status=invoiceData.data[0].invoice_status
    dataArray.invoiceProperty.invoice_pay_method=invoiceData.data[0].invoice_pay_method
    dataArray.invoiceProperty.invoice_bank_ref=invoiceData.data[0].invoice_bank_ref
    dataArray.invoiceProperty.total.price=invoiceData.data[0].invoice_total_sum

    //products linked with the invoice
    let productData = await databaseOperations.fetchBilledProductsFromInvoice(querryObject.filterBy)

    //can't find the products
    if(productData.status!=="OK") return ({status:"ERROR"})
    let processedProductsData = utile.procesBilledProductsData(productData.data)
    dataArray.invoiceProducts=processedProductsData[0];
    dataArray.invoiceProperty.total.items=processedProductsData[1]
    dataArray.invoiceProperty.total.tax=processedProductsData[2]  

    return dataArray;

}

/**
 * 
 * @param {*} interval String in the format yyyymmdd-yyyymmdd
 * @returns An object {startDay:dd, startMonth:mm, startYear:yyyyy, endDay:dd, endMonth:mm, endYear:yyyy}
 */

function translateInterval(interval){
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    let transaltedInterval={startDay:"", startMonth:"", startYear:"", endDay:"", endMonth:"", endYear:""}

    let firstSplit = interval.split("-")
    transaltedInterval={
        startDay:`${firstSplit[0][0]}${firstSplit[0][1]}`,
        startMonth:`${firstSplit[0][2]}${firstSplit[0][3]}`,
        startYear:`${firstSplit[0][4]}${firstSplit[0][5]}`,
        endDay:`${firstSplit[1][0]}${firstSplit[1][1]}`,
        endMonth:`${firstSplit[1][2]}${firstSplit[1][3]}`,
        endYear:`${firstSplit[1][4]}${firstSplit[1][5]}`,
    }
    
    return transaltedInterval

}

/**
 * Retrieves data for the financial component
 * @param {Object} querryObject object that filters data  
 * @returns {Object} containing the status of the OP and processed data
 */
async function getFinancials(querryObject){
    //some initial checks of the request
    if(querryObject.filter!="interval"){
        return({status:"INVALID_REQUEST", data: "filter"})
    }
    if(querryObject.filterBy.length!=13){
        return({status:"INVALID_REQUEST", data: "filterBy"})
    }
    if(querryObject.filterBy.indexOf("-")<0){
        return({status:"INVALID_REQUEST", data: "filterBy"})
    }

    let interval=translateInterval(querryObject.filterBy)

    //get all data and process it
    try {
        const [financialData, expenses, salaries] = await Promise.all([databaseOperations.getFinancialData(interval), databaseOperations.getExpenses(interval, false), databaseOperations.getSalaries({page:1, filterBy:interval, filter:"interval"})])
        return({status:"OK", data: utile.processFinancial(financialData.data, expenses.data, interval, salaries.data)})
    }catch (error) {
        console.log(error)
        return({status:"ERROR", data: "Data could not be fetched"})
    } 
}

/**
 * Updates the data of an invoice
 * @param {*} data Object containing the invoiceID and fields+values to be changed
 * @returns 
 */
async function updateInvoice(data){
    let databaseStatus = await databaseOperations.checkInvoiceStatus(data.invoiceID)
    //check if we have billed products
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
                if(data.invoice_status==="finalised"){
                    //update invoice date when finalised
                    data.invoice_date = new Date()
                }
                let updateStatus = await databaseOperations.updateInvoice(invoice_number, data)
                //an error occured
                if(updateStatus===0){
                    return("UPDATE_INVOICE_ERROR")
                }
                databaseOperations.databaseLog(`Invoice ${invoice_number} has been finalised`)                
            }
            //new products to be added
            if(billingProducts!=null){
                //register products
                let productsUpdateStatus = await databaseOperations.registerBilledProducts(invoice_number, billingProducts)
                if(productsUpdateStatus.status!="OK") return("UPDATE_PRODUCTS_ERROR")                
            }
            //update tax in invoices table if the invoice is done
            if(data.invoice_status==="finalised"){
                databaseOperations.updateInvoiceTotals(invoice_number)
            }
            return "OK"
        }
        //the invoice has to be "draft"
        return("UPDATE_INVOICE_NOT_POSSIBLE")        
    }
    //no invoice found?
    return("UPDATE_INVOICE_NOT_FOUND")    
}


async function getPredefinedProducts(filterObject){
    let productsObject, totalRecordsNumber
    //client data
    [productsObject, totalRecordsNumber] = await Promise.all([databaseOperations.getPredefinedProducts({filter:"all", filterBy:"", page:1}), databaseOperations.getRecordsNumber("predefined_products", "all", "")]) 
    if(productsObject.status==="OK"){
        return({
            status:"OK",
            totalRecordsNumber: totalRecordsNumber,
            data:productsObject.data
        })
    }else{
        return({
            status:"ERROR",
            data:null
        })
    }
}

/**
 * When a product form is submitted, either edit the product that has the provided ID or create a new product if no ID provided
 * @param {*} data 
 * @returns 
 */
async function handleProduct(data){
    let status= data.product_id!=null ? await databaseOperations.editPredefinedProduct(data) : await databaseOperations.registerProduct(data) 
    return status   
}

/**
 * Removes a predefined product
 * @param {*} productID The ID of the product
 * @returns 
 */
async function deletePredefinedProduct(productID){
    return await databaseOperations.removePredefinedProduct(productID)
}

//find the invoice of the product; remove the product from the database; calculate and update the total invoice SUM and TAX
async function removeProduct(entry){
    if(entry===null)  return({status: "ERROR", data: "Entry invalid"})
    //find the invoice
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

function getDatabaseInfo(){
    let data = databaseOperations.getDBinfo()
    return data
}

async function changeDatabase(databaseName){
    return await databaseOperations.changeDatabase(databaseName)
}

/**
 * Get all expenses from the DB
 * @param {Object} querryObject object that filters data 
 * @returns {Object} Object containing the status of the OP and the data
 */

async function getExpenses(querryObject){
    //some initial checks of the request
    if(querryObject.filter!="interval"){
        return({status:"INVALID_REQUEST", data: "filter"})
    }
    if(querryObject.filterBy.length!=13){
        return({status:"INVALID_REQUEST", data: "filterBy"})
    }
    if(querryObject.filterBy.indexOf("-")<0){
        return({status:"INVALID_REQUEST", data: "filterBy"})
    }

    return await databaseOperations.getExpenses(translateInterval(querryObject.filterBy), true)    
}

/**
 * 
 * @param {Object} data Data to be inserted in the DB 
 * @returns {Object} Object containing the status of the OP and the ID of the new element, if applicable
 */
async function addExpense(data){
    return await databaseOperations.addExpense(data)
}

/**
 * 
 * @param {integer} id The id of the expense to be deleted
 * @returns {Object} Object with only one key-value, the status of the OP
 */
async function deleteExpense(id){
    return await databaseOperations.deleteExpense(id)
}

/**
 * Returns the list of employees
 * @param {*} filterObject contains filter, filterBy and page number
 * @returns {Promise<{status: string, totalRecordsNumber:int, data: int}>} status of the OP and data
 */
async function getEmployees(filterObject){
    let employeesObject, totalRecordsNumber
    if(filterObject.filter!=="search"){
        try{
            //employee data
            [employeesObject, totalRecordsNumber] = await Promise.all([databaseOperations.getEmployees(filterObject), databaseOperations.getRecordsNumber("employees", filterObject.filter, filterObject.filterBy)])
        }catch(error){
            console.log(error)
            return {status:"ERROR", recordsNumber: 0, data: null}
        }        
        if(employeesObject[0].length===0) return ({status: "OK", totalRecordsNumber:0, data: null})
    }else{        
        //can use + to replace the space in the search text
        [employeesObject, totalRecordsNumber] = await Promise.all([await databaseOperations.getEmployees({filter:"search", filterBy:await databaseOperations.searchDatabase({target:"employees", searchTerm:filterObject.filterBy.replace("+"," ")}), page:1}), 0])
        if(employeesObject[0]===null) return {status:"NO_DATA", recordsNumber: 0, data: null}
    }
  
    employeesObject[0].forEach((element, index)=>{
        if(employeesObject[1][index*2].length>0){
            element.lastSalaryDetails = {
                pay_date:  'pay_date' in employeesObject[1][index*2][0] ? employeesObject[1][index*2][0].pay_date : 0,
                salary_month: 'salary_month' in employeesObject[1][index*2][0] ? employeesObject[1][index*2][0].salary_month : 0,
                salary_year: 'salary_year' in employeesObject[1][index*2][0] ? employeesObject[1][index*2][0].salary_year : 0,
                net: 'sum_net' in employeesObject[1][index*2][0] ? employeesObject[1][index*2][0].sum_net : 0,
                vacationDays: 'count' in employeesObject[1][index+index+1][0] ? employeesObject[1][index+index+1][0].count : 0
            }
        }else{
            element.lastSalaryDetails = {
                pay_date:  0,
                salary_month:  0,
                salary_year: 0,
                net: 0,
                vacationDays: 0
            } 
        }

    })

    return({
        status: "OK",
        totalRecordsNumber,
        data: employeesObject[0]
    })

}

/**
 * Adds a new eomployee
 * @param {object} data Object containing employee data 
 * @returns {Promise<{status: string, data: int}>} Object containing status of OP and the ID of the employee
 */
async function addEmployee(data){
    //no salary no function
    if(data.emp_cur_salary_gross<1) return ({status:"FAIL", data:"INVALID_DATA"})
    //add the net salaray to the mix
    let netSalary = utile.calculateSalary(data.emp_cur_salary_gross, 25, 10, data.emp_tax ? 10 : 0, 2.25)
    data.emp_cur_salary_net=netSalary.salary

    return await databaseOperations.addEmployee(data)
}

/**
 * Edits an employee
 * @param {{employeeID: string, data:any}} data Object, containing the employeeID and data to be updated
 * @returns {Promise<{status:string, data:null}>} Status of the OP
 */
async function editEmployee(data){
    if(data.employeeID===null) return({status:"ERROR", data:"Invalid employeeID"})
    return await databaseOperations.editEmployee(data.employeeID, data.dataToBeUpdated)
}

/**
 * Archives an employee
 * @param {integer} employeeID The employee ID
 * @returns {Promise<status:string, data:null>} The status of the OP
 */
async function archiveEmployee(employeeID){

    let moveDataStatus = await databaseOperations.archiveEmployee(employeeID)
    if(moveDataStatus=="OK"){
        return await databaseOperations.deleteEmployee(employeeID)
    }
    return({status:"ERROR", data:null})
}

/**
 * Registers a new salary. Needs the ID of the employee,the month for which the salary is paid and the year. Salary taxes are provided by the form
 * @param {{paid_to:int, salary_month:int}} data 
 * @returns 
 */

async function addSalary(data){
    let employeeID=data.paid_to
    let month = data.salary_month
    let year = data.salary_year
    let bank_ref = data.bank_ref
    //an object containing taxes
    let taxes = data.taxes

    //some checks on data. Month is in the interval 1..12
    if((!month)||(month>12)||(month<1)) return ({status:"ERROR", data:"INVALID_SALARY_MONTH"})
    if(!year) return ({status:"ERROR", data:"INVALID_SALARY_YEAR"})
    if(!employeeID) return ({status:"ERROR", data:"INVALID_EMPLOYEE"})

    //check if the employee has a salary for the provided salary_month
    let checkExistingSalary = await databaseOperations.hasSalaryOnDate(employeeID, month, year)
    if(checkExistingSalary) return ({status:"FAIL", data:"SALARY_EXISTS"})
    //add the salary
    return await databaseOperations.addSalary(employeeID, month, data.salary_year, bank_ref, taxes)
}

/**
 * Retrieves the salaries of an employee
 * @param {object} filterObject Object that filters data 
 */
 async function getSalaries(filterObject){
    if(filterObject.filter==="interval") filterObject.filterBy=translateInterval(filterObject.filterBy)
    return await databaseOperations.getSalaries(filterObject)
}

//adds vacation days
async function addVacationDays(object){
    //check that the employee is there
    if(object.employeeID===null) return({status:"ERROR", data:"INVALID_EMPLOYEE"})    
    return await databaseOperations.addVacationDays(object.employeeID, object.dates)
}

//retrieves vacation days
async function getVacationDays(employee){
    return databaseOperations.getVacationDays(employee)
}

/**
 * Gets info associated with a employee
 * @param {int} employeeID ID of the employee
 * @returns {Promise<{status:string, data:{salaries:array, vacationDays:array}}>} Object containing the status of the OP, salaries and vacation days
 */

async function getEmployeeOverview(employeeID){
    let result = await Promise.all([databaseOperations.getEmployeeInfo(employeeID), databaseOperations.getSalaries({filter:"paid_to", filterBy:employeeID, page:1}), databaseOperations.getVacationDays(employeeID)])
    if(result[0].status==="OK" && result[1].status==="OK" && result[2].status==="OK"){
        return({status:"OK", data:{info:result[0].data, salaries:result[1].data, vacationDays:result[2].data}})
    }else{
        return({status:"FAIL", data:null})
    }
}

async function exportData(filterObject){
    return await databaseOperations.exportData()
}

async function dashboardData(){

    if( databaseOperations.checkForDatabases() === false ) return ({status:"NO_DATABASE", data: null})

    let response = {status:{finalised: 0, draft: 0}, lastInvoice:{client_last_name:"", client_first_name: "", date:"", total:0}, total_income: 0, total_invoices: 0}
    let invoiceData = await databaseOperations.getDashboardData()

    if(invoiceData.length===0) return ({status:"NO_DATA", data: null})

    let highestSum = {income: 0, date: null, id:null}

    invoiceData.forEach(element => {
        if(element.invoice_status==="draft") response.status.draft = response.status.draft + 1
        if(element.invoice_status==="finalised"){
            response.status.finalised = response.status.finalised + 1
            response.total_income = response.total_income + parseFloat(element.invoice_total_sum)
            if(parseFloat(element.invoice_total_sum)>highestSum.income) highestSum={client_first_name: element.client_first_name, client_last_name: element.client_last_name ,income: parseFloat(element.invoice_total_sum), date: element.invoice_date, id: element.invoice_number}
        }
        response.total_invoices = response.total_invoices+1        
    });
    response.lastInvoice.client_first_name = invoiceData[0].client_first_name
    response.lastInvoice.client_last_name = invoiceData[0].client_last_name
    response.lastInvoice.date = invoiceData[0].invoice_date
    response.lastInvoice.total = invoiceData[0].invoice_total_sum
    response.highestInvoice = highestSum

    return {status:"OK", data:response}
}

async function pingDB(){
    return await databaseOperations.pingDB()
}

async function getRecentLogs(){
    return await databaseOperations.getLatestLogs()
}

async function getHistory(target){
    let targetTerms = target.indexOf("+")>0 ? target.split("+") : target
    return databaseOperations.getHistory(targetTerms)
}

async function getBilledProducts(orderobject){
    let data = await databaseOperations.fetchBilledProducts(orderobject)
    if(data.status!=="OK") return ({status:data.status, data:null})
    let limits = []
    let limitIndex=1
    data.data.forEach((element, index)=>{
        if(index!==data.data.length-1){
            if(element.product_name.toLowerCase()===data.data[index+1].product_name.toLowerCase()){
                limitIndex = limitIndex + 1
            }else{
                limits.push(limitIndex)
                limitIndex=1;
            }
        }else{
            if(limitIndex>1){
                limits.push(limitIndex)
            }else{
                limits.push(1)
            }
        }
    })
    return ({status:"OK", data: data.data, limits})
}

async function updateVacationStatus(id, newStatus){
    if(!id || !newStatus) return ({status: "INVALID_DATA", data: null}) 
    return await databaseOperations.changeVacationStatus(id, newStatus)
}

async function daleteVacationDay(id){
    if(!id) return ({status: "INVALID_DATA", data: null}) 
    return await databaseOperations.deleteVacationDay(id)
}

async function deleteSalary(id){
    if(!id) return ({status: "INVALID_DATA", data: null}) 
    return await databaseOperations.deleteSalary(id)
}

async function getSalary(id){
    let salary = await databaseOperations.getSalary(id)
    if(salary===null) return ({status:"FAIL", data: null})
    console.log(salary)
    return({status: "OK", data:{
        sum_gross: salary.sum_gross,
        sum_net: salary.sum_net,
        tax_cas: salary.tax_cas,
        tax_cass: salary.tax_cass,
        tax_income: salary.tax_income,
        tax_cm: salary.tax_cm
    }})
}

async function changeDBsettings(host, user, pass){
    if(!host && !user && !pass){
        return({status:"ERROR", data:"INVALID_DATA"})
    }
    return await databaseOperations.changeDBsettings(host, user, pass)
}

async function changeTableProperties(alias, name){
    if(!alias || !name){
        return({status:"ERROR", data:"INVALID_DATA"})
    }
    return await databaseOperations.changeTableProperties(alias, name)
}

async function addDatabase(alias, name){
    if(!alias || !name){
        return({status:"ERROR", data:"INVALID_DATA"})
    }
    return await databaseOperations.addDatabase(alias, name)
}

async function deleteDatabase(databaseName){
    return await databaseOperations.deleteDatabase(databaseName)
}

module.exports={ 
    fetchClients:fetchClients,
    addInvoice:addInvoice,
    fetchInvoices:fetchInvoices,
    archiveClient: archiveClient,
    archiveInvoice: archiveInvoice,
    fetchInvoiceData: fetchInvoiceData,
    handleClientData: handleClientData,
    getFinancials: getFinancials,
    updateInvoice:updateInvoice,
    getPredefinedProducts:getPredefinedProducts,
    handleProduct:handleProduct,
    removeProduct:removeProduct,
    getDatabaseInfo:getDatabaseInfo,
    changeDatabase,
    updateClientData:updateClientData,
    getExpenses:getExpenses,
    addExpense:addExpense,
    deleteExpense,
    getEmployees, addEmployee, editEmployee, addSalary, getSalaries, addVacationDays, getVacationDays, getEmployeeOverview, archiveEmployee, deletePredefinedProduct, 
    exportData, dashboardData,
    pingDB, getRecentLogs,
    getHistory, getBilledProducts, updateVacationStatus, daleteVacationDay, deleteSalary, getSalary, changeDBsettings, changeTableProperties, addDatabase, deleteDatabase
}