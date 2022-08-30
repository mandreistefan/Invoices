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
            let shallowCopy = data
            shallowCopy.labels=props.intervals
            shallowCopy.datasets[0].data=props.data
            setData(shallowCopy)            
        }
    },[props])

    return(
        <div className='px-4 py-2 my-2 text-center alert alert-light'>
            <h2 className='my-5'>{props.plottedFor}</h2>
            <Line key={props.plottedFor} options={options} data={data}/>
            <table class="table table-striped table-sm">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Month</th>
                    <th scope="col">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.intervals.map((element, index)=>(
                            <tr key={index+1}>
                                <td>{index+1}</td>
                                <td>{element}</td>
                                <td>{props.data[index]}</td>
                            </tr>
                        ))
                    }          
                </tbody>
            </table>
        </div>
    )
    
}

export default FinanchialChart;


