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
const expensesHandler = require('./Routes/Expenses.js')
const employeesHandler = require('./Routes/Employees.js')
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
app.use('/', expensesHandler)
app.use('/', employeesHandler)


cron.schedule('* 00 13 * *', () => {
    console.log('Runnig scheduled task');
});

//recurrentController.handleRecurrencies()

//search - not implemented
app.get("/search",(req,res)=>{
    let queryFilter = {}
    if(req.query.filter) queryFilter.filter=req.query.filter
    if(req.query.filterBy) queryFilter.filterBy=req.query.filterBy
    databaseController.performSearch(queryFilter).then(data=>{
        res.send(data)
    }).catch(error=>{
        console.log(error)
        console.log("ups")
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
    databaseController.createExportableData().then(data=>{
        console.log(data)
        res.send({
            status:"OK",
            data: {success:data[0], attempts:data[1]}
        })
    })
})

//get some info on the DB
app.get("/database", (req, res)=>{
    let data = databaseController.getDatabaseInfo()
    res.send({
        status:"OK",
        data:data
    })
})

//exports a DB in a CSV file format
app.get("/switchDatabase", (req, res)=>{
    databaseController.changeDatabaseInfo(callback=>{
        res.send(callback)
    })
    
})


app.listen(3001)