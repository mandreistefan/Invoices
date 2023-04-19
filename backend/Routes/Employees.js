const express = require('express')
let app = express.Router()
let {getEmployees, addEmployee, editEmployee, addSalary, getSalaries, addVacationDays, 
    getVacationDays, getEmployeeOverview, archiveEmployee, updateVacationStatus, 
    daleteVacationDay, deleteSalary, getSalary} = require('../controllers/databaseController.js')

let filterObject={filter:"all", filterBy:"", page:1}

//Get all employees
app.get('/employees',(req,res)=>{
    if(req.query.filter) filterObject.filter=req.query.filter
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy
    if(req.query.page) filterObject.page=req.query.page
    if(req.query.step) filterObject.step=req.query.step
    getEmployees(filterObject).then(data=>{
        res.send({
            status:data.status,
            recordsNumber: data.totalRecordsNumber,
            data:data.data
        })
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error) 
    })
})

//Add new employee
app.post('/employees', (req, res)=>{
    addEmployee(req.body).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null})
        console.log(error) 
    })
})

//Update employee
app.put('/employees', (req, res)=>{
    editEmployee(req.body).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error)
    })       
})

//get employee overview
app.delete("/employee/:employeeID", (req, res)=>{
    archiveEmployee(req.params.employeeID).then(data=>{
        res.send({status:data.status, data: data.data})
    }).catch(error=>{
        res.send({status:"ERROR", data: null})
    })
})

//get employee overview
app.get("/employee/:employeeID", (req, res)=>{
    getEmployeeOverview(req.params.employeeID).then(data=>{
        res.send({status:data.status, data: data.data})
    }).catch(error=>{
        res.send({status:"ERROR", data: null})
    })
})

//register a new salary
app.post("/employee_salary", (req,res)=>{
    addSalary(req.body).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error)
    })     
})

//get salaries
app.get('/employee_salaries', (req, res)=>{
    if(req.query.filter) filterObject.filter=req.query.filter
    if(req.query.filterBy) filterObject.filterBy=req.query.filterBy
    if(req.query.page) filterObject.page=req.query.page
    getSalaries(filterObject).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error)
    })   
})

//register a new vacation day
app.post('/employee_vacation', (req, res)=>{
    addVacationDays(req.body).then(data=>{
        console.log(data)
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        //the Promise that checks if any dates already exist has fired up
        if(error==="ERROR"){
            res.send({status:"FAIL", data:"Something went wrong"}) 
        }else if(error==="INVALID_DATE"){
            res.send({status:"INVALID_DATE", data:"One or more dates are invalid!"}) 
        }else{
            res.send({status:"SERVER_ERROR", data:null}) 
        }        
    })
})

//update a vacation day 
app.put('/employee_vacation_status', (req, res)=>{
    updateVacationStatus(req.body.id, req.body.status).then(data=>{
        res.send(data)
    }).catch(error=>{
        res.send({status: "SERVER_ERROR", data:null}) 
    })
})

//delete vacation day
app.delete('/employee_vacation/:id', (req, res)=>{
    daleteVacationDay(req.params.id).then(data=>{
        res.send(data)
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error) 
    })
})

app.get('/employee_salary/:id', (req, res)=>{
    getSalary(req.params.id).then(data=>{
        console.log(data)
        res.send(data)
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error)   
    })
})

//delete salary
app.delete('/employee_salary/:id', (req, res)=>{
    deleteSalary(req.params.id).then(data=>{
        res.send(data)
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error) 
    })
})

//get a vacation day
app.get('/employee_vacation/:id', (req, res)=>{
    getVacationDays(req.params.id).then(data=>{
        res.send({
            status:data.status,
            data:data.data
        })
    }).catch(error=>{
        res.send({status:"SERVER_ERROR", data:null}) 
        console.log(error)
    })
})

module.exports=app