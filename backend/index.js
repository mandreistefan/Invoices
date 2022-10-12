const express = require('express')
const app = express();
const path=require('path');
const databaseController = require('./controllers/databaseController.js')
const bodyparser=require('body-parser')
const urlmod=require('url')
const cron = require('node-cron');
const recurrentController = require('./controllers/recurrentController')
const clientsHandler = require('./Routes/Clients.js')
const invoicesHandler = require('./Routes/Invoices.js')
const productsHandler = require('./Routes/Products.js')
const financialsHandler = require('./Routes/Financials.js')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Routes/swagger.json');

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static(path.join(__dirname, '..', 'frontend', 'my-app', 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', clientsHandler)
app.use('/', invoicesHandler)
app.use('/', productsHandler)
app.use('/', financialsHandler)

cron.schedule('* 00 13 * *', () => {
    console.log('Runnig scheduled task');
});

//recurrentController.handleRecurrencies()

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