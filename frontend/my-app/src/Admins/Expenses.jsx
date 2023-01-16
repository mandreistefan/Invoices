import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import ExpenseForm from './ExpenseForm.jsx'
import SmallMenu from '../SmallMenu/SmallMenu.jsx'

let Expenses=()=>{

    let [alertUser, setAlertUser] = React.useState({text: null})
    let [expenses, setExpenses] = React.useState([])
    let [addexpensesWindow, setaddexpensesWindow] = React.useState(false)
    //time interval 
    let currentDate = new Date()
    let [dateInterval, setInterval] = React.useState({
        start: `${currentDate.getFullYear()}-01-01`,
        end: `${currentDate.getFullYear()}-12-31`
    })

    React.useEffect(()=>{
        fetchData()
    },[])

    let fetchData=()=>{

        let startDateArray = dateInterval.start.split("-")
        let endDateArray = dateInterval.end.split("-")
        let filterBy=`${startDateArray[2]}${startDateArray[1]}${startDateArray[0].substring(2,4)}-${endDateArray[2]}${endDateArray[1]}${endDateArray[0].substring(2,4)}`

        fetch(`http://localhost:3000/expenses?filter=interval&filterBy=${filterBy}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setExpenses(data.data)
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text: "Baza de date nu poate fi accesata"}) 
            }else{
                setAlertUser({text: "Eroare"}) 
            }
        }).catch(error=>{
            setAlertUser({text: "Eroare"}) 
        })
    }

    //deletes a expense
    let deleteExpense=(id)=>{
        fetch("http://localhost:3000/expenses",
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id:id})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setAlertUser({text: "Cheltuiala stearsa"})
                fetchData()
            }else if(data.status==="SERVER_ERROR"){
                setAlertUser({text: "Baza de date nu poate fi accesata"}) 
            }else{
                setAlertUser({text: "Eroare"})
            }
        })
    }

    //the date should be readable
    let prettyDate=(date)=>{
        let dateArray=date.toString().substr(0,10).split("-")
        return(`${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`)
    }

    //handles the date inputs
    let someFunction=(event)=>{
        event.target.name==="trip-start" ? setInterval({...dateInterval, start:event.target.value}) : setInterval({...dateInterval, end:event.target.value})
        fetchData()
    }

    return(
        <div className="expenses-container">
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width:'70%', display:'inherit', alignItems:'center'}} className="p-3"><h5>Cheltuieli</h5></div>
                <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0 p-3" style={{width:'30%'}}>                                
                    <button className="btn btn-primary btn-sm no-shadow navigation-button" onClick={()=>{setaddexpensesWindow(true)}}><div class="inner-button-content"><span class="material-icons-outlined">add</span>Adauga</div></button>                                                                                             
                </div>
            </div> 
            {addexpensesWindow&&
                <div>
                    <div className="blur-overlap"></div>     
                    <button type="button" className="action-close-window" onClick={()=>{setaddexpensesWindow(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                    <div className="overlapping-component-inner">
                        <ExpenseForm reFetch={fetchData}/>
                    </div>
                </div>
            }
            {expenses&&       
                <div style={{padding:'10px'}}>
                    <h6>Cheltuieli inregistrate</h6> 
                    <div className="alert alert-secondary interval-setter">
                        <div className="row">
                            <div style={{display:'flex', alignItems:'center'}}>
                                <span title="Interval" style={{marginRight:'5px'}} className="material-icons-outlined">date_range</span>
                                <input type="date" id="start" name="trip-start" value={dateInterval.start} onChange={someFunction}></input>
                                <input type="date" id="end" name="trip-end" value={dateInterval.end} onChange={someFunction}></input>
                            </div>
                        </div>
                    </div>
                    {expenses.length>0 ?                         
                        <table className='table table-hover app-data-table'>
                            <thead className='table-active'>
                                <tr className='app-data-table-row'>
                                    <th className="col-1"></th>
                                    <th className="col-3">NUME</th>
                                    <th className="col-1">SUMA</th>
                                    <th className="col-4">DESCRIERE</th>
                                    <th className="col-2"></th>
                                    <th className="col-1"></th>
                                    <th></th>
                                </tr>    
                            </thead>               
                            <tbody className='clients-table-body app-data-table-body'>
                                {
                                    expenses.map((element, index)=>(
                                        <tr key={index} className='clients-table-row app-data-table-row'>
                                            <td className="centered-text-in-td">{index+1}</td>
                                            <td>{element.exp_name}</td>
                                            <td>{element.exp_sum}</td>
                                            <td>{element.exp_description}</td>
                                            <td>{prettyDate(element.exp_date)}</td>
                                            <td>{element.exp_deduct ? <span title="Deductibil" className="material-icons-outlined">check_circle</span> : <span title="Non-deductibil" className="material-icons-outlined">cancel</span>}</td>
                                            <td>  
                                                <div className='actions-container'>                                    
                                                    <SmallMenu items={[
                                                        {name:"Delete", icon:"delete", disabled:false, clickAction:()=>{deleteExpense(element.id)}}
                                                    ]}/>
                                                </div>  
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                        :"Nu exista cheltuieli inregistrate"                        
                    }
                </div>           
            }
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>  
        </div>
    )

}

export default Expenses