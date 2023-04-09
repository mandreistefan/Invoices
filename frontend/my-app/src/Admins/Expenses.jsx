import { useEffect, useState } from 'react';
import ExpenseForm from './ExpenseForm.jsx'
import Header from "../Header.jsx";
import { useOutletContext } from "react-router-dom";

let Expenses=()=>{

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    let [expenses, setExpenses] = useState(null)
    let [addexpensesWindow, setaddexpensesWindow] = useState(false)
    //time interval 
    let currentDate = new Date()
    let [dateInterval, setInterval] = useState({
        start: `${currentDate.getFullYear()}-01-01`,
        end: `${currentDate.getFullYear()}-12-31`
    })

    useEffect(()=>{
        fetchData()
    },[dateInterval])

    let fetchData=()=>{

        let startDateArray = dateInterval.start.split("-")
        let endDateArray = dateInterval.end.split("-")
        let filterBy=`${startDateArray[2]}${startDateArray[1]}${startDateArray[0].substring(2,4)}-${endDateArray[2]}${endDateArray[1]}${endDateArray[0].substring(2,4)}`

        fetch(`http://localhost:${port}/expenses?filter=interval&filterBy=${filterBy}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                setExpenses(data.data)
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text: "Baza de date nu poate fi accesata"}) 
            }else{
                addSnackbar({icon:"report_problem", text: "Eroare"}) 
            }
        }).catch(error=>{
            addSnackbar({icon:"report_problem", text: "Eroare"}) 
        })
    }

    //deletes a expense
    let deleteExpense=(id)=>{

        if(window.confirm("Stergeti cheltuiala?") === false) return false

        fetch(`http://localhost:${port}/expenses`,
        {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id:id})
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: "Cheltuiala stearsa"})
                fetchData()
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text: "Baza de date nu poate fi accesata"}) 
            }else{
                addSnackbar({icon:"report_problem", text: "Eroare"})
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

    let intervalFunction=(interval, appliesTo)=>{  
        setInterval({start: interval.start, end: interval.end})
    }

    return(
        <div className="app-data-container">
            <div style={{maxHeight:'80vh'}} className="bordered-container">     
                <div>
                    <Header title="Cheltuieli" intervalFunction={intervalFunction} intervalSelections={["Data"]} icon="account_circle" refreshData={fetchData} buttons={[{title:"Adauga", action:()=>{setaddexpensesWindow(true)}, icon:"add", name:"Adauga"}]}/>                             
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
                                {expenses &&
                                    expenses.map((element, index)=>(
                                        <tr key={index} className='clients-table-row app-data-table-row'>
                                            <td>{index+1}</td>
                                            <td>{element.exp_name}</td>
                                            <td>{element.exp_sum}</td>
                                            <td>{element.exp_description}</td>
                                            <td>{expenseTypeIcon(element.exp_type)}</td>
                                            <td>{element.exp_date}</td>
                                            <td>{element.exp_deduct ? <span title="Deductibil" className="material-icons-outlined">check_circle</span> : <span title="Non-deductibil" className="material-icons-outlined">cancel</span>}</td>
                                            <td className="table-actions-container">
                                                <button title="Sterge" onClick={()=>{deleteExpense(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
                                            </td>   
                                        </tr>
                                    ))
                                }
                            </tbody>
                            {expenses===null && context.loadingSpinner}  
                            {expenses===[] && <h6>Nu exista date</h6>}  
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
                            <ExpenseForm reFetch={fetchData} addSnackbar={addSnackbar}/>
                        </div>
                    </div>
                }
            </div>
        </div>
    )

}

export default Expenses