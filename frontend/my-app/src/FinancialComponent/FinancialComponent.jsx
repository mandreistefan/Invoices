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
                    <div className="col-4 p-2">
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
                    <div className="col-4 p-2">
                        <div className='row' style={{height:'50%'}}>
                            <div className="col-6">
                                <div className="bordered-container financial-square p-2">
                                    <span style={{color:'gray'}}  className="material-icons-outlined p-1">payments</span>
                                    <div className="p-1">                                
                                        <span style={{color:'gray', fontWeight:'500'}}>Numar facturi</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.total_number_invoices)}</span>
                                    </div>                                    
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bordered-container financial-square p-2">
                                    <span style={{color:'gray'}} className="material-icons-outlined p-1">money</span>
                                    <div className="p-1">                                
                                        <span style={{color:'gray', fontWeight:'500'}}>Valoare medie factura</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.avg_per_invoice).toFixed(2)}</span>
                                    </div>                                    
                                </div>
                            </div>
                        </div>
                        <div className='row' style={{height:'50%'}}>
                            <div className="col-6">
                                <div className="bordered-container financial-square p-2">
                                    <span style={{color:'gray'}} className="material-icons-outlined">money</span>                                    
                                    <div className="p-1"> 
                                        <span style={{color:'gray', fontWeight:'500'}}>Valoare medie lunara</span>
                                        <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.avg_per_step).toFixed(2)}</span>
                                    </div>                                    
                                </div>
                            </div>
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