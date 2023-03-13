import {useState, useEffect} from 'react';
import './FinancialComponent.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import FinancialChart from './FinancialChart.jsx'
import PieChart from './PieChart.jsx'

let Financial = (props) =>{

    let [financialData, setFinancialData] = useState(null)
    let [alertUser, setUserAlert] =useState({text: null})
    //use for the horizontal scale of the chart
    let [chartTitle, setChartTile] = useState("Current year")
    let [chartData, setChartData] = useState([{month:8, year:2022, total:0}, {month:9, year:2022, total:0}])
    let [pieChartData, setPieChartData] = useState([{label:"Salarii", value:"60"}, {label:"Cheltuieli", value:"20"}, {label:"Profit", value:"20"}])
    let currentDate = new Date()
    let [dateInterval, setInterval] = useState({
        start: `${currentDate.getFullYear()}-01-01`,
        end: `${currentDate.getFullYear()}-12-31`
    }) 
    
    let [taxes, setTaxes]= useState({profitTaxPercentage: 1, profitTax: 0, profit: 0})

    useEffect(()=>{
        fetchData()
    }, [dateInterval])

    let fetchData=()=>{
        
        let startDateArray = dateInterval.start.split("-")
        let endDayArray = dateInterval.end.split("-")
        let filterBy=`${startDateArray[2]}${startDateArray[1]}${startDateArray[0].substring(2,4)}-${endDayArray[2]}${endDayArray[1]}${endDayArray[0].substring(2,4)}`

        let querry = `http://localhost:3000/financial?filter=interval&filterBy=${filterBy}`
        fetch(querry).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                //periodicalData has a different use
                setChartData(data.data.periodicalData)
                delete data.data.periodicalData
                //piechartData
                let pieChartShallow = pieChartData
                pieChartData[0].value = data.data.salariesPercentIncome
                pieChartData[1].value = data.data.expensesPercentIncome
                pieChartData[2].value = data.data.profitPercentIncome
                setPieChartData(pieChartShallow)
                delete data.data.salariesPercentIncome
                delete data.data.expensesPercentIncome
                delete data.data.profitPercentIncome
                //contains totals and statistics
                setFinancialData(data.data)
                //contains data for plotting a chart
                setChartTile(`${dateInterval.start} - ${dateInterval.end}`)
                //calcualtes taxes
                setTaxes({...taxes, profitTax: parseFloat(((data.data.total-data.data.total_exp-data.data.salaries)/100)*taxes.profitTaxPercentage).toFixed(2), profit:parseFloat(data.data.total-taxes.profitTax)})
            }else if(data.status==="NO_DATA"){
                setUserAlert({text: "Nu exista date"})
            }else if(data.status==="SERVER_ERROR"){
                setUserAlert({text: "Baza de date nu poate fi accesata"})    
            }else{
                setUserAlert({text: "Baza de date nu poate fi accesata"})
            }
        })
    }

    let someFunction=(event)=>{
        event.target.name==="trip-start" ? setInterval({...dateInterval, start:event.target.value}) : setInterval({...dateInterval, end:event.target.value})
    }

    return( 
        <div className="app-data-container"> 
            <div className="bordered-container p-2" style={{width:'fit-content'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span title="Interval" class="material-icons-outlined" style={{marginRight: '5px'}}>date_range</span>
                    <input type="date" className="form-control shadow-none" style={{width:'fit-content'}} id="start" name="trip-start" value={dateInterval.start} onChange={someFunction}></input>
                    <input type="date" className="form-control shadow-none" style={{width:'fit-content'}} id="end" name="trip-end" value={dateInterval.end} onChange={someFunction}></input>
                </div>             
            </div>
            {financialData ?
            <div className='financial-grid'>
                <div class="grid-container">
                    <div class="card text-center">
                        <div class="card-header">
                            <span style={{color:'gray'}}  className="material-icons-outlined p-1">insights</span>Sume incasate
                        </div>
                        <div class="card-body">
                            <FinancialChart data={chartData} plottedFor={chartTitle}/>
                        </div>
                        <div class="card-footer text-muted">
                            Valori lunare ale facturilor incasate
                        </div>
                    </div>
                    <div class="grid-item">
                        <div class="grid-container">
                            <div class="grid-item">
                                <div class="card text-center">
                                    <div class="card-header">
                                        <span style={{color:'gray'}}  className="material-icons-outlined p-1">donut_small</span>Cheltuieli
                                    </div>
                                    <div class="card-body">
                                        <PieChart data={pieChartData} plottedFor={chartTitle}/>
                                    </div>
                                    <div class="card-footer text-muted">
                                        Impartire cheltuieli, procentual
                                    </div>
                                </div>
                            </div> 
                        </div>
                    </div>
                    <div class="grid-item">
                        <div class="grid-container">
                            <div class="grid-item">
                                <div className='financial-square'>
                                    <span style={{color:'gray'}}  className="material-icons-outlined p-1">payments</span>
                                    <div className="p-1">                                
                                        <span style={{color:'gray', fontWeight:'500'}}>Total incasat</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.total)} RON</span>
                                    </div>                                    
                                </div>        
                            </div>  
                            <div class="grid-item">
                                <div className='financial-square'>
                                    <span style={{color:'gray'}} className="material-icons-outlined">calculate</span>                                    
                                    <div className="p-1"> 
                                        <span style={{color:'gray', fontWeight:'500'}}>Valoare medie lunara</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.avg_per_step).toFixed(2)} RON</span>
                                    </div>                                    
                                </div>
                            </div>
                            <div class="grid-item">
                                <div className='financial-square'>
                                    <span style={{color:'gray'}} className="material-icons-outlined p-1">calculate</span>
                                    <div className="p-1">                                
                                        <span style={{color:'gray', fontWeight:'500'}}>Valoare medie factura</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.avg_per_invoice).toFixed(2)} RON</span>
                                    </div>                                    
                                </div>                    
                            </div>
                            <div class="grid-item">
                                <div className='financial-square'>
                                    <span style={{color:'gray'}}  className="material-icons-outlined p-1">receipt</span>
                                    <div className="p-1">                                
                                        <span style={{color:'gray', fontWeight:'500'}}>Numar facturi</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.total_number_invoices)}</span>
                                    </div>                                    
                                </div>                    
                            </div> 
                        </div>
                    </div>
                </div>    
            </div>:"Nu exista date"}
            <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/>         
        </div>
    )

}

export default Financial