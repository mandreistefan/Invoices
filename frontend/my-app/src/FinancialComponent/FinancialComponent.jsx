import React from "react";
import './FinancialComponent.css'
import Snackbar from '../Snackbar/Snackbar.jsx'
import FinancialChart from './FinancialChart.jsx'

let Financial = (props) =>{

    let [financialData, setFinancialData] = React.useState(null)
    let [periodOfInterest, setPeriod] = React.useState(["yearly", "current", "q1", "010122-020122"])
    let [alertUser, setUserAlert] =React.useState({text: null})
    //use for the horizontal scale of the chart
    let [chartInterval, setChartInterval] = React.useState(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
    let [chartValues, setChartValues] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    let [chartTitle, setChartTile] = React.useState("Current year")

    let year = new Date().getFullYear();
    let activeYear=[{id:"current", descr:"Current year"}, {id:year-1, descr:year-1}, {id:year-2, descr:year-2}]
    

    React.useEffect(()=>{
        fetchData()
    }, [])

    let fetchData = ()=>{        
        let querry, filter, filterer;
        filter=periodOfInterest[0][0];
        switch(filter){
            case "y":
                filterer= (periodOfInterest[1]==="current") ? year : periodOfInterest[1]
                break
            case "q":
                filterer= periodOfInterest[2]
                break
            case "c":
                filterer= ""
                break
        }

        querry = `/financial/?filter=${filter}&filterBy=${filterer}`

        fetch(querry)
            .then(response=>response.json())
            .then(data=>{
                if(data.status==="OK"){
                    //periodicalData has a different use
                    let chartData = data.data.periodicalData
                    delete data.data.periodicalData
                    //contains totals and statistics
                    setFinancialData(data.data)
                    //contains data for plotting a chart
                    setChartData(chartData)
                    setChartTile(`Yearly, ${periodOfInterest[1]}`)
                }else if(data.status==="NO_DATA"){
                    delete data.data.periodicalData
                    //contains totals and statistics
                    setFinancialData(data.data)
                    setUserAlert({text: "No data available"})
                    setChartInterval(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
                    setChartValues([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
                    setChartTile(`${periodOfInterest[0]}, ${periodOfInterest[2]}, ${periodOfInterest[1]}`)
                }else{
                    setUserAlert({text: "There has been an error"})
                }
            })
    }

    let selector = (event) =>{
        if(event.target.name==="financialPeriod"){
            if(event.target.value==="yearly"){
                setPeriod(["yearly", periodOfInterest[1], periodOfInterest[2], periodOfInterest[3]])
            }else if(event.target.value==="quarterly"){
                setPeriod(["quarterly", periodOfInterest[1], periodOfInterest[2], periodOfInterest[3]])
            }else{
                setPeriod(["custom", periodOfInterest[1], periodOfInterest[2], periodOfInterest[3]])
            }               
        }else if(event.target.name==="yearInterval"){
            setPeriod([periodOfInterest[0], event.target.value, periodOfInterest[2], periodOfInterest[3]])
        }else if(event.target.name==="quarterInterval"){
            setPeriod([periodOfInterest[0],  periodOfInterest[1], event.target.value, periodOfInterest[3]])
        }else if(event.target.name.indexOf("customInterval")>-1){    
            validateCustomInterval(event.target.value, event.target.name)      
        }
    }

    let validateCustomInterval=(key, who)=>{
        let validNumber = new RegExp(/^\d*\.?\d*$/);
        let intervalAsString = periodOfInterest[3].toString()
    
        if(validNumber.test(key)){
           switch(who){
            case "customInterval-start-day":
                setPeriod(periodOfInterest[0], periodOfInterest[1], periodOfInterest[2], intervalAsString)
                break;

           }
        }

    }

    let setChartData=(data)=>{
        let shallowCopy;
        switch(periodOfInterest[0]){
            case "yearly":
                setChartInterval(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
                shallowCopy = chartValues
                data.forEach(element=>{
                    shallowCopy[element[0]]=element[4]
                })
                setChartValues(shallowCopy)                
                break
            case "quarterly":
                //set the chgart data
                shallowCopy = chartValues
                data.forEach(element=>{
                    shallowCopy[element[0]]=element[4]
                })
                //filter chart data and set intervals
                switch(periodOfInterest[1].toLowerCase()){
                    case "q1":
                        setChartInterval(['Jan', 'Feb', 'Mar'])
                        setChartValues(shallowCopy.substring(0,3))
                        break
                    case "q2":
                        setChartInterval(['Apr', 'May', 'Jun'])
                        setChartValues(shallowCopy.substring(3,6))
                        break
                    case "q3":
                        setChartInterval(['Jul', 'Aug', 'Sep'])
                        setChartValues(shallowCopy.substring(6,9))
                        break
                    case "q4":
                        setChartInterval(['Oct', 'Nov', 'Dec'])
                        setChartValues(shallowCopy.substring(9))
                        break    
                }
                break
            default:
                break
        }
    }

    return(
        financialData &&
        <div className="app-data-container financial-container">
            <h1 className="bd-title" id="content">Financial overview</h1>
            <p className="bd-lead">Provides an overview of financial data regarding registered invoices</p> 
            <div className="alert alert-secondary">
                <span className="bd-lead financial-container-title">Filter data</span>
                <div className="row financial-container-header">
                    <div className="col-2"><span>Period:</span></div>
                    <div className="col-2"><span>Year:</span></div>
                    <div className="col-2"><span>Quarter:</span></div>
                    <div className="col-2"><span>Custom:</span></div>
                </div>
                <div className="row financial-container-body">
                    <div className="col-2">
                        <select className="form-control form-control-sm" id="finacial-period" name="financialPeriod" value={periodOfInterest[0]} onChange={selector}>
                            <option value="yearly">Yearly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div className="col-2">
                        <select disabled={(periodOfInterest[0]==="yearly") ? false : true} className="form-control form-control-sm" id="year-interval" name="yearInterval" value={periodOfInterest[1]} onChange={selector}>
                            {activeYear.map(element=>(
                                <option key={element.id} value={element.id}>{element.descr}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-2">
                        <select disabled={(periodOfInterest[0]==="quarterly") ? false : true} className="form-control form-control-sm" id="quarter-interval" name="quarterInterval" value={periodOfInterest[2]} onChange={selector}>
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>
                        </select>
                    </div>
                    <div className="col-2" disabled={(periodOfInterest[0]==="custom") ? false : true}>
                        <input  className="form-control form-control-sm" id="custom-interval-1" name="customInterval-start-day" value={`${periodOfInterest[3][0]}${periodOfInterest[3][1]}`} onChange={selector}></input>
                        <input  className="form-control form-control-sm" id="custom-interval-2" name="customInterval-start-month" value={`${periodOfInterest[3][2]}${periodOfInterest[3][3]}`} onChange={selector}></input>
                        <input  className="form-control form-control-sm" id="custom-interval-3" name="customInterval-start-year" value={`${periodOfInterest[3][4]}${periodOfInterest[3][5]}`} onChange={selector}></input>
                        <input  className="form-control form-control-sm" id="custom-interval-4" name="customInterval-end-day" value={`${periodOfInterest[3][7]}${periodOfInterest[3][8]}`} onChange={selector}></input>
                        <input  className="form-control form-control-sm" id="custom-interval-5" name="customInterval-end-month" value={`${periodOfInterest[3][9]}${periodOfInterest[3][10]}`} onChange={selector}></input>
                        <input  className="form-control form-control-sm" id="custom-interval-6" name="customInterval-end-year" value={`${periodOfInterest[3][11]}${periodOfInterest[3][12]}`} onChange={selector}></input>
                    </div>
                    <div className="col-1">
                        <button className="actions-button" onClick={()=>{fetchData()}}><span className="action-button-label"><span className="material-icons-outlined">refresh</span>Refresh</span></button>
                    </div>
                </div>
            </div> 
    
            <div className="list-group w-auto">
                <a className="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                    <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0" style={{width:"36px", height:'36px'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-currency-dollar" viewBox="0 0 16 16">
                            <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                        </svg>
                    </div>
                    <div className="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 className="mb-0">Total income</h6>
                        <span className="card-head-text black-text">{financialData.total} RON</span>
                        <p className="mb-0 opacity-75">Total sum(incl. tax) billed in the specified time-period</p>
                    </div>
                    <small className="opacity-50 text-nowrap">now</small>
                    </div>
                </a>
                <a className="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                    <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0" style={{width:"36px", height:'36px'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-percent" viewBox="0 0 16 16">
                            <path d="M13.442 2.558a.625.625 0 0 1 0 .884l-10 10a.625.625 0 1 1-.884-.884l10-10a.625.625 0 0 1 .884 0zM4.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm7 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                        </svg>
                    </div>
                    <div className="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 className="mb-0">Tax</h6>
                        <span className="card-head-text red-text">{financialData.total_tax} RON</span>  
                        <p className="mb-0 opacity-75">Total tax for the specified time-period</p>
                    </div>
                    <small className="opacity-50 text-nowrap">3d</small>
                    </div>
                </a>
                <a className="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                    <div class="icon-square text-bg-light d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0" style={{width:"36px", height:'36px'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-currency-dollar" viewBox="0 0 16 16">
                            <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                        </svg>
                    </div>
                    <div className="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 className="mb-0">Net revenue</h6>
                        <span className="card-head-text green-text">{financialData.total_net} RON</span> 
                        <p className="mb-0 opacity-75">Revenue calculated as Total income - Total tax</p>
                    </div>
                    <small className="opacity-50 text-nowrap">1w</small>
                    </div>
                </a>
                <a className="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-clipboard2-data" viewBox="0 0 16 16">
                        <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5h3Z"/>
                        <path d="M3 2.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 0 0-1h-.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1H12a.5.5 0 0 0 0 1h.5a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12Z"/>
                        <path d="M10 7a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7Zm-6 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1Zm4-3a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Z"/>
                    </svg>
                    <div className="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 className="mb-0">Averages</h6>
                        <div className="card-holder">
                            <div className="financial-card">
                                <h6 className="mb-0">No of invoices</h6>
                                <span className="card-head-text black-text">{financialData.total_number_invoices}</span>  
                            </div>
                            <div className="financial-card">
                                <h6 className="mb-0">Average per invoice</h6>
                                <span className="card-head-text black-text">{financialData.avg_per_invoice}</span>  

                            </div>
                            <div className="financial-card">
                                <h6 className="mb-0">Average per month</h6>
                                <span className="card-head-text black-text">{financialData.avg_per_step}</span>                 
                            </div>
                        </div>
                    </div>
                    <small className="opacity-50 text-nowrap">1w</small>
                    </div>
                </a>
            </div>

            <div id="financial-chart">
                <FinancialChart data={chartValues} intervals={chartInterval} plottedFor={chartTitle}/>             
            </div>            
            <Snackbar text={alertUser.text} closeSnack={()=>{setUserAlert({text:null})}}/>  
        </div>
    )

}

export default Financial