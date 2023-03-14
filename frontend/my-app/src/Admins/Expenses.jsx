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

    let expenseTypeIcon=(type)=>{
        switch(type){
            case "tools":
                return <span class="material-icons-outlined" title="Unelte">construction</span>
            case "administrative":
                return <span class="material-icons-outlined" title="Administrative">description</span>
            case "transport":
                return <span class="material-icons-outlined" title="Transport">directions_car</span>
            default:
                return <span class="material-icons-outlined" title="Nu exista">info</span>
        }
    }

    return(
        <div className="app-data-container">
            <div style={{overflowY:'scroll', maxHeight:'80vh'}} className="bordered-container">     
                <div style={{padding:'10px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h5 style={{margin:'0'}}>Cheltuieli</h5>
                        <div style={{display:'flex', justifyContent:"flex-start"}}>
                            <div style={{display:'flex', alignItems:'center', width:'fit-content', borderRadius:'6px', padding:'3px', marginRight:'5px'}}>
                                <span title="Interval" style={{marginRight:'5px'}} className="material-icons-outlined">date_range</span>
                                <input type="date" className="form-control shadow-none" style={{width:'fit-content'}} id="start" name="trip-start" value={dateInterval.start} onChange={someFunction}></input>
                                <input type="date" className="form-control shadow-none" style={{width:'fit-content', margin:'0'}} id="end" name="trip-end" value={dateInterval.end} onChange={someFunction}></input>
                            </div>
                            <button class="btn btn-light" type="button" title="Adauga" onClick={()=>{setaddexpensesWindow(true)}}><div class="inner-button-content"><span class="material-icons-outlined">add</span>Adauga</div></button>
                        </div>
                    </div>   
                    <br></br>                     
                    <div>                       
                        <table className='table'>
                            <thead>      
                                <tr>
                                    <td>#</td>
                                    <td>Nume</td>
                                    <td>Suma</td>
                                    <td>Descriere</td>
                                    <td>Tip</td>
                                    <td>Data</td>
                                    <td>Deductibil</td>
                                    <td></td>
                                </tr> 
                            </thead>               
                            <tbody className='clients-table-body app-data-table-body'>
                                {expenses.length>0 &&
                                    expenses.map((element, index)=>(
                                        <tr key={index} className='clients-table-row app-data-table-row'>
                                            <td>{index+1}</td>
                                            <td>{element.exp_name}</td>
                                            <td>{element.exp_sum}</td>
                                            <td>{element.exp_description}</td>
                                            <td>{expenseTypeIcon(element.exp_type)}</td>
                                            <td>{prettyDate(element.exp_date)}</td>
                                            <td>{element.exp_deduct ? <span title="Deductibil" className="material-icons-outlined">check_circle</span> : <span title="Non-deductibil" className="material-icons-outlined">cancel</span>}</td>
                                            <td className="table-actions-container">
                                                <button title="Sterge" onClick={()=>{deleteExpense(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
                                            </td>   
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table> 
                    </div>                  
                </div>
                {addexpensesWindow&&
                    <div>
                        <div className="blur-overlap"></div>     
                            <div className="overlapping-component-inner">
                            <div className='overlapping-component-header'>
                                <span>Inregistrare cheltuiala</span>
                                <button type="button" className="action-close-window" onClick={()=>{setaddexpensesWindow(false)}}><span className="material-icons-outlined">close</span></button>
                            </div>
                            <ExpenseForm reFetch={fetchData}/>
                        </div>
                    </div>
                }
            </div>
            <Snackbar text={alertUser.text} closeSnack={()=>{setAlertUser({text:null})}}/>  
        </div>
    )

}

export default Expenses