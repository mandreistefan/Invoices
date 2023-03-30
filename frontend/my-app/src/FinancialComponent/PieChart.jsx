import React from 'react';
import { Chart as ChartJS,
    ArcElement,
    Tooltip} 
from 'chart.js';

import { Doughnut } from 'react-chartjs-2';

let PieChart=(props)=>{
    
    ChartJS.register(ArcElement, Tooltip);

    let options = {
        responsive: true,
        plugins: {
            legend: {
                display:false
            },
            title: {
                display: false,
                text: 'Spread across time period',
            },
        },
    }

    //dataset and intervals
    let [data, setData] = React.useState({labels:[], datasets: [{data: [], borderColor: ['rgba(0, 123, 255, 1)', 'rgba(220, 53, 69, 1)', 'rgba(40, 167, 69, 1)'], backgroundColor: ['rgba(0, 123, 255, 1)', 'rgba(220, 53, 69, 1)', 'rgba(40, 167, 69, 1)']}]})

    React.useEffect(()=>{
        if(props.data!=null){
            let labels=[], dataArray=[]  
            let shallowCopy = data
            //decoding the data
            props.data.forEach(element=>{
                labels.push(element.label)
                if(element.value!==null) dataArray.push(element.value)
            })
            shallowCopy.labels=labels
            shallowCopy.datasets[0].data=dataArray
            setData(shallowCopy)
        }
    }, [props])

    return(
        <div key={props.plottedFor}>
            <Doughnut data={data} options={options}/>            
            {data.datasets[0].data.length>0&&   
                data.labels.map((element, index)=>(
                    <div key={index} style={{display:'flex', flexDirection:'row'}}>
                        <span style={{color:data.datasets[0].borderColor[index]}}><span className="material-icons-outlined">radio_button_unchecked</span></span>
                        <span style={{color:'black'}}><b>{element}</b> {data.datasets[0].data[index].toFixed(2)}%</span>
                    </div>
                    
                ))   
            }   
            {data.datasets[0].data.length===0 && <h6>Nu exista date</h6>}             
        </div>
    )
}

export default PieChart

