import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

let FinanchialChart=(props)=>{
    //imported from the example
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend
    );
      
    let options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Suma incasata in fiecare luna',
            },
        },
    };

    //dataset and intervals
    let [data, setData] = React.useState({labels:[], datasets: [{ label: 'Suma incasata', data: [], borderColor: 'rgba(40, 167, 69, 1)', backgroundColor: 'rgba(40, 167, 69, 1)'}]})

    //get dataset and intervals from props
    React.useEffect(()=>{
        if(props.data!=null){  
            let labels=[], dataArray=[]    
            let shallowCopy = data
            //decoding the data
            props.data.forEach(element=>{
                labels.push(`${element.month}/ ${element.year}`)
                dataArray.push(element.total)
            })
            //labels array
            shallowCopy.labels=labels
            //data array
            shallowCopy.datasets[0].data=dataArray
            setData(shallowCopy)            
        }
    },[props])

    return(
        <Line key={props.plottedFor} options={options} data={data}/>
    )
    
}

export default FinanchialChart;


