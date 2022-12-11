import React from "react";
import './FinancialComponent.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import FinancialChart from './FinancialChart.jsx'

let Financial = (props) =>{

    let [financialData, setFinancialData] = React.useState(null)
    let [alertUser, setUserAlert] =React.useState({text: null})
    //use for the horizontal scale of the chart
    let [chartTitle, setChartTile] = React.useState("Current year")
    let [chartData, setChartData] = React.useState([{month:8, year:2022, total:0}, {month:9, year:2022, total:0}])
    let currentDate = new Date()
    let [dateInterval, setInterval] = React.useState({
        start: `${currentDate.getFullYear()}-01-01`,
        end: `${currentDate.getFullYear()}-12-31`
    }) 
    
    let [taxes, setTaxes]= React.useState({profitTaxPercentage: 3, profitTax: 0, profit: 0})

    React.useEffect(()=>{
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
                //contains totals and statistics
                setFinancialData(data.data)
                //contains data for plotting a chart
                setChartTile(`${dateInterval.start} - ${dateInterval.end}`)
                //calcualtes taxes
                setTaxes({...taxes, profitTax: parseFloat(((data.data.total-data.data.total_exp)/100)*taxes.profitTaxPercentage).toFixed(2), profit:parseFloat(data.data.total-taxes.profitTax)})
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

    let recalculateTaxes=(event)=>{
        let profitTax = parseFloat(((financialData.total-financialData.total_exp)/100)*event.target.value).toFixed(2)
        setTaxes({profitTaxPercentage:event.target.value, profitTax:profitTax, profit:parseFloat(financialData.total-profitTax).toFixed(2)})
    }

    return( 
        <div>   
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{width:'70%', display:'inherit', alignItems:'center'}} className="p-3"><h5>Finante</h5></div>
                <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0 p-3" style={{width:'30%'}}>                                
                    
                </div>
            </div>     
            <div style={{padding:'10px'}}>

                <div class="alert alert-secondary interval-setter">
                    <div class="row">
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span title="Interval" class="material-icons-outlined" style={{marginRight: '5px'}}>date_range</span>
                            <input type="date" id="start" name="trip-start" value={dateInterval.start} onChange={someFunction}></input>
                            <input type="date" id="end" name="trip-end" value={dateInterval.end} onChange={someFunction}></input>
                        </div>
                    </div>
                </div>
                {financialData ?
                <div className="app-data-container">
                    <div className="list-group w-auto">
                        <div className="border-pill">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginBottom:'5px'}}>                
                                <span className="material-icons-outlined">payments</span>
                                <h5 style={{margin:'0',marginLeft:'5px'}}>Total</h5>
                            </div>
                            <table style={{width:'100%'}}>
                                <tbody>
                                    <tr style={{fontWeight:'600'}}>
                                        <td className="col-3">Venituri</td>
                                        <td className="col-3">TVA</td>
                                        <td className="col-3">Cheltuieli</td>
                                        <td className="col-3">Taxa profit</td>
                                    </tr>
                                    <tr style={{fontSize:'1.35rem'}}>
                                        <td><span className="card-head-text black-text">{parseFloat(financialData.total).toFixed(2)} RON</span></td>
                                        <td><span className="card-head-text black-text">{parseFloat(financialData.total_tax).toFixed(2)} RON</span></td>
                                        <td><span className="card-head-text black-text">{parseFloat(financialData.total_exp).toFixed(2)} RON</span></td>
                                        <td><span className="card-head-text black-text">{taxes.profitTax}</span></td>
                                    </tr>
                                    <tr style={{color:'gray',borderTop:'1px solid gray'}}>
                                        <td>Total incasari, facturi finalizare</td>
                                        <td>Total TVA</td>
                                        <td>Deduceri/ cheltuieli</td>
                                        <td>Taxa profit * (venituri - cheltuieli deductibile)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="border-pill">
                            <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginBottom:'5px'}}>                
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clipboard2-data" viewBox="0 0 16 16">
                                    <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5h3Z"/>
                                    <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12Z"/>
                                    <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7Zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1Zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Z"/>
                                </svg>
                                <h5 style={{margin:'0',marginLeft:'5px'}}>Valori medii</h5>
                            </div>
                            <table style={{width:'100%'}}>
                                <tbody>
                                    <tr style={{fontWeight:'600'}}>
                                        <td className="col-4">Numar facturi</td>
                                        <td className="col-4">Valoare medie factura</td>
                                        <td className="col-4">Valoare medie pe luna</td>
                                    </tr>
                                    <tr style={{fontSize:'1.35rem'}}>
                                        <td><span className="card-head-text black-text">{financialData.total_number_invoices}</span></td>
                                        <td><span className="card-head-text black-text">{parseFloat(financialData.avg_per_invoice).toFixed(2)} RON</span></td>
                                        <td><span className="card-head-text black-text">{parseFloat(financialData.avg_per_step).toFixed(2)} RON</span></td>
                                    </tr>
                                    <tr style={{color:'gray',borderTop:'1px solid gray'}}>
                                        <td>Numarul total de facturi in perioada selectata</td>
                                        <td>Total incasat / numar facturi</td>
                                        <td>Total incasat / numar luni</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>                
                            <span className="material-icons-outlined">timeline</span>
                            <h5 style={{margin:'0',marginLeft:'5px'}}>Grafic</h5>
                        </div>
                        <div>
                            <div id="financial-chart" style={{width:"50%"}}>
                                <FinancialChart data={chartData} plottedFor={chartTitle}/>             
                            </div>  
                        </div>  
                    </div>                  
                </div>:"Nu exista date"}
                <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/> 
            </div>
        </div>
    )

}

export default Financial