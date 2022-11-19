const express = require('express')
const myApp = express();
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

const inElectron = false

if(inElectron){
    const { app, BrowserWindow } = require('electron');

    const createWindow = () => {
        // Create the browser window.
        const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
        });

        // and load the index.html of the app.
        mainWindow.loadFile(path.join(__dirname, './front_end_build/Aplicatie.html'));

        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);
}

//swagger
myApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

myApp.use(express.static(path.join(__dirname, '..', 'frontend', 'my-myApp', 'public')))
myApp.use(express.json());
myApp.use(express.urlencoded({ extended: true }));
myApp.use('/', clientsHandler)
myApp.use('/', invoicesHandler)
myApp.use('/', productsHandler)
myApp.use('/', financialsHandler)
myApp.use('/', expensesHandler)
myApp.use('/', employeesHandler)


cron.schedule('* 00 13 * *', () => {
    console.log('Runnig scheduled task');
});

//recurrentController.handleRecurrencies()

//search - not implemented
myApp.get("/search",(req,res)=>{
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
myApp.get('/recurrent/*',(req,res)=>{
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
myApp.get("/export", (req, res)=>{
    databaseController.createExportableData().then(data=>{
        console.log(data)
        res.send({
            status:"OK",
            data: {success:data[0], attempts:data[1]}
        })
    })
})

//get some info on the DB
myApp.get("/database", (req, res)=>{
    let data = databaseController.getDatabaseInfo()
    res.send({
        status:"OK",
        data:data
    })
})

//get databases names
myApp.get("/databases", (req, res)=>{
    let data = databaseController.getDatabases()
    res.send({
        status:"OK",
        data:data
    })
})

//exports a DB in a CSV file format
myApp.post("/switchDatabase", (req, res)=>{
    databaseController.changeDatabase(req.body.database).then(data=>{
        if(data.status==="OK"){
            res.send({
                status:"OK",
                data:null
            })  
        }else{
            res.send({
                status:"FAIL",
                data:null
            }) 
        }     
    }).catch(error=>{
        console.log(error)
        res.send({
            status:"ERROR",
            data:null
        })
    })
    
})


myApp.listen(3001)