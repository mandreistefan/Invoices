const express = require('express')
const app = express();
const path=require('path');
const databaseController = require('./controllers/databaseController.js')
const bodyparser=require('body-parser')
const urlmod=require('url')
const cron = require('node-cron');
const recurrentController = require('./controllers/recurrentController')

app.use(express.static(path.join(__dirname, '..', 'frontend', 'my-app', 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cron.schedule('* 00 13 * *', () => {
    console.log('Runnig scheduled task');

});

//takes a string as parameter; looks for predefined keys, fetches the data from the string and returns an object
//string should be invoices?page=1&filter=something
//target should be optional, is "invoices"
//keys are page and filter, data is 1 and something
function qParser(dataString){
    //the filterObject
    let filterObject={
        target: null,
        page: 1,
        filter:null,
        filterBy:null
    }
    //split it based on the ampersand
    let query_parameters = dataString.substring(dataString.indexOf("?")+1, (dataString.length)).split("&")
    //populate the object
    query_parameters.forEach(element=>{
        if(element.indexOf("page=")>-1) filterObject.page=element.substring(element.indexOf("=")+1, element.length)
        if(element.indexOf("filter=")>-1) filterObject.filter=element.substring(element.indexOf("=")+1, element.length)
        if(element.indexOf("filterBy=")>-1) filterObject.filterBy=element.substring(element.indexOf("=")+1, element.length)
        if(element.indexOf("target=")>-1) filterObject.target=element.substring(element.indexOf("=")+1, element.length)
    })

    return filterObject
}

//recurrentController.handleRecurrencies()

//retrieve all clients
app.get("/clients/*",(req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");    
    let filterObject=qParser(url_path_arr[2])
    databaseController.fetchClients(filterObject).then(data=>{
        res.send(data)
    })    
})

//create a new client
app.post("/clients",(req,res)=>{
    let data=req.body
    databaseController.handleClientData(data,(callback)=>{
        if(callback.status==="OK"){
            res.send({status:"OK"})
        }else{
            res.send({status:"ERROR"})
        }
    })
})

//archive a client
app.delete("/clients", (req, res)=>{
    databaseController.archiveClient(req.body.clientID, (callback)=>{
        res.send({status:callback.status})
    })
})

//search - not implemented
app.get("/search/*",(req,res)=>{
    let queryFilter = null;
    let queryFilterData = null;
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    if(url_path_arr[2].length>0) {
        let requestString = url_path_arr[2].split("=");
        queryFilter = requestString[0];
        queryFilterData = requestString[1];
    }
    databaseController.fetchClients(queryFilter, queryFilterData, (data)=>{
        if(data.status==="OK"){
            res.send(data)
        }else{
            res.send({
                status:"ERROR",
                data:null
            })
        }
    })
})

//retrieve all invoices
app.get('/invoices/*',(req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    //parse the request
    let filterObject=qParser(url_path_arr[2])
    //fetch data
    databaseController.fetchInvoices(filterObject).then(results=>{
        if(results.status==="OK"){
            res.send({
                status:"OK",
                recordsNumber: results.totalRecordsNumber,
                data:results.data
            })
        }else{
            res.send({
                status:"ERROR",
                data:null
            })
        }
    })
})

//creates an invoice
app.post("/invoices", (req,res)=>{
    databaseController.addInvoice(req.body, (callback)=>{
        console.log(callback)
        if(callback===null){
            res.send({
                status: "ERROR",
                invoiceID: null
            })
        }else{
            res.send({
                status: "OK",
                invoiceID: callback.invoiceID
            })
        }
    })
})

//archives an invoice
app.delete("/invoices",(req,res)=>{
    databaseController.archiveInvoice(req.body.invoiceID, (callback)=>{
        res.send({status:callback.status})
    })
})

//updates an invoice
app.put("/invoices",(req, res)=>{
    databaseController.updateInvoice(req.body).then(response=>{
        res.send({status:response})
    })    
})

app.get("/invoiceGenerator/*",(req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    let filterObject=qParser(url_path_arr[2])
    filterObject.target="invoices"
    databaseController.fetchInvoiceData(filterObject).then(response=>{
       res.send({status:"OK", data:response})
    })
})

//recurrency
app.get('/recurrent/*',(req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    databaseController.fetchRecInvData(url_path_arr[2], url_path_arr[3], (callback)=>{
        if(callback.status==="OK"){
            res.send({
                status:"OK",
                data:callback.data
            })
        }else{
            res.send({
                status:"ERROR",
                data:null
            })
        }
    })
})

//financials
app.get("/financial/*", (req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    //should check here that the string is okay
    let filterObject=qParser(url_path_arr[2])
    databaseController.getFinancials(filterObject).then(data=>{
        res.send({
            status: data.status,
            data:data.data
        })        
    })
})

//products
app.get('/products', (req, res)=>{
    databaseController.getPredefinedProducts().then(data=>{
        res.send({
            status:"OK",
            data:data
        })
    })
    .catch(data=>{
        console.log("ERROR")
    })
})

app.put('/products', (req, res)=>{
    databaseController.handleProduct(req.body).then(data=>{
        res.send({
            status:data.status, 
            data:null
        })
    })
    .catch(data=>{
        console.log("ERROR")
    })
})

app.delete('/products/*',(req, res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    databaseController.removeProduct(url_path_arr[2]).then(data=>{
        res.send({
            status:data.status, 
            data:data.data
        })
    })
})

//serves a HTML file to the front-end; the HTML files acts as a template for the invoice; used to print
app.get("/generateInvoice/*",(req,res)=>{
    res.sendFile(path.join(__dirname,'../frontend/my-app/public/test.html'))
})

//exports a DB in a CSV file format
app.get("/export", (req, res)=>{
    databaseController.createExportableData()
})

//get some info on the DB
app.get("/database", (req, res)=>{
    let data = databaseController.getDatabaseInfo()
    res.send(data)
})

//exports a DB in a CSV file format
app.get("/switchDatabase", (req, res)=>{
    databaseController.changeDatabaseInfo(callback=>{
        res.send(callback)
    })
    
})


app.listen(3001)