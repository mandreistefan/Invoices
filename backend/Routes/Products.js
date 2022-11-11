const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')

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
    .catch(data=>{
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

module.exports = app