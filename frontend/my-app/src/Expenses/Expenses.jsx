import React from "react";
import Snackbar from '../Snackbar/Snackbar.jsx'
import ExpenseForm from './ExpenseForm.jsx'
import SmallMenu from '../SmallMenu/SmallMenu.jsx'

let Expenses=()=>{

    let [alertUser, setAlertUser] = React.useState({text: null})
    let noReRenders = 0
    let [expenses, setExpenses] = React.useState([])
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
        let endDayArray = dateInterval.end.split("-")
        let filterBy=`${startDateArray[2]}${startDateArray[1]}${startDateArray[0].substring(2,4)}-${endDayArray[2]}${endDayArray[1]}${endDayArray[0].substring(2,4)}`

        fetch(`./expenses?filter=interval&filterBy=${filterBy}`).then(response=>response.json()).then(data=>{
            setExpenses(data.data)
        })
    }

    //deletes a expense
    let deleteExpense=(id)=>{
        fetch("/expenses",
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
            }
            else{
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
    }

    return(
        <div>
            <div className="app-title-container"><h4>Cheltuieli</h4></div><hr/>

            <ExpenseForm reFetch={fetchData}/>
            {expenses&&       
                <div className="app-data-container" style={{maxWidth:"1000px", marginLeft:"auto", marginRight:"auto"}}> 
                    <div className="alert alert-secondary interval-setter">
                        <div className="row">
                            <div>
                                <input type="date" id="start" name="trip-start" value={dateInterval.start} onChange={someFunction}></input>
                                <input type="date" id="end" name="trip-end" value={dateInterval.end} onChange={someFunction}></input>
                                <button style={{height:'26px', fontSize:'14px', border:'none', borderRadius:'6px'}} onClick={()=>{fetchData()}}><span className="action-button-label">Apply</span></button>
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
                                    <th className="col-2">DATA</th>
                                    <th className="col-1">DEDUCT</th>
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
                                            <td>{element.exp_deduct ? <span className="material-icons-outlined">check_circle</span> : <span className="material-icons-outlined">cancel</span>}</td>
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