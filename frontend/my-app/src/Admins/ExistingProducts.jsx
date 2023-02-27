import { useState, useEffect } from 'react'
import ProductForm from './ProductForm'
import Snackbar from '../Snackbar/Snackbar.jsx'

let PredefinedProductsManager = (props) =>{

    let [predefinedProducts, ppSet] = useState(null)
    let [snackBarText, setSnackBarText] = useState(null)
    let [active, setActive] = useState(null)

    useEffect(()=>{
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

    let deleteProduct=(productID)=>{
        fetch(`http://localhost:3000/products/${productID}`,
        {
            method:"DELETE"
        })
        .then(response=>response.json())
        .then(data=>{
            if(data.status==="OK"){
                setSnackBarText("Produs sters")
            }else if(data.status==="SERVER_ERROR"){
                setSnackBarText("Baza de date nu poate fi accesata")
            }else{
                setSnackBarText("Eroare!")
            }
        })
    }

    return(
        <div className="app-data-container">            
            {predefinedProducts===null ? <div><span>Loading...</span></div>:        
                <div> 
                    <div style={{overflowY:'scroll', maxHeight:'80vh'}} >
                        {!active &&
                            <div className='bordered-container'>
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
                                    <tbody>
                                    {predefinedProducts.length>0 ? 
                                        predefinedProducts.map((element, index)=>(
                                            <tr key={index} className='clients-table-row app-data-table-row'>
                                                <td className="centered-text-in-td">{index+1}</td>
                                                <td>{element.pp_name}</td>
                                                <td>{element.pp_um}</td>
                                                <td>{element.pp_price_per_item} RON</td>
                                                <td>{element.pp_tax}%</td>
                                                <td>{element.pp_description}</td>
                                                <td className="table-actions-container">
                                                    <button title="Sterge" onClick={()=>{deleteProduct(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">delete</span></div></button>
                                                    <button title="Editeaza" onClick={()=>{setActive(element.id)}}><div class="inner-button-content"><span class="material-icons-outlined">task_alt</span></div></button>
                                                </td>                  
                                            </tr>
                                        )):""
                                    }
                                    </tbody>
                                </table>
                            </div>
                        }
                        {active&&
                            <div className='bordered-container overview-container'>
                                <button style={{border:'none', borderRadius:'6px', display:'flex', alignItems:'center', margin:'10px'}} onClick={()=>{setActive(null)}}><span class="material-icons-outlined">arrow_back</span>Inchide</button>
                                <ProductForm productID={active}/>      
                            </div>                       
                        }
                    </div>  
                </div>
            }
            <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
        </div>
    )

}

export default PredefinedProductsManager