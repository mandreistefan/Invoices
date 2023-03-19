const express = require('express')
let app = express.Router()
const {getExpenses, addExpense, deleteExpense} = require('../controllers/databaseController.js')

//retrieve all clients
app.get("/expenses",(req,res)=>{
    let reqObject={}
    if(req.query.filter) reqObject.filter=req.query.filter
    if(req.query.page) reqObject.page=req.query.page
    if(req.query.filterBy) reqObject.filterBy=req.query.filterBy
    getExpenses(reqObject).then(data=>{
        res.send({
            status:"OK",
            data:data.data
        })
    }).catch(error=>{
        console.log(error)
        res.send({
            status:"SERVER_ERROR",
            data:null
        })        
    })
})

//create a new expense
app.post("/expenses",(req,res)=>{
    addExpense(req.body).then(data=>{
        if(data.status==="OK"){
            res.send({status:"OK", data:data})
        }else{
            res.send({status:"ERROR", data:null})
        }
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error)
    })
})

//update expense
app.put("/expenses", (req,res)=>{
    //NA
})

//delete expense
app.delete("/expenses", (req, res)=>{
    deleteExpense(req.body.id).then(data=>{
        res.send({status:data, data:null})
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error)
    })
})

module.exports = app