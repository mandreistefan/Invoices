const express = require('express')
let app = express.Router()
const {getFinancials} = require('../controllers/databaseController.js')

//financials
app.get("/financial", (req,res)=>{
    let filterObject={}
    if(req.query.filter) filterObject.filter=req.query.filter
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy
    getFinancials(filterObject).then(data=>{
        res.send({
            status: data.status,
            data:data.data
        })        
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