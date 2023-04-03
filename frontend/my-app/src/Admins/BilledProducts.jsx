import { useState, useEffect } from "react"
import { useOutletContext } from 'react-router-dom';

let BilledProducts = (props) =>{

    let [data, setData] = useState([])
    let [limits, setLimits] = useState([])
    let [groupedObject, setGroupedObject] = useState([])
    let [grouped, setGrouped] = useState(false)
    let [filterObject, setFilter] = useState({orderBy: null, order: null})

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port
    
    useEffect(()=>{
        fetchData()
    },[filterObject.orderBy, filterObject.order])

    function fetchData(){
        let fetchLink = `http://localhost:${port}/billedProducts`
        if(filterObject.orderBy!==null){
            fetchLink=`http://localhost:${port}/billedProducts?orderBy=${filterObject.orderBy}&order=${filterObject.order}`
        }

        fetch(fetchLink).then(response=>response.json()).then(data=>{
            if(data.status==="ERROR"){

            }else{
                setData(data.data)
                setLimits(data.limits)
                if(groupedObject.length===0){
                    let theObject=[]
                    let startIndex=0
                    let sum=0, invoices=[], lowestPrice=null, highestPrice=0, variation=0
                    let mostFrequent={index:0, numberOfTimes:0}
                    data.limits.forEach((element, index)=>{
                        for(let i=startIndex; i<startIndex+element; i++){
                            sum=sum+data.data[i].product_price
                            invoices.push(data.data[i].invoiceID)
                            if(data.data[i].product_price>highestPrice) highestPrice = data.data[i].product_price
                            if(lowestPrice===null){
                                lowestPrice = data.data[i].product_price
                            }else{
                                if(data.data[i].product_price < lowestPrice) lowestPrice = data.data[i].product_price
                            }
                        }
                        theObject.push({name:data.data[startIndex].product_name, sum, invoices, lowestPrice, highestPrice})
                        sum=0;
                        highestPrice=0
                        lowestPrice=null
                        invoices=[]
                        startIndex=startIndex+element
                        if(element>mostFrequent.numberOfTimes) mostFrequent={index, numberOfTimes:element}
                    })
                    theObject[mostFrequent.index].mostFrequent=true
                    setGroupedObject(theObject)
                }
            }
        }).catch(error=>{
            console.log(error)
        })
    }

    return(
        <div className="app-data-container">
            <div class="bordered-container p-2" style={{display:'flex', flexDirection:'row', alignItems:'center', width:'fit-content', marginBottom:'25px'}}>
                <span style={{fontSize:'16px', fontWeight:'700', color: 'rgb(108, 117, 125)', textTransform:'uppercase', marginRight:'20px'}}>produse facturate</span>
                <div class="btn-group">
                    <button title="Vezi tabel" onClick={()=>{setGrouped(!grouped)}} class="btn btn-light btn-sm mint-button"><div class="inner-button-content">{grouped ? "Arata ca tabel" : "Arata grupat"}</div></button>
                </div>
            </div>
            {grouped===false &&
            <div className="bordered-container">
                {data.length>0&&                    
                    <table className='table'>
                        <thead>      
                            <tr>
                                <td>#</td>
                                <td>Nume</td>
                                <td>Pret produs<button className="table-order-button" onClick={()=>{setFilter({orderBy:"product_price", order: filterObject.order==="asc" ? "desc" : "asc"})}}><span className="material-icons-outlined">{filterObject.order==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button></td>
                                <td>Pret total<button className="table-order-button" onClick={()=>{setFilter({orderBy:"total_price", order: filterObject.order==="asc" ? "desc" : "asc"})}}><span className="material-icons-outlined">{filterObject.order==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button></td>
                                <td>Factura<button className="table-order-button" onClick={()=>{setFilter({orderBy:"invoiceID", order: filterObject.order==="asc" ? "desc" : "asc"})}}><span className="material-icons-outlined">{filterObject.order==='asc' ? 'arrow_drop_down' : 'arrow_drop_up'}</span></button></td>
                            </tr> 
                        </thead>               
                        <tbody className='clients-table-body app-data-table-body'>
                            {data.length>0 &&
                                data.map((element, index)=>(
                                    <tr key={index} className='clients-table-row app-data-table-row'>
                                        <td>{index+1}</td>
                                        <td>{element.product_name}</td>
                                        <td>{element.product_price}</td>
                                        <td>{element.total_price}</td>
                                        <td>{element.invoiceID}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                }
                {data.length===0 && <h6>Nu exista produse</h6>} 
            </div>}
            {grouped===true &&
            <div>
                <div class="alert alert-success"><small>Produsele sunt grupate dupa nume. Gruparea nu este case-sensitive.</small></div>
                <div className="container-fluid">              
                    {data.length>0 &&   
                    <div className="row">
                        {groupedObject.map((element, index)=>(  
                            <div className="col-6" style={{padding:'0', border:'1px solid lightgray'}}>
                                <div className='financial-square' >
                                    <div>
                                        <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">shopping_bag</span>{element.name}
                                                {element.mostFrequent ? <span class="badge d-flex align-items-center p-1 m-1 pe-2 text-success bg-primary-subtle border border-success rounded-pill">
                                                <span className="material-icons-outlined mr-1" style={{fontSize:'16px'}}>info</span>Cel mai frecvent</span> : ""}
                                        </span>
                                        <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">payments</span>{element.sum}</span>
                                        <span style={{fontWeight:'500', display:'flex', alignItems:'center'}}><span className="material-icons-outlined m-1">arrow_downward</span>{element.lowestPrice}<span className="material-icons-outlined m-1">arrow_upward</span>{element.highestPrice}</span>
                                        <div style={{display:'flex', flexDirection:'row', flexWrap:'wrap'}}>
                                            {element.invoices.map(invoiceNumber=>(
                                                <span class="badge d-flex align-items-center p-1 m-1 pe-2 text-success bg-primary-subtle border border-success rounded-pill">
                                                <span className="material-icons-outlined mr-1" style={{fontSize:'16px'}}>receipt_long</span>Factura {invoiceNumber}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>                             
                        ))}
                    </div>}
                    {data.length===0 && <h6>Nu exista produse</h6>}
                </div>
            </div>
            }
        </div>
    )

}

export default BilledProducts