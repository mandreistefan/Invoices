
//calculates the next billing date 
//takes recurrency type and a date as paramenters
//calculates and returns the next date in three formats
function calculateNextInvoiceDate(recurrencyType, recDate){
    //sometimes, the date can be a String; working with object
    if(typeof recDate === 'string'){
        let dateFormat = new Date(recDate)        
        recDate=dateFormat
    }    

    //recurrencyDate info
    let recurrencyDateArray=recDate.toString().split(" ")
    let recurrencyDay=parseInt(recurrencyDateArray[2])
    let recurrencyMonth=recurrencyDateArray[1]
    let recurrencyYear=parseInt(recurrencyDateArray[3])

    console.log(`Date received: ${recurrencyDay}, ${recurrencyMonth}, ${recurrencyYear}`)

    //current day info
    const currentDate = new Date();
    let currentDay=currentDate.getDate();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();

    let invoiceDate=new Date()

    let mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let nextBillingMonth;
    let nextBillingDay;
    let nextBillingYear;

    const dateArr=[
        31, ((currentYear%4===0) ? 27: 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ]

    if(recurrencyType==="monthly-billing"){

        if((recurrencyYear>currentYear)||(mS.indexOf(recurrencyMonth)>currentMonth)||(recurrencyDay>currentDay)){
            nextBillingDay=recurrencyDay
            nextBillingMonth=mS.indexOf(recurrencyMonth)
            nextBillingYear=recurrencyYear
        }else{
            //next billing day
            if(recurrencyDay>dateArr[mS.indexOf(recurrencyMonth)]){
                nextBillingDay=dateArr[mS.indexOf(recurrencyMonth)]
            }else{
                nextBillingDay=recurrencyDay
            }

            //next billing month
            if(currentMonth===mS.indexOf(recurrencyMonth)){
                if(recurrencyDay>currentDay){
                    nextBillingMonth=recurrencyMonth
                }else if(recurrencyDay===currentDay){
                    nextBillingMonth=mS.indexOf(recurrencyMonth)+1
                }else{
                    nextBillingMonth=mS.indexOf(recurrencyMonth)
                }                
            }else{
                nextBillingMonth=mS.indexOf(recurrencyMonth)
            }   

            //next billing year
            if(nextBillingMonth>11){
                nextBillingMonth=0;
                nextBillingYear=currentYear+1
            }else{
                nextBillingYear=currentYear
            }
        }
        
        invoiceDate.setDate(nextBillingDay)
        invoiceDate.setMonth(nextBillingMonth)
        invoiceDate.setFullYear(nextBillingYear)

    }else if(recurrencyType==="yearly-billing"){
        //check if the month is February, make sure there are enough days in the month next year
        if(recurrencyMonth==="Feb"){
            if(recurrencyDay>dateArr[mS.indexOf(recurrencyMonth)]){
                nextBillingDay=dateArr[mS.indexOf(recurrencyMonth)]
            }else{
                nextBillingDay=recurrencyDay
            }
        }else{
            nextBillingDay=recurrencyDay
        }        

        //add one more year, month is unchanged
        nextBillingYear=recurrencyYear+1
        nextBillingMonth=mS.indexOf(recurrencyMonth)

        invoiceDate.setDate(nextBillingDay)
        invoiceDate.setMonth(nextBillingMonth)
        invoiceDate.setFullYear(nextBillingYear)
    }

    return({
        dateAsDate: invoiceDate,
        dateAsString: `${nextBillingDay}/${nextBillingMonth+1}/${nextBillingYear}`,
        dateAsMYSQLString: `${nextBillingYear}-${nextBillingMonth+1}-${nextBillingDay}`
    })

}

function normalDate(date){
    let stringDate = date.toString().split(" ");
    return(`${stringDate[2]} ${stringDate[1]} ${stringDate[3]}`)
}


//prettify the recurrency date, from a xx/yy/zzzz format to a xst/ xnd/ xrd etc of the month format
function normalRecurrenyDate(a, b, c){

    if(a==="monthly-billing"){
        let dateString=b.toString().split(" ")

        if(dateString.length===1){
            if(dateString[2]==="1"){
                return "1st of each month"
            }else if(dateString[2]==="2"){
                return "2nd of each month"
            }else if(dateString[2]==="3"){
                return "3rd of each month"
            }
        }else{
                if(dateString[1]==="1"){
                    return `${dateString[2][0]}1st of each month`
                }else if(dateString[2][1]==="2"){
                    return `${dateString[0]}2nd of each month`
                }else if(dateString[2][1]==="3"){
                    return `${dateString[0]}3rd of each month`
                }else{
                    return `${dateString[2]}th of each month`
                }            
        }
    }else if(a==="yearly-billing"){

        let dateString=c.toString().split(" ");

        if(dateString[2].length===1){
            if(dateString[2]==="1"){
                return `${dateString[1]}, 1st`
            }else if(dateString[2]==="2"){
                return `${dateString[1]}, 2nd`
            }else if(dateString[2]==="3"){
                return `${dateString[1]}, 3rd`
            }
        }else{
            if(dateString[2][1]==="1"){
                return `${dateString[1]}, ${dateString[0]}1st`
            }else if(dateString[2][1]==="2"){
                return `${dateString[1]}, ${dateString[0]}2nd`
            }else if(dateString[2][1]==="3"){
                return `${dateString[1]}, ${dateString[0]}3rd`
            }else{
                return `${dateString[1]}, ${dateString[2]}th`
            }            
        }
        return "NA";
    }

    return "NA";

}

//calculates the next billing date based on recurrency, monthly/ yearly recurrency dates
function nextDate(rec, mo, y){
    if(rec==="monthly-billing"){
        return calculateNextInvoiceDate(rec, mo)
    }else if(rec==="yearly-billing"){
        return normalDate(y)
    }

    return "NA"

}

//process recurrency data for front-end
function procesRecData(data){

    let returnArr = []

    data.forEach(element => {
            returnArr.push({
                rec_number: element.rec_number,
                client_first_name: element.client_first_name,
                client_last_name: element.client_last_name,
                client_county: element.client_county,
                client_city: element.client_city,
                client_street: element.client_street,
                client_adress_number: element.client_adress_number,
                client_zip: element.client_zip,
                invoice_recurrency: element.invoice_recurrency.replace("-", " "),
                invoice_active: element.invoice_active,
                invoice_next_date: element.next_invoice_date
            })       
    });    

    return(returnArr)    
}

//processes raw data from the billed products table for front-end
//[0] - products as array, [1] - total number of products, [2] - total tax
function procesBilledProductsData(data){
    let billedProductsArray=data;
    let processedProductsData=[];
    let taxTotal=0;
    for(let i=0; i<billedProductsArray.length; i++){
        processedProductsData.push({
            entry: billedProductsArray[i].id,
            name: billedProductsArray[i].product_name,
            um: billedProductsArray[i].product_mu,
            quantity: billedProductsArray[i].product_quantity,
            ppu: billedProductsArray[i].product_price,
            tax_percentage: billedProductsArray[i].product_tax_pr,
            tax: billedProductsArray[i].total_tax,
            price: billedProductsArray[i].total_price,
            description:billedProductsArray[i].product_description,
            id: billedProductsArray[i].product_id
        })
        taxTotal=taxTotal+parseFloat(billedProductsArray[i].total_tax);
    }

    return [processedProductsData, billedProductsArray.length, taxTotal];

}

//returns the date in a 01 JAN 2022 format
function simpleDate(aDate){  
    let dateArray=aDate.toString().split(" ")
    return(`${dateArray[2]} ${dateArray[1]} ${dateArray[3]}`)
}

function returnal(status, data){
    return ({
        status: status,
        data:data
    })
}

//returns an 2D array in which each element consists of: [month-as-integer, month, year, number-of-invoices/month, total/ month]
//data comes ordered by date, no need to sort
function parsePeriod(dataArray){
    let mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let periodicalData=[]
    let totalSumForMonth=0
    let invoicesPerMonth=0
    let currentMonth = dataArray[0].invoice_date.toString().split(" ")[1]
    dataArray.forEach((element, index)=>{
        if(index!=dataArray.length-1){
            //current month is initially the first month of the data-array
            //go through the array; if the current element month is equal to the current month, add totals and number of invoices; if the current element month is different, push the sums in the array and reset the sums
            if(currentMonth===element.invoice_date.toString().split(" ")[1]){
                totalSumForMonth = totalSumForMonth+element.invoice_total_sum
                invoicesPerMonth += 1
            }else{
                //push the totals
                periodicalData.push([mS.indexOf(currentMonth)+1, currentMonth, element.invoice_date.toString().split(" ")[3], invoicesPerMonth, totalSumForMonth])
                //reset the totals
                currentMonth = element.invoice_date.toString().split(" ")[1]
                totalSumForMonth=element.invoice_total_sum
                invoicesPerMonth=1 
            }          
        }else{
            //when the element is the final element, always do an array-push 
            if(currentMonth===element.invoice_date.toString().split(" ")[1]){
                totalSumForMonth = totalSumForMonth+element.invoice_total_sum
                invoicesPerMonth += 1
                periodicalData.push([mS.indexOf(element.invoice_date.toString().split(" ")[1])+1, element.invoice_date.toString().split(" ")[1], element.invoice_date.toString().split(" ")[3], invoicesPerMonth, totalSumForMonth])
            }else{
                periodicalData.push([mS.indexOf(element.invoice_date.toString().split(" ")[1])+1, element.invoice_date.toString().split(" ")[1], element.invoice_date.toString().split(" ")[3], 1, element.invoice_total_sum])
            }
        }
    })
    return periodicalData
}


//calculates the total sum and tax for all data in a timespan
function processFinancial(data, expenses, interval){
    //default values
    let returnObj={total:0, total_tax:0, total_net:0, total_number_invoices:1, avg_per_invoice:0, avg_per_step:0, periodicalData:null}
    //step
    let startYear, endYear, startMonth, endMonth, noMonths=0

    startYear = interval.startYear.indexOf(0)==="0" ? parseInt(interval.startYear.substring(1,1)) : parseInt(interval.startYear)
    endYear = interval.endYear.indexOf(0)==="0" ? parseInt(interval.endYear.substring(1,1)) : parseInt(interval.endYear)
    if(endYear-startYear===0){
        startMonth = interval.startMonth.indexOf(0)==="0" ? parseInt(interval.startMonth.substring(1,1)) : parseInt(interval.startMonth)
        endMonth = interval.endMonth.indexOf(0)==="0" ? parseInt(interval.endMonth.substring(1,1)) : parseInt(interval.endMonth)
        noMonths=endMonth-startMonth+1
    }else if(endYear-startYear>0){
        startMonth = interval.startMonth.indexOf(0)==="0" ? parseInt(interval.startMonth.substring(1,1)) : parseInt(interval.startMonth)
        endMonth = interval.endMonth.indexOf(0)==="0" ? parseInt(interval.endMonth.substring(1,1)) : parseInt(interval.endMonth)
        noMonths=endMonth+(12-startMonth)+1+(12*(endYear-startYear-1))
    }

    //no data to process
    if(data.length===0) return returnObj
    //data to process
    let currentInvoice = data[0].invoiceID
    //used to calculate total/ month
    let currentYear= data[0].invoice_date.getFullYear()
    let currentMonth = data[0].invoice_date.getMonth()
    let stepSum = 0
    //format of {month: mm, year: yy, total:total sum for the month}
    let arr=[]
    let totalExpenses=0
    //calculate total expenses
    expenses.forEach(element=>{
        totalExpenses=totalExpenses+element.exp_sum
    })
    //process data - calculate totals and data for the graph
    data.forEach((element, index)=>{
        returnObj.total+=element.total_price
        returnObj.total_tax+=element.total_tax 
        //totals per month
        if(element.invoice_date.getMonth()===currentMonth){
            stepSum=stepSum+element.total_price
        }else{
            arr.push({month: currentMonth+1, year:currentYear, total:stepSum})
            currentMonth=element.invoice_date.getMonth()
            stepSum=element.total_price
        }        
        //number of unique invoices 
        if(element.invoice_number!=currentInvoice){
            returnObj.total_number_invoices=returnObj.total_number_invoices+1
            currentInvoice=element.invoice_number
        }          
    })

    //forEach finished, some data is in stepSum
    arr.push({month: currentMonth+1, year:currentYear, total:stepSum})

    let arr2=[]
    let i=0, iMonth=0, iYear=startYear
    do{
        //the month
        iMonth=i+startMonth>12 ? (i+startMonth)%12 : i+startMonth
        iYear=i+startMonth>12 ? startYear+parseInt((i+startMonth)/12) : startYear
        //console.log(iMonth, iYear)

        arr2.push({month: iMonth, year:2000+iYear, total:0})

        //number of steps
        i=i+1
    }while(i<noMonths)

    //merge the two - arr holds only the months and totals for where there is data; arr2 holds an array that has one element for each month in the interval startmonth, startmonth+number of months
    //merging the two means that for months from arr2 where there is data in arr(those months have invoices), update the totals and send an arr in the format [{month:2, year:2021, total:0},..,{month:2, year:2022, total:342},..]
    arr2.map(element=>{
        arr.map((element2, index)=>{
            if(element.month===element2.month&&element.year===element2.year){
                element.total=element2.total
                arr.splice(index,1)
                return true
            }
        })
    })

    returnObj.total_net=returnObj.total-returnObj.total_tax
    returnObj.total_exp=totalExpenses
    returnObj.avg_per_invoice=returnObj.total/returnObj.total_number_invoices
    returnObj.periodicalData=arr2
    returnObj.avg_per_step=returnObj.total / noMonths

    return returnObj;

}

//calculate the tax based on quantity, tax as percentage and total price of product
function calculateTax(quantity, tax, price){
    let taxTotal = (((parseInt(quantity)*parseFloat(price))/100)*parseFloat(tax))
    taxTotal=taxTotal.toFixed(2)
    return parseFloat(taxTotal)
}

function toCreateInvoice(date, recurrencyType, monthlyDate, yearlyDate){
    if(recurrencyType==="monthly-billing"){
        let nextBillingDate=calculateNextInvoiceDate(recurrencyType, monthlyDate)
        console.log(nextBillingDate)
    }else if(recurrencyType==="yearly-billing"){

    }else{

    }
}

function calculateTotalSum(data){
    let totalSum=0;
    let totalTax=0;
    data.forEach(element=>{
        console.log(element.product_quantity, element.product_tax_pr, element.product_price)
        totalSum=totalSum+(parseFloat(element.product_quantity)*parseFloat(element.product_price))
        totalTax=totalTax+parseFloat(calculateTax(element.product_quantity, element.product_tax_pr, element.product_price))
    })
    return {totalSum: totalSum, totalTax: totalTax};
}

//takes a string as parameter; looks for predefined keys, fetches the data from the string and returns an object
//string should be invoices?page=1&filter=something
//target should be optional, is "invoices"
//keys are page and filter, data is 1 and something
function qParser(dataString){
    //the filterObject
    let filterObject={
        target: null,
        page: 1,
        filter:null,
        filterBy:null
    }
    //split it based on the ampersand
    let query_parameters = dataString.substring(dataString.indexOf("?")+1, (dataString.length)).split("&")
    //populate the object
    query_parameters.forEach(element=>{
        if(element.indexOf("page=")>-1) filterObject.page=element.substring(element.indexOf("=")+1, element.length)
        if(element.indexOf("filter=")>-1) filterObject.filter=element.substring(element.indexOf("=")+1, element.length)
        if(element.indexOf("filterBy=")>-1) filterObject.filterBy=element.substring(element.indexOf("=")+1, element.length)
        if(element.indexOf("target=")>-1) filterObject.target=element.substring(element.indexOf("=")+1, element.length)
    })

    return filterObject
}

module.exports = {
    procesRecData: procesRecData,
    procesBilledProductsData: procesBilledProductsData,
    simpleDate:simpleDate,
    returnal:returnal,
    processFinancial: processFinancial,
    calculateTax: calculateTax,
    toCreateInvoice: toCreateInvoice,
    calculateNextInvoiceDate:calculateNextInvoiceDate,
    calculateTotalSum:calculateTotalSum,
    qParser: qParser
}