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
        fetchData()
    },[query])

    function fetchData(){
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
    }

    let changePage=(pageNumber)=>{
        setFilter({...query, page:pageNumber})
    }

    let deleteProduct=(productID)=>{
        fetch(`http://localhost:3000/products/${productID}`, {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json'
        }
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                fetchData()
            }else if(data.status==="SERVER_ERROR"){
                setSnackBarText("Baza de date nu poate fi accesata")
            }else{
                setSnackBarText("Eroare")
            }
        }).catch(error=>{
            setSnackBarText("Eroare")
        })
    }

    function handleSearchSubmit(event){
        event.preventDefault()
        let searchTerm = event.target.filterData.value
        if(searchTerm.length==0) return false
        let searchTermStringified = searchTerm.replaceAll(" ", "+")
        setFilter({...query, filter:"search", filterBy:searchTermStringified})
    }

    return(
        <div className="app-data-container">  
            <div className="bordered-container" style={{marginTop:'25px'}}>  
                <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} className='p-3'>
                    <h5>Produse sablon</h5>
                    <div className="btn-group">                               
                        <button className='btn btn-light' type="button" onClick={()=>{setaddproductWindow(true)}} title="Adauga" ><div className="inner-button-content"><span className="material-icons-outlined">add</span>Adauga</div></button>
                        <button className='btn btn-light' type="button" onClick={()=>{fetchData()}}  title="Reincarca" ><div className="inner-button-content"><span className="material-icons-outlined">refresh</span></div></button>
                    </div>
                </div>          
                {predefinedProducts &&       
                    <div style={{padding:'10px'}}> 
                        <table className='table'>                            
                            <thead>
                                <tr>
                                    <td>#</td>
                                    <td>Nume</td>
                                    <td>UM</td>
                                    <td>Pret</td>
                                    <td>Taxa</td>
                                    <td>Descriere</td>
                                    <td></td>
                                </tr>
                            </thead>                     
                            <tbody className='clients-table-body app-data-table-body'>
                            {predefinedProducts.length>0 ? 
                                predefinedProducts.map((element, index)=>(
                                    <tr key={index} className='clients-table-row app-data-table-row'>
                                        <td>{index+1}</td>
                                        <td>{element.pp_name}</td>
                                        <td>{element.pp_um}</td>
                                        <td>{element.pp_price_per_item} RON</td>
                                        <td>{element.pp_tax}%</td>
                                        <td>{element.pp_description}</td>
                                        <td className="table-actions-container">                            
                                            <button title="Sterge produs" onClick={()=>{deleteProduct(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
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
                {addproductWindow&&
                <div>
                    <div className="blur-overlap"></div>     
                        <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Predefinit nou</span>
                            <button type="button" className="action-close-window" onClick={()=>{setaddproductWindow(false)}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <ProductForm/>
                    </div>
                </div>}
                <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
            </div>
        </div>
    )    

}

export default Products
