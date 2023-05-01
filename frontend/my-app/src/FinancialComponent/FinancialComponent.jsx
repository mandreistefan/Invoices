import {useState, useEffect} from 'react';
import './FinancialComponent.css'
import FinancialChart from './FinancialChart.jsx'
import PieChart from './PieChart.jsx'
import { useOutletContext } from 'react-router-dom';

let Financial = (props) =>{

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    let [financialData, setFinancialData] = useState(null)
    //use for the horizontal scale of the chart
    let [chartTitle, setChartTile] = useState("Current year")
    let [chartData, setChartData] = useState([{month:8, year:2022, total:0}, {month:9, year:2022, total:0}])
    let [pieChartData, setPieChartData] = useState([{label:"Salarii", value:"60", sum:"100"}, {label:"Cheltuieli", value:"20"}, {label:"Profit", value:"20"}])
    let [expensesPie, setExpensesPie]= useState([{label:"Unelte", value:"60"}, {label:"Adminsitrative", value:"20"}, {label:"Transport", value:"20"}])
    let currentDate = new Date()
    let [dateInterval, setInterval] = useState({
        start: `${currentDate.getFullYear()}-01-01`,
        end: `${currentDate.getFullYear()}-12-31`
    }) 

    let [tableDisplay, setDisplay] = useState(false)
    let [taxes, setTaxes]= useState({profitTaxPercentage: 1, profitTax: 0, profit: 0})

    useEffect(()=>{
        fetchData()
    }, [dateInterval])

    let fetchData=()=>{
        
        let startDateArray = dateInterval.start.split("-")
        let endDayArray = dateInterval.end.split("-")
        let filterBy=`${startDateArray[2]}${startDateArray[1]}${startDateArray[0].substring(2,4)}-${endDayArray[2]}${endDayArray[1]}${endDayArray[0].substring(2,4)}`

        let querry = `http://localhost:${port}/financial?filter=interval&filterBy=${filterBy}`
        fetch(querry).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                if(data.data.total>0){
                    //periodicalData has a different use
                    setChartData(data.data.periodicalData)
                    delete data.data.periodicalData
                    //piechartData
                    let pieChartShallow = pieChartData
                    pieChartData[0].value = data.data.salariesPercentIncome
                    pieChartData[1].value = data.data.expensesPercentIncome
                    pieChartData[2].value = data.data.profitPercentIncome
                    setPieChartData(pieChartShallow)
                    let pieExpensesChartShallow = expensesPie
                    pieExpensesChartShallow[0].value = data.data.expensesCategories.tools.percentage
                    pieExpensesChartShallow[0].sum = data.data.expensesCategories.tools.value
                    pieExpensesChartShallow[1].value = data.data.expensesCategories.administrative.percentage
                    pieExpensesChartShallow[1].sum = data.data.expensesCategories.administrative.value
                    pieExpensesChartShallow[2].value = data.data.expensesCategories.transport.percentage
                    pieExpensesChartShallow[2].sum = data.data.expensesCategories.transport.value
                    setExpensesPie(pieExpensesChartShallow)
                    delete data.data.salariesPercentIncome
                    delete data.data.expensesPercentIncome
                    //contains totals and statistics
                    setFinancialData(data.data)
                    //contains data for plotting a chart
                    setChartTile(`${dateInterval.start} - ${dateInterval.end}`)
                    //calcualtes taxes
                    setTaxes({...taxes, profitTax: parseFloat(((data.data.total-data.data.expenses-data.data.salaries)/100)*taxes.profitTaxPercentage).toFixed(2), profit:parseFloat(data.data.total-taxes.profitTax)})
                }
            }else if(data.status==="NO_DATA"){
                addSnackbar({text: "Nu exista date"})
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem",text: "Baza de date nu poate fi accesata"})    
            }else{
                addSnackbar({ticon:"report_problem",ext: "Baza de date nu poate fi accesata"})
            }
        })
    }

    let someFunction=(event)=>{
        event.target.name==="trip-start" ? setInterval({...dateInterval, start:event.target.value}) : setInterval({...dateInterval, end:event.target.value})
    }

    function exportData(){
        fetch(`http://localhost:${port}/export_data`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                addSnackbar({text: `Au fost exportate ${data.data.length} tabele`})  
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem",text: "Baza de date nu poate fi accesata"})    
            }else{
                addSnackbar({icon:"report_problem",text: "Baza de date nu poate fi accesata"})
            }
        })
    }

    return( 
        <div className="app-data-container"> 
            <div className="bordered-container p-2" style={{width:'fit-content', display:'flex', justifyContent:'flex-start', alignItems:'center'}}>
                <span class="material-icons-outlined">attach_money</span>
                <span style={{fontSize:'16px', fontWeight:'700', color: 'rgb(108, 117, 125)', textTransform:'uppercase', marginRight:'20px'}}>finante</span>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span title="Interval" className="material-icons-outlined" style={{marginRight: '5px'}}>date_range</span>
                    <input type="date" className="form-control shadow-none" style={{width:'fit-content'}} id="start" name="trip-start" value={dateInterval.start} onChange={someFunction}></input>
                    <input type="date" className="form-control shadow-none" style={{width:'fit-content'}} id="end" name="trip-end" value={dateInterval.end} onChange={someFunction}></input>
                </div>
                <div className="btn-group">
                    <button title={tableDisplay ? 'Vezi grafic' : 'Vezi tabel'} className="btn btn-light btn-sm mint-button" onClick={()=>{setDisplay(!tableDisplay)}}><div className="inner-button-content"><span className="material-icons-outlined" style={{fontSize:'18px'}}>{tableDisplay ? 'grid_view' : 'table_rows'}</span>Display</div></button>    
                </div> 
            </div>
            {financialData ?
            <div className='financial-grid'>
                {tableDisplay===false && financialData.total > 0 &&
                <div className="">        
                    <div className="row" style={{marginBottom:'24px'}}>
                        <div className="col-2">
                            <div className='financial-square'>
                                <span style={{color:'gray'}}  className="material-icons-outlined p-1">receipt</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Numar facturi</span>
                                    <span style={{fontSize:'32px', fontWeight:'600'}}>{parseFloat(financialData.total_number_invoices)}</span>
                                </div>                                    
                            </div>                    
                        </div>  
                        <div className="col">
                            <div className='financial-square'>
                                <span style={{color:'gray'}} className="material-icons-outlined p-1">calculate</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Valoare medie factura</span>
                                    <span style={{fontSize:'32px', fontWeight:'600', color:'#0d6efd'}}>{Number(parseFloat(financialData.avg_per_invoice).toFixed(2)).toLocaleString()}</span><small>RON</small>
                                </div>                                    
                            </div>                    
                        </div> 
                        <div className="col">
                            <div className='financial-square'>
                                <span style={{color:'gray'}}  className="material-icons-outlined p-1">payments</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Total incasat</span>
                                    <span style={{fontSize:'32px', fontWeight:'600', color:'#35b653'}}>{Number(parseFloat(financialData.total)).toLocaleString()}</span><small>RON</small>
                                </div>                                    
                            </div>        
                        </div>  
                    </div>
                    <div className="row" style={{marginBottom:'24px'}}>
                        <div className="col">
                            <div className='financial-square'>
                                <span style={{color:'gray'}}  className="material-icons-outlined p-1">money_off</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Total cheltuieli</span>
                                    <span style={{fontSize:'32px', fontWeight:'600', color:'#dc3545'}}>-{Number(financialData.expenses.toFixed(2)).toLocaleString()}</span><small>RON</small>
                                </div>                                    
                            </div>                    
                        </div>    
                        <div className="col">
                            <div className='financial-square'>
                                <span style={{color:'gray'}}  className="material-icons-outlined p-1">money_off</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Total salarii</span>
                                    <span style={{fontSize:'32px', fontWeight:'600', color:'#dc3545'}}>-{Number(financialData.salaries.toFixed(2)).toLocaleString()}</span><small>RON</small>
                                </div>                                    
                            </div>                    
                        </div>  
                        <div className="col">
                            <div className='financial-square'>
                                <span style={{color:'gray'}} className="material-icons-outlined p-1">calculate</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Profit net</span>
                                    <span style={{fontSize:'32px', fontWeight:'600', color:parseFloat(financialData.total_gross)<0 ? '#dc3545' : '#35b653'}}>{Number(financialData.total_gross.toFixed(2)).toLocaleString()}</span><small>RON</small>
                                </div>                                    
                            </div>                    
                        </div> 
                        <div className="col">
                            <div className='financial-square'>
                                <span style={{color:'gray'}} className="material-icons-outlined p-1">calculate</span>
                                <div className="p-1">                                
                                    <span style={{color:'gray', fontWeight:'500'}}>Profit net (procentaj) </span>
                                    <span style={{fontSize:'32px', fontWeight:'600', color:parseFloat(financialData.total_gross)<0 ? '#dc3545' : '#35b653'}}>{financialData.profitPercentIncome.toFixed(1)}</span><small>%</small>
                                </div>                                    
                            </div>                    
                        </div>                  
                    </div>
                    <div className='row' style={{marginBottom:'24px'}}>
                        <div className="col-6">
                            <div className="card text-center">
                                <div className="card-header">
                                    <span style={{color:'gray'}}  className="material-icons-outlined p-1">insights</span>Valori lunare ale facturilor incasate
                                </div>
                                <div className="card-body">
                                    <FinancialChart data={chartData} plottedFor={chartTitle}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-3"> 
                            <div className="card text-center">
                                <div className="card-header">
                                    <span style={{color:'gray'}}  className="material-icons-outlined p-1">donut_small</span>Impartire venituri, procentual
                                </div>
                                <div className="card-body">
                                    <PieChart data={pieChartData} plottedFor={chartTitle}/>
                                </div>
                            </div>                        
                        </div>
                        <div className="col-3"> 
                            <div className="card text-center">
                                <div className="card-header">
                                    <span style={{color:'gray'}}  className="material-icons-outlined p-1">donut_small</span>Impartire cheltuieli, procentual
                                </div>
                                <div className="card-body">
                                    <PieChart data={expensesPie} plottedFor={chartTitle}/>
                                </div>
                            </div>                     
                        </div> 
                    </div>
                </div> 
            }   
            {tableDisplay===true && financialData.total > 0 &&
            <div>
                <div className='bordered-container mb-3'>
                    <h5 className="p-3">Total</h5>
                    <table className="table" id="invoices-table">
                        <thead>
                            <tr>
                                <td>Nume</td>
                                <td>Valoare</td>
                            </tr>
                        </thead>
                        <tbody>         
                            <tr>
                                <td>Total incasari</td>
                                <td>{financialData.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Salarii</td>
                                <td> - {financialData.salaries.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Cheltuieli</td>
                                <td> - {financialData.expenses.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Total net</td>
                                <td>{financialData.total_gross.toFixed(2)}</td>
                            </tr>
                        </tbody>  
                    </table>
                </div>
                <div className='bordered-container mb-3'>
                    <h5 className='p-3'>Incasari</h5>
                    <table className="table" id="invoices-table">
                        <thead>
                            <tr>
                                <td>An</td>
                                <td>Luna</td>
                                <td>Valoare</td>
                            </tr>
                        </thead>
                        <tbody>  
                            {chartData.map((element, index)=>(
                                <tr key={index}>
                                    <td>{element.year && element.year}</td>
                                    <td>{element.month && element.month}</td>                                    
                                    <td>{element.total && element.total}</td>
                                </tr>
                            ))}  
                        </tbody>  
                    </table>
                </div>
                <div className='bordered-container mb-3'>
                    <h5 className='p-3'>Cheltuieli</h5>
                    <table className="table" id="invoices-table">
                        <thead>
                            <tr>
                                <td>Categorie</td>
                                <td>Valoare</td>
                                <td>Procent</td>
                            </tr>
                        </thead>
                        <tbody>  
                            {expensesPie.length>0 && expensesPie.map((element, index)=>(
                                <tr key={index}>
                                    <td>{element.label}</td>
                                    <td>{element.sum && element.sum.toFixed(2)}</td>                                    
                                    <td>{element.value && element.value.toFixed(2)}</td>
                                </tr>
                            ))}  
                        </tbody>  
                    </table>
                </div>
            </div>
            }
            </div>:<h6 style={{textAlign:'center'}}>Nu exista date</h6>}     
        </div>
    )

}

export default Financial