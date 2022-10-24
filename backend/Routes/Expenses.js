const express = require('express')
let app = express.Router()
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')

//retrieve all clients
app.get("/expenses",(req,res)=>{
    let reqObject={}
    if(req.query.filter) reqObject.filter=req.query.filter
    if(req.query.page) reqObject.page=req.query.page
    if(req.query.filterBy) reqObject.filterBy=req.query.filterBy
    databaseController.getExpenses(reqObject).then(data=>{
        res.send({status:"OK", data:data.data})
    })
})

//create a new client
app.post("/expenses",(req,res)=>{
    databaseController.addExpense(req.body).then(data=>{
        if(data.status==="OK"){
            res.send({status:"OK", data:data})
        }else{
            res.send({status:"ERROR", data:null})
        }
    })
})

//update client
app.put("/expenses", (req,res)=>{

})

//archive a client
app.delete("/expenses", (req, res)=>{
    console.log(req.body)
    databaseController.deleteExpense(req.body.id).then(data=>{
        res.send({status:data, data:null})
    })
})

module.exports = app