import React from "react";
import DatePicker from "react-datepicker";

let MultipleDatePicker=(props)=>{

    const [startDate, setStartDate] = React.useState(new Date());
    let [selectedDates, setSelectedDates]=React.useState([])

    let someFunction=(date)=>{
        let currentDates = selectedDates
        currentDates.push(date)
        console.log(selectedDates)
        setSelectedDates(currentDates)
        setStartDate(date)
    }
    
    let removeThis=(index)=>{
        let currentDates = selectedDates
        currentDates.shift()
        console.log(selectedDates)
        setSelectedDates(currentDates)
    }


    return(
        <div>
            <DatePicker
                selected={startDate}
                onChange={(date) => someFunction(date)}
                inline
                isClearable
                excludeDates={selectedDates}
            />            
            <div key={selectedDates.length}>
                {selectedDates.map((element, index)=>(
                    <div>
                        <span>{element.getDate()}</span>
                        <button onClick={()=>{removeThis(index)}}>X</button>
                    </div>
                ))}
            </div>            
        </div>
    )
}

export default MultipleDatePicker