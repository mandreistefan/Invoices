import React from "react";
import SmallMenu from '../SmallMenu/SmallMenu'
import Snackbar from '../Snackbar/Snackbar.jsx'
import ProductForm from "./ProductForm.jsx";

let Products=()=>{   

    const defaultFilter={filter:"all", filterBy:"", page:1}
    let [query, setFilter] = React.useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    let [predefinedProducts, ppSet] = React.useState([])
    let [productProps, setProductProps] = React.useState(null)
    let [snackBarText, setSnackBarText] = React.useState(null)
    let [addproductWindow, setaddproductWindow] = React.useState(false)

    React.useEffect(()=>{
        fetch(`http://localhost:3000/products?filter=${query.filter}&filterBy=${query.filterBy}&page=${query.page}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                ppSet(data.data)
            }else if(data.status==="SERVER_ERROR"){
                setSnackBarText("Baza de date nu poate fi accesata")
            }else{
                setSnackBarText("Eroare")
            }
        }).catch(error=>{
            setSnackBarText("Eroare")
        })
    },[query])

    let resetSearch=()=>{
        document.getElementById("filterData").value=""
        setFilter({...query, filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    }

    let changePage=(pageNumber)=>{
        setFilter({...query, page:pageNumber})
    }

    let deleteProduct=()=>{

    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...query, filter:"search", filterBy:searchTermStringified})
    }

    return(
        <div>
            <div class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-end mb-md-0"> 
                <button className="btn btn-primary btn-sm no-shadow navigation-button" onClick={()=>{setaddproductWindow(true)}}><div class="inner-button-content"><span class="material-icons-outlined">add</span>Adauga</div></button>                                                   
            </div>              
            {addproductWindow&&
            <div>
                <div className="blur-overlap"></div>     
                <button type="button" className="action-close-window" onClick={()=>{setaddproductWindow(false)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button>
                <div className="overlapping-component-inner">
                    <ProductForm/>
                </div>
            </div>}
            <div className="products-container" style={{marginTop:'25px'}}>            
                {predefinedProducts &&       
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
                                                <div className='actions-container'>                                    
                                                    <SmallMenu items={[
                                                        {name:"Edit", icon:"edit", disabled: false, clickAction:()=>{setProductProps({product_id:element.id, product_name: element.pp_name, product_um: element.pp_um, product_price: element.pp_price_per_item, product_tax:element.pp_tax, product_description:element.pp_description})}}, 
                                                        {name:"Delete", icon:"delete", disabled:false, clickAction:()=>{deleteProduct()}}
                                                    ]}/>
                                                </div>
                                            } 
                                        </td>
                                    </tr>
                                )):"Nu exista produse"
                            }
                            </tbody>
                        </table>
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
        </div>
    )    

}

export default Products
