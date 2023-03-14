const express = require('express')
let app = express.Router()
const {fetchClients, handleClientData, updateClientData, archiveClient} = require('../controllers/databaseController.js')

//retrieve all clients
app.get("/clients",(req,res)=>{
    let filterObject = {}
    if(req.query.filter) filterObject.filter=req.query.filter;
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy;
    if(req.query.page) filterObject.page=req.query.page;
    if(req.query.step) filterObject.step=req.query.step;
    fetchClients(filterObject).then(data=>{
        res.send(data)
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error)
    })    
})

//create a new client
app.post("/clients",(req,res)=>{
    handleClientData(req.body).then(data=>{
        res.send(data)
    })
    .catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error) 
    })
})

//update client
app.put("/clients", (req,res)=>{
    updateClientData(req.body).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        res.send({
            status:"ERROR",
            data:null
        })   
    })
})

//archive a client
app.delete("/clients", (req, res)=>{
    archiveClient(req.body.clientID, (callback)=>{
        res.send({status:callback.status})
    })
})

module.exports = app