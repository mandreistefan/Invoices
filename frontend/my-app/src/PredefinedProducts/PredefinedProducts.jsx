import React from "react";
import ExistingProducts from './ExistingProducts.jsx'
import Snackbar from '../Snackbar/Snackbar.jsx'
import './ProductInsert.css'
import ProductForm from "./ProductForm.jsx";

let Products=()=>{   

    let [addProduct, setaddProduct]=React.useState(false)
    let [activeElement, setActiveElement] = React.useState("overview")

    return(
        <div>
            <div className="app-title-container">
                <h4>Produse</h4>
                <div className="app-submenu-selector">
                    <button id="overview" disabled={activeElement==="overview" ? true : false } onClick={()=>{setActiveElement("overview")}}><span className="button-label"><span className="material-icons-outlined">home</span>Overview</span></button>
                    <button id="add-client" disabled={activeElement==="add" ? true : false } onClick={()=>{setActiveElement("add")}}><span className="button-label"><span className="material-icons-outlined">add</span>Produs nou</span></button>
                </div>
            </div>
            <hr/>

            {activeElement==="overview"&&<ExistingProducts insertable={false} actions={true}/>}
            {activeElement==="add"&&<ProductForm/>}

        </div>


    )    

}

export default Products
