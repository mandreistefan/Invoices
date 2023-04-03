import React from "react";
import './PrettyInvoice.css'

let PrettyInvoice = (props) =>{

    let [invoiceData, invoiceDataSetter] = React.useState(null)

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    React.useEffect(()=>{
        fetch(`http://localhost:${port}/invoiceGenerator/?filter=invoiceID&filterBy=${props.invoiceNumber}`,
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
                    <h2>Factura</h2>
                    <span>Numar: <span id="invoice-number"><b>{invoiceData.invoiceProperty.number}</b></span></span><br/>
                    <span>Data: <span id="invoice-date"><b>{invoiceData.invoiceProperty.date}</b></span></span><br/>
                    <span>Total: <span id="invoice-info-total"><b>{invoiceData.invoiceProperty.total.price} RON</b></span></span><br/>
                </div>
                <div className="company-logo">
                    {/* <img style={{width:'50px', height:'50px'}} src="/invoice_images/logo.png" />*/}
                </div>
            </div>
            <div className="company-customer-info-container">
                <div className="company-info">
                    <span className="invoice-name">Numele companiei</span>
                    <span>CIF: RO1234567</span>
                    <span>Reg.com: SER13/123FFR/56AS</span>
                    <span>Adresa: Judet, Oras, Str. Strada firmei, 89, Romania</span>                    
                    <span>Telefon: 123456789</span>
                    <span>Email: contact@contact.com</span>
                    <span>Cont: RO1234BTRL5567889</span>
                    <span>Cota TVA: TBD%</span>
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
                <h5>Produse</h5>
                <table className="billed-products-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nume</th>
                            <th>UM</th>
                            <th>Cantitate</th>                            
                            <th>Pret per unitate</th>
                            <th>TVA(%)</th>
                            <th>Valoare totala</th>
                            <th>TVA</th>
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
                                <td>{element.price}</td>
                                <td>{element.tax}</td>
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
                            <td><b>{invoiceData.invoiceProperty.total.price} RON</b></td>
                            <td><b>{invoiceData.invoiceProperty.total.tax} RON</b></td>
                        </tr>
                    </tfoot>
                </table>                
            </div>
        </div>
    )

}

export default PrettyInvoice;