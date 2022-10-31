const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')
const path=require('path');
let filterObject = {}

//serves a HTML file to the front-end; the HTML files acts as a template for the invoice; used to print
app.get("/generateInvoice/*",(req,res)=>{
    res.sendFile(path.join(__dirname,'../../frontend/my-app/public/InvoiceTemplate.html'))
})

//get the data of a single invoice
app.get("/invoice",(req,res)=>{    
    if(req.query.filter) filterObject.filter=req.query.filter;
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy;
    if(req.query.page) filterObject.page=req.query.page;
    filterObject.target="invoices"
    databaseController.fetchInvoiceData(filterObject).then(response=>{
       res.send({status:"OK", data:response})
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error)
    })
})

//retrieve all invoices
app.get('/invoices',(req,res)=>{
    if(req.query.filter) filterObject.filter=req.query.filter;
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy;
    if(req.query.page) filterObject.page=req.query.page;
    filterObject.target="invoices"
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
    }).catch(error=>{
        console.log(error)
        res.send({
            status:"SERVER_ERROR",
            data:null
        })
    })
})

//creates an invoice
app.post("/invoices", (req,res)=>{
    databaseController.addInvoice(req.body, (callback)=>{
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
    .catch(error=>{
        console.log(error)
        res.send({
            status:"SERVER_ERROR",
            data:null
        })
    })   
})

module.exports = app