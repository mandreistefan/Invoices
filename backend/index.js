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
const os = require('os')
const fs = require('fs')
const { EventEmitter } =require('events');
const event = new EventEmitter();
let PORT = '3001'
const inElectron = true

if(inElectron){
    PORT='3000'
    const { app, BrowserWindow } = require('electron');

    const createWindow = () => {
        // Create the browser window.
        const mainWindow = new BrowserWindow({
            width: 1800,
            height: 1600,
            webPreferences: {
                nodeIntegration: true
            }
        });

        mainWindow.webContents.setUserAgent("ElectronApp");
        // and load the index.html of the app.
        mainWindow.loadFile(path.join(__dirname, './front_end/Aplicatie.html'));

        //listen for the print PDF event
        event.on('printPDF', ()=>{
            console.log("Printing PDF")
            // Use default printing options
            const pdfPath = path.join(os.homedir(), 'Desktop', 'temp.pdf')
            //the page we want printet has just been opened
            BrowserWindow.getFocusedWindow().webContents.printToPDF({printBackground:true}).then(data => {
                fs.writeFile(pdfPath, data, (error) => {
                    if (error){
                        console.log(error)
                        event.emit('printPDFstatus', "ERROR")
                    }
                    console.log("PDF generated")
                    event.emit('printPDFstatus', "OK")
                })
            }).catch(error => {
                console.log("PDF could not be generated")
                event.emit('printPDFstatus', "ERROR")
            })
        })

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
myApp.use('/app', express.static(path.join(__dirname, 'front_end')))


cron.schedule('* 00 13 * *', () => {
    console.log('Runnig scheduled task');
});

//recurrentController.handleRecurrencies()

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


//exports the DB in a CSV file format
myApp.get("/export", (req, res)=>{
    databaseController.createExportableData().then(data=>{
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

//get a list of databases
myApp.get("/databases", (req, res)=>{
    let data = databaseController.getDatabases()
    res.send({
        status:"OK",
        data:data
    })
})

//switches between databases
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

//emit event to print the opened page
myApp.get("/generatePDF", (req, res)=>{
    event.emit('printPDF')  
    //the status of the printing operation 
    event.once('printPDFstatus', status => {
        res.send({
            status:status,
            data:null
        })
    });
})

//emit event to print the opened page
myApp.get("/dashboardData", (req, res)=>{
    databaseController.dashboardData().then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })    
    }).catch(error=>{
        console.log(error)
        res.send({
            status:"ERROR",
            data:null
        })
    })
})

//emit event to print the opened page
myApp.get("/pingDatabase", (req, res)=>{
    databaseController.pingDB().then(data=>{
        res.send({response:data})    
    }).catch(error=>{
        console.log(error)
        res.send({response:false})
    })
})

//emit event to print the opened page
myApp.get("/latestLogs", (req, res)=>{
    databaseController.getRecentLogs().then(data=>{
        res.send(data)    
    }).catch(error=>{
        console.log(error)
        res.send({response:false})
    })
})

myApp.get("/history", (req, res)=>{
    let target = req.query.target
    if(!target){
        res.send({
            status:"INVALID_REQUEST",
            data:null
        })
    }
    databaseController.getHistory(target).then(data=>{
        res.send(data)
    }).catch(error=>{

    })
})

myApp.get("/app/*", (req, res)=>{
    res.sendFile(path.join(__dirname, './front_end/Aplicatie.html'));
})


myApp.listen(PORT)