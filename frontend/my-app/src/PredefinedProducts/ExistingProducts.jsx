import React from "react";
import SmallMenu from '../SmallMenu/SmallMenu'
import ProductForm from './ProductForm'

let PredefinedProductsManager = (props) =>{

    let [predefinedProducts, ppSet] = React.useState(null)
    let [productProps, setProductProps] = React.useState(null)
    let componentInserts = props.insertable
    let actionsEnabled = props.actions;

    React.useEffect(()=>{
        fetch('./products').then(response=>response.json()).then(data=>{
            ppSet(data.data)
        })
    },[])

    let deleteProduct=()=>{

    }

    return(
        (predefinedProducts===null) ? <div><h4>Loading...</h4></div>:        
        <div> 
            <table className='table table-hover'>
                <thead className='table-active'>
                    <tr className='app-data-table-row'>
                        <th>#</th>
                        <th>Name</th>
                        <th>UM number</th>
                        <th>Price per item</th>
                        <th>Tax</th>
                        <th>Description</th>
                        <th></th>
                    </tr>    
                </thead>               
                <tbody className='clients-table-body app-data-table-body'>
                {
                    predefinedProducts.length>0 ? 
                    predefinedProducts.map((element, index)=>(
                        <tr key={index} className='clients-table-row app-data-table-row'>
                            <td>{index+1}</td>
                            <td>{element.pp_name}</td>
                            <td>{element.pp_um}</td>
                            <td>{element.pp_price_per_item} RON</td>
                            <td>{element.pp_tax}%</td>
                            <td>{element.pp_description}</td>
                            <td>   
                                {
                                    actionsEnabled===true&&
                                    <div className='actions-container'>                                    
                                        <SmallMenu items={[
                                            {name:"Edit", icon:"edit", disabled: false, clickAction:()=>{setProductProps({product_id:element.id, product_name: element.pp_name, product_um: element.pp_um, product_price: element.pp_price_per_item, product_tax:element.pp_tax, product_description:element.pp_description})}}, 
                                            {name:"Delete", icon:"delete", disabled:false, clickAction:()=>{deleteProduct()}}
                                        ]}/>
                                    </div> 
                                } 
                                {
                                    componentInserts===true&&
                                    <button className="btn btn-success btn-sm" style={{padding:'0', width:'26px', height:'26px'}} onClick={()=>{
                                        props.addElement({
                                            name:element.pp_name, 
                                            price: element.pp_price_per_item, 
                                            um: element.pp_um,
                                            tax: element.pp_tax,
                                            id: element.id
                                        })
                                    }}><span className="material-icons-outlined">add</span></button>
                                }
                            </td>
                        </tr>
                    )):""
                }
                </tbody>
            </table>
            {predefinedProducts.length==0 ? <div style={{textAlign:"center", width:"100%"}}><h4 >No data</h4></div> : ""}
            {productProps!=null &&
                <div> 
                    <div className="blur-overlap"></div>     
                    <div className="overlapping-component-inner">
                        <div className="overlapping-component-actions">
                            <span className="bd-lead">Edit product</span>
                            <button type="button" className="action-close-window " onClick={()=>{setProductProps(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                        </div>
                        <div class="col-lg-6">
                            <p class="lead">Change the properties of existing products by modifying the desired field and clicking Submit<br/></p>
                        </div>
                        <ProductForm data={productProps}/> 
                    </div>              
                </div>
            }      
        </div>
    )

}

export default PredefinedProductsManager