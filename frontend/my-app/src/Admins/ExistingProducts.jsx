import React from "react";
import SmallMenu from '../SmallMenu/SmallMenu'
import ProductForm from './ProductForm'
import Snackbar from '../Snackbar/Snackbar.jsx'

let PredefinedProductsManager = (props) =>{

    let [predefinedProducts, ppSet] = React.useState(null)
    let [productProps, setProductProps] = React.useState(null)
    let [snackBarText, setSnackBarText] = React.useState(null)
    let componentInserts = props.insertable
    let actionsEnabled = props.actions;

    React.useEffect(()=>{
        fetch('http://localhost:3000/products').then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                ppSet(data.data)
            }else if(data.status==="SERVER_ERROR"){
                setSnackBarText("Baza de date nu poate fi accesata")
            }else{
                setSnackBarText("Eroare")
            }
        })
    },[])

    let deleteProduct=()=>{

    }

    return(
        <div className="products-container">            
            {predefinedProducts===null ? <div><span>Loading...</span></div>:        
                <div className="app-data-container"> 
                    <h6>Produse</h6>
                    <table className='table table-hover table-sm app-data-table'>
                        <thead className='table-active'>
                            <tr className='app-data-table-row table-active'>
                                <th></th>
                                <th>NUME</th>
                                <th>UM</th>
                                <th>PRET</th>
                                <th>TAXA</th>
                                <th>DESCRIERE</th>
                                <th></th>
                            </tr>    
                        </thead>               
                        <tbody className='clients-table-body app-data-table-body'>
                        {predefinedProducts.length>0 ? 
                            predefinedProducts.map((element, index)=>(
                                <tr key={index} className='clients-table-row app-data-table-row'>
                                    <td className="centered-text-in-td">{index+1}</td>
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
                    {predefinedProducts.length===0 ? <div style={{textAlign:"center", width:"100%"}}><h4 >No data</h4></div> : ""}
                    {productProps!=null &&
                        <div> 
                            <div className="blur-overlap"></div>    
                            <button type="button" className="action-close-window " onClick={()=>{setProductProps(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button> 
                            <div className="overlapping-component-inner">
                                <span><b>Editare produs</b></span>
                                <ProductForm data={productProps}/> 
                            </div>              
                        </div>
                    }      
                </div>
            }
            <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
        </div>
    )

}

export default PredefinedProductsManager