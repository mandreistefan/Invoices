const express = require('express')
let app = express.Router()
const urlmod=require('url')
const util = require('../utils/util.js')
const databaseController = require('../controllers/databaseController.js')

//retrieve all clients
app.get("/clients/*",(req,res)=>{
    let url_path_arr = urlmod.parse(req.url, true).path.split("/");    
    let filterObject=util.qParser(url_path_arr[2])
    databaseController.fetchClients(filterObject).then(data=>{
        res.send(data)
    })    
})

//create a new client
app.post("/clients",(req,res)=>{
    let data=req.body
    databaseController.handleClientData(data,(callback)=>{
        if(callback.status==="OK"){
            res.send(callback)
        }else{
            res.send({status:"ERROR"})
        }
    })
})

//archive a client
app.delete("/clients", (req, res)=>{
    databaseController.archiveClient(req.body.clientID, (callback)=>{
        res.send({status:callback.status})
    })
})

module.exports = app