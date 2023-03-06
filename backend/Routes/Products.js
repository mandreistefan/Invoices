const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')
const databaseOperations = require('../controllers/databaseOperations.js')

let filterObject={filter:"all", filterBy:"", page:1}

//products
app.get('/products', (req, res)=>{
    if(req.query.filter) filterObject.filter=req.query.filter
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy
    if(req.query.page) filterObject.page=req.query.page
    databaseController.getPredefinedProducts(filterObject).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    })
    .catch(error=>{
        res.send({
            status:"ERROR",
            data:null
        })
        console.log("ERROR")
    })
})

app.get('/products/:productID', (req, res)=>{
    databaseOperations.getProductInfo(req.params.productID).then(data=>{
        res.send({
            status:data.status, 
            data:data.data
        })
    }).catch(error=>{
        res.send({
            status:"ERROR", 
            data:null
        })
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
    .catch(error=>{
        res.send({
            status:"ERROR", 
            data:null
        })
        console.log("ERROR")
    })
})

app.delete('/products/:productID',(req, res)=>{
    databaseController.deletePredefinedProduct(req.params.productID).then(data=>{
        res.send({
            status:data.status, 
            data:data.data
        })
    }).catch(error=>{
        res.send({
            status:"ERROR", 
            data:null
        })
        console.log("ERROR")
    })
})

module.exports = app