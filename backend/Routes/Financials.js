const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')
const path=require('path');

//financials
app.get("/financial/*", (req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");
    //should check here that the string is okay
    let filterObject=util.qParser(url_path_arr[2])
    databaseController.getFinancials(filterObject).then(data=>{
        res.send({
            status: data.status,
            data:data.data
        })        
    })
})

module.exports = app