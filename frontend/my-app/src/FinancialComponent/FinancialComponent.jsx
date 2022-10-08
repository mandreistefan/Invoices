import React from "react";
import './FinancialComponent.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import FinancialChart from './FinancialChart.jsx'
import DatePicker from "react-datepicker";

let Financial = (props) =>{

    let [financialData, setFinancialData] = React.useState(null)
    let [alertUser, setUserAlert] =React.useState({text: null})
    //use for the horizontal scale of the chart
    let [chartInterval, setChartInterval] = React.useState(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
    let [chartValues, setChartValues] = React.useState([0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    let [chartTitle, setChartTile] = React.useState("Current year")
    let [chartData, setChartData] = React.useState([{month:8, year:2022, total:0}, {month:9, year:2022, total:0}])

    let currentDate = new Date()
    let initialStartDate = new Date()
    initialStartDate.setFullYear(currentDate.getFullYear()-1)
    let year = currentDate.getFullYear();    
    let [dateInterval, setInterval] = React.useState({start: initialStartDate, end: currentDate})
    
    const ExampleCustomInput = React.forwardRef(({ value, onClick }, ref) => (
        <button className="date-picker-button" onClick={onClick} ref={ref}>{value}</button>
    ));

    React.useEffect(()=>{
        fetchData()
    }, [])

    let fetchData=()=>{
        
        let interval={
            startDay:dateInterval.start.getDate().toString().length===1 ? `0${dateInterval.start.getDate().toString()}`:`${dateInterval.start.getDate().toString()}`,
            endDay: dateInterval.end.getDate().toString().length===1 ? `0${dateInterval.end.getDate().toString()}`:`${dateInterval.end.getDate().toString()}`,
            startMonth: parseInt(dateInterval.start.getMonth())+1<10 ? `0${(dateInterval.start.getMonth()+1).toString()}`:`${(dateInterval.start.getMonth()+1).toString()}`,
            endMonth: parseInt(dateInterval.start.getMonth())+1<10 ? `0${(dateInterval.end.getMonth()+1).toString()}`:`${(dateInterval.end.getMonth()+1).toString()}`,
            startYear: dateInterval.start.getFullYear().toString().substring(2,4),
            endYear: dateInterval.end.getFullYear().toString().substring(2,4)
        }

        let filterBy=`${interval.startDay}${interval.startMonth}${interval.startYear}-${interval.endDay}${interval.endMonth}${interval.endYear}`

        let querry = `/financial/?filter=interval&filterBy=${filterBy}`
        fetch(querry).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                //periodicalData has a different use
                setChartData(data.data.periodicalData)
                delete data.data.periodicalData
                //contains totals and statistics
                setFinancialData(data.data)
                //contains data for plotting a chart
                setChartTile(`${interval.startDay}/${interval.startMonth}/${interval.startYear} - ${interval.endDay}/${interval.endMonth}/${interval.endYear}`)
            }else if(data.status==="NO_DATA"){

            }else{
                setUserAlert({text: "There has been an error"})
            }
        })
    }

    return(
        financialData &&
        <div>
            <div className="app-title-container">
                <h4>Finante</h4>
                <div className="app-submenu-selector">
                </div>
            </div>
            <hr/>
            <div className="app-data-container financial-container">
                <div className="alert alert-secondary">
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginBottom:'5px'}}>                
                        <h5 style={{margin:'0',marginLeft:'5px'}}>Interval</h5>
                    </div>
                    <div className="row financial-container-body">
                        <div className="col-2" style={{display:'flex', flexDirection:'row', justifyContent:"flex-start"}}>
                            <DatePicker style={{width:'fit-content'}} dateFormat="dd/MM/yyyy" id="billing-date-yearly" customInput={<ExampleCustomInput />} selected={dateInterval.start} disabled={false} onChange={(date:Date) => setInterval({start: date, end: dateInterval.end})}/>

                            <DatePicker style={{width:'fit-content'}} dateFormat="dd/MM/yyyy" id="billing-date-yearly" customInput={<ExampleCustomInput />} selected={dateInterval.end} disabled={false} onChange={(date:Date) => setInterval({start: dateInterval.start, end: date})}/>
                        </div>
                        <div className="col-1">
                            <button className="btn btn-secondary btn-sm" onClick={()=>{fetchData()}}><span className="action-button-label">Apply</span></button>
                        </div>
                    </div>
                </div> 
        
                <div className="list-group w-auto">
                    <div style={{backgroundColor:"white", borderRadius:'6px', padding:'16px', marginBottom:'16px'}}>
                        <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginBottom:'5px'}}>                
                            <span className="material-icons-outlined">payments</span>
                            <h5 style={{margin:'0',marginLeft:'5px'}}>Total</h5>
                        </div>
                        <table style={{width:'100%'}}>
                            <tbody>
                                <tr style={{fontWeight:'600'}}>
                                    <td className="col-4">Incasari</td>
                                    <td className="col-4">Taxe</td>
                                    <td className="col-4">Net</td>
                                </tr>
                                <tr style={{fontSize:'1.35rem'}}>
                                    <td><span className="card-head-text black-text">{parseFloat(financialData.total).toFixed(2)} RON</span></td>
                                    <td><span className="card-head-text black-text">{parseFloat(financialData.total_tax).toFixed(2)} RON</span></td>
                                    <td><span className="card-head-text black-text">{parseFloat(financialData.total_net).toFixed(2)} RON</span></td>
                                </tr>
                                <tr style={{color:'gray',borderTop:'1px solid gray'}}>
                                    <td>Total incasari, facturi finalizare</td>
                                    <td>Totalul taxelor</td>
                                    <td>Net, calculat ca total incasari - total taxe</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{backgroundColor:"white", borderRadius:'6px', padding:'16px', marginBottom:'16px'}}>
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
                                    <td>Valoarea medie a unei facturi, calculata ca total / numar facturi</td>
                                    <td>Valoarea medie lunara a unei facturi, calculata ca total / numar luni</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={{backgroundColor:"white", borderRadius:'6px', padding:'16px', marginBottom:'16px'}}>
                    <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>                
                        <span className="material-icons-outlined">timeline</span>
                        <h5 style={{margin:'0',marginLeft:'5px'}}>Grafic</h5>
                    </div>
                    <div id="financial-chart">
                        <FinancialChart data={chartData} plottedFor={chartTitle}/>             
                    </div>    
                </div>        
                <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/>  
            </div>
        </div>
    )

}

export default Financial