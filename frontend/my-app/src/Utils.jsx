
export const normalDate=(date, bool)=>{
    let months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
    let dateObject=new Date(date)
    return bool ? `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}` : `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()}`
}

export const processedDate=(date)=>{
    let dateObject = new Date(date)
    return `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()} - ${dateObject.getHours()<10 ? "0"+dateObject.getHours() : dateObject.getHours()}:${dateObject.getMinutes()<10 ? "0"+dateObject.getMinutes() : dateObject.getMinutes()}:${dateObject.getSeconds()<10 ? "0"+dateObject.getSeconds() : dateObject.getSeconds()}`
}