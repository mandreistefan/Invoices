import {useState, useEffect} from "react";
import ProductForm from "./ProductForm.jsx";
import Header from '../Header.jsx'
import { useOutletContext } from "react-router-dom";

let Products=()=>{   

    let {...context} = useOutletContext();
    const addSnackbar = context.addSnackbar 
    const port = context.port

    const defaultFilter={filter:"all", filterBy:"", page:1}
    let [query, setFilter] = useState({filter:defaultFilter.filter, filterBy:defaultFilter.filterBy, page:defaultFilter.page})
    let [predefinedProducts, ppSet] = useState(null)
    let [productProps, setProductProps] = useState(null)
    let [addproductWindow, setaddproductWindow] = useState(false)

    useEffect(()=>{
        fetchData()
    },[query])

    function fetchData(){
        fetch(`http://localhost:${port}/products?filter=${query.filter}&filterBy=${query.filterBy}&page=${query.page}`).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                ppSet(data.data)
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem",text: "Baza de date nu poate fi accesata"})
            }else{
                addSnackbar({icon:"report_problem",text: "Eroare"})
            }
        }).catch(error=>{
            addSnackbar({icon:"report_problem",text: "Eroare"})
        })
    }

    let changePage=(pageNumber)=>{
        setFilter({...query, page:pageNumber})
    }

    let deleteProduct=(productID)=>{

        if(window.confirm("Stargeti produsul?") === false) return false

        fetch(`http://localhost:${port}/products/${productID}`, {
            method:"DELETE",
            headers: { 'Content-Type': 'application/json'
        }
        }).then(response=>response.json()).then(data=>{
            if(data.status==="OK"){
                fetchData()
            }else if(data.status==="SERVER_ERROR"){
                addSnackbar({icon:"report_problem", text: "Baza de date nu poate fi accesata"})
            }else{
                addSnackbar({icon:"report_problem",text: "Eroare"})
            }
        }).catch(error=>{
            addSnackbar({icon:"report_problem",text: "Eroare"})
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
            <div className="bordered-container">  
                <Header title="Predefinite" icon="account_circle" refreshData={fetchData} buttons={[{title:"Adauga", action:()=>{setaddproductWindow(true)}, icon:"add", name:"Adauga"}]}/>           
                <div> 
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
                        {predefinedProducts &&  
                            predefinedProducts.map((element, index)=>(
                                <tr key={index} className='clients-table-row app-data-table-row'>
                                    <td>{index+1}</td>
                                    <td>{element.pp_name}</td>
                                    <td>{element.pp_um}</td>
                                    <td>{element.pp_price_per_item} RON</td>
                                    <td>{element.pp_tax}%</td>
                                    <td>{element.pp_description}</td>
                                    <td className="table-actions-container">                            
                                        <button title="Sterge produs" onClick={()=>{deleteProduct(element.id)}}><div className="inner-button-content"><span className="material-icons-outlined">delete</span></div></button>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                    {predefinedProducts===null && context.loadingSpinner}  
                    {predefinedProducts!==null && predefinedProducts.length===0 && <h6 style={{textAlign:'center'}}>Nu exista date</h6>}  
                    {productProps!=null &&
                        <div> 
                            <div className="blur-overlap"></div>    
                            <button type="button" className="action-close-window " onClick={()=>{setProductProps(null)}}><span className='action-button-label'><span className="material-icons-outlined">close</span></span></button> 
                            <div className="overlapping-component-inner">
                                <span><b>Editare produs</b></span>
                                <ProductForm data={productProps} addSnackbar={addSnackbar}/> 
                            </div>              
                        </div>
                    }      
                </div>                
                {addproductWindow&&
                <div>
                    <div className="blur-overlap"></div>     
                        <div className="overlapping-component-inner">
                        <div className='overlapping-component-header'>
                            <span>Predefinit nou</span>
                            <button type="button" className="action-close-window" onClick={()=>{setaddproductWindow(false)}}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <ProductForm addSnackbar={addSnackbar}/>
                    </div>
                </div>}
            </div>
        </div>
    )    

}

export default Products
