import React from "react";
import ExistingProducts from './ExistingProducts.jsx'
import Snackbar from '../Snackbar/Snackbar.jsx'
import './ProductInsert.css'
import ProductForm from "./ProductForm.jsx";

let Products=()=>{   

    let [addProduct, setaddProduct]=React.useState(false)

    return(
        <div>
            <div className="app-submenu-selector">
                <button id="add-client" onClick={()=>{setaddProduct(true)}}><span className="button-label"><span className="material-icons-outlined">add</span>Add product</span></button>
            </div>

            <div className="app-data-container">
                <h1 className="info-text-header">Predefined products</h1>
                <div className="info-text-box">                                
                    <p className="lead">Provides an overview of all predefined products. Editing a predefined product will NOT overwrite data in existing invoices.</p>
                </div>
                <div className="available-products invoice-products-container form-group"> 
                    <p class="lead">Products</p>            
                    <ExistingProducts insertable={false} actions={true}/>

                    {addProduct &&
                        <div> 
                            <div className="blur-overlap"></div>     
                            <div className="overlapping-component-inner">
                                <div className="overlapping-component-actions">
                                    <span className="bd-lead">Add a product</span>
                                    <button type="button" className="action-close-window " onClick={()=>{setaddProduct(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                                </div>
                                <div class="col-lg-6">
                                    <p class="lead">Add a new predefined product that can be quickly added to an invoice<br/></p>
                                </div>
                                <ProductForm/> 
                            </div>              
                        </div>
                    }                               
                </div>
            </div>
        </div>


    )    

}

export default Products
