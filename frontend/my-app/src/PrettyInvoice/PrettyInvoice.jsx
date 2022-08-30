import React from "react";
import './PrettyInvoice.css'

let PrettyInvoice = (props) =>{

    let [invoiceData, invoiceDataSetter] = React.useState(null)

    React.useEffect(()=>{
        fetch(`/invoiceGenerator/?filter=invoiceID&filterBy=${props.invoiceNumber}`,
        {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        })
        .then(result=>result.json())
        .then(data=>{
            if(data.status==="OK"){
                invoiceDataSetter(data.data)
            }else{
                console.log("Ups..")
            }
        })
    },[props.invoiceNumber])

    return(
        invoiceData &&
        <div className="pretty-invoice-container">
            <div className="pretty-invoice-header">
                <div className="invoice-info-container">
                    <span>Invoice number<br/><span id="invoice-number">{invoiceData.invoiceProperty.number}</span></span><br/>
                    <span>Invoice date<br/><span id="invoice-date">{invoiceData.invoiceProperty.date}</span></span><br/>
                    <span>Invoice total<br/><span id="invoice-info-total">{invoiceData.invoiceProperty.total.price} RON</span></span><br/>
                </div>
                <div className="company-logo">
                    <img src="/invoice_images/logo.png" />
                </div>
            </div>
            <div className="company-customer-info-container">
                <div className="company-info">
                    <span className="invoice-name">Company Name</span>
                    <span>Company City, Str. Name, 89<br/>County<br/>Country</span>
                    <span>123456789, contact@contact.com</span>
                </div>
                <div className="customer-info">
                    <span className="invoice-name">{invoiceData.invoiceProperty.client_first_name}, {invoiceData.invoiceProperty.client_last_name}</span>
                    <span>
                        <span>{invoiceData.invoiceProperty.client_billing_adress.county}</span><br/>
                        <span>{invoiceData.invoiceProperty.client_billing_adress.city}</span>, <span>{invoiceData.invoiceProperty.client_billing_adress.street}</span>, <span>{invoiceData.invoiceProperty.client_billing_adress.number}</span><br/>
                        <span>{invoiceData.invoiceProperty.client_billing_adress.zip}</span>
                    </span>
                </div>
            </div>
            <div className="billed-products-container">
                <h5>Products</h5>
                <table className="billed-products-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Name</th>
                            <th>UM</th>
                            <th>Quantity</th>                            
                            <th>PPU</th>
                            <th>Tax(%)</th>
                            <th>Tax</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            invoiceData.invoiceProducts.map((element, index)=>(
                            <tr>
                                <td>{index+1}</td>
                                <td>{element.name}</td>
                                <td>{element.um}</td>
                                <td>{element.quantity}</td>
                                <td>{element.ppu}</td>
                                <td>{element.tax_percentage}</td>
                                <td>{element.tax}</td>
                                <td>{element.price}</td>
                            </tr>
                            ))
                        }
                    </tbody>                    
                    <tfoot>
                        <tr className="table-total-summary">
                            <td><b>Total</b></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><b>{invoiceData.invoiceProperty.total.tax} RON</b></td>
                            <td><b>{invoiceData.invoiceProperty.total.price} RON</b></td>
                        </tr>
                    </tfoot>
                </table>                
            </div>
        </div>
    )

}

export default PrettyInvoice;