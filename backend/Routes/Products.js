const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')

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

module.exports = app