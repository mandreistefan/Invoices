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
                display: true,
                text: 'Spread across time period',
            },
        },
    };

    //dataset and intervals
    let [data, setData] = React.useState({labels:[], datasets: [{ label: 'Chart header', data: [], borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)'}]})

    //get dataset and intervals from props
    React.useEffect(()=>{
        if(props.data!=null){  
            let labels=[], dataArray=[]    
            let shallowCopy = data
            console.log(props.data)
            //decoding the data
            props.data.forEach(element=>{
                labels.push(`${element.month} ${element.year}`)
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
        <div className='px-4 py-2 my-2 text-center alert alert-light'>
            <h2 className='my-5'>{props.plottedFor}</h2>
            <Line key={props.plottedFor} options={options} data={data}/>

        </div>
    )
    
}

export default FinanchialChart;


