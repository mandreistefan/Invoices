const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')

//retrieve all clients
app.get("/clients",(req,res)=>{
    let filterObject = {}
    if(req.query.filter) filterObject.filter=req.query.filter;
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy;
    if(req.query.page) filterObject.page=req.query.page;
    databaseController.fetchClients(filterObject).then(data=>{
        res.send(data)
    })    
})

//create a new client
app.post("/clients",(req,res)=>{
    databaseController.handleClientData(req.body,(callback)=>{
        if(callback.status==="OK"){
            res.send(callback)
        }else{
            res.send({status:"ERROR"})
        }
    })
})

//update client
app.put("/clients", (req,res)=>{
    databaseController.updateClientData(req.body,(callback)=>{
        if(callback.status==="OK"){
            res.send(callback)
        }else{
            res.send({status:"ERROR"})
        }
    })
})

//archive a client
app.delete("/clients", (req, res)=>{
    console.log(req.body.clientID)
    databaseController.archiveClient(req.body.clientID, (callback)=>{
        res.send({status:callback.status})
    })
})

module.exports = app