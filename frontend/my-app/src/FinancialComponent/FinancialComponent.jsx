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
            <div className='grid-container'>
                <div className="grid-row" style={{height:'325px'}}>
                    <div className="col-6 p-2">
                        <div style={{backgroundColor:'white'}} className="bordered-container  p-2">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginBottom:'5px'}} className="p-1">                
                                <span className="material-icons-outlined">payments</span>
                                <h5 style={{margin:'0',marginLeft:'5px'}}>Total</h5>
                            </div>
                            <table style={{width:'100%'}} className="table">
                                <tbody>
                                    <tr className="table-secondary" style={{borderRadius:'6px', fontWeight:'600'}}>
                                        <td className="col-6">Venituri</td>
                                        <td style={{textAlign:'right'}}>{parseFloat(financialData.total).toFixed(2)} RON</td>
                                    </tr>
                                    <tr>
                                        <td cclassName="col-6">Cheltuieli</td>
                                        <td style={{textAlign:'right'}}>- {parseFloat(financialData.total_exp).toFixed(2)} RON</td>
                                    </tr>
                                    <tr>
                                        <td className="col-6">Salarii</td>
                                        <td style={{textAlign:'right'}}>- {parseFloat(financialData.salaries).toFixed(2)} RON</td>
                                    </tr>
                                    <tr style={{fontWeight:'600'}}>
                                        <td className="col-6">Profit brut</td>
                                        <td style={{textAlign:'right'}}>{parseFloat(financialData.total - financialData.total_exp - financialData.salaries).toFixed(2)} RON</td>
                                    </tr>
                                    <tr>
                                        <td className="col-6">Taxa profit</td>
                                        <td style={{textAlign:'right'}}>- {taxes.profitTax} RON</td>
                                    </tr>
                                    <tr style={{fontWeight:'600'}} className="table-success">
                                        <td className="col-6">Profit net</td>
                                        <td style={{textAlign:'right'}}> {parseFloat(financialData.total - financialData.total_exp - financialData.salaries - taxes.profitTax).toFixed(2)} RON</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-6 p-2">
                        <div style={{backgroundColor:'white'}} className="bordered-container p-2">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginBottom:'5px'}}  className="p-1">                
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clipboard2-data" viewBox="0 0 16 16">
                                    <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5h3Z"/>
                                    <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12Z"/>
                                    <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7Zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1Zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Z"/>
                                </svg>
                                <h5 style={{margin:'0',marginLeft:'5px'}}>Valori medii</h5>
                            </div>
                            <table style={{width:'100%'}} className='table'>
                                <tbody>
                                    <tr>
                                        <td className="col-6">Numar facturi</td>
                                        <td style={{textAlign:'right'}}><span>{financialData.total_number_invoices}</span></td>
                                    </tr>
                                    <tr>
                                        <td className="col-6">Valoare medie factura</td>
                                        <td style={{textAlign:'right'}}><span>{parseFloat(financialData.avg_per_invoice).toFixed(2)} RON</span></td>
                                    </tr>
                                    <tr>
                                        <td className="col-6">Valoare medie pe luna</td>
                                        <td style={{textAlign:'right'}}><span>{parseFloat(financialData.avg_per_step).toFixed(2)} RON</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="grid-row" style={{height:'fit-content'}}>
                    <div className="col-6 p-2">
                        <div style={{backgroundColor:'white'}} className="bordered-container p-2">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}  className="p-1">                
                                <span className="material-icons-outlined">timeline</span>
                                <h5 style={{margin:'0',marginLeft:'5px'}}>Incasari</h5>
                            </div>
                            <div>
                                <div id="financial-chart">
                                    <FinancialChart data={chartData} plottedFor={chartTitle}/>             
                                </div>  
                            </div>  
                        </div>
                    </div>
                    <div className="col-3 p-2">
                        <div style={{backgroundColor:'white'}} className="bordered-container p-2">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}  className="p-1">                
                                <span className="material-icons-outlined">timeline</span>
                                <h5 style={{margin:'0',marginLeft:'5px'}}>Impartire venituri</h5>
                            </div>
                            <div>
                                <div id="financial-chart" style={{width:"100%"}}>
                                    <PieChart data={pieChartData} plottedFor={chartTitle}/>             
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