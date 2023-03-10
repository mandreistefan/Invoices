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

    return(
        <div className='p-3'>            
            {predefinedProducts===null ? <div><span>Loading...</span></div>: 
                <div style={{overflowY:'scroll', maxHeight:'80vh', width:'100%'}} >
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
                                                <button title="Aplica" onClick={()=>{props.addElement({id:element.id, name: element.pp_name, um: element.pp_um, price: element.pp_price_per_item, tax:element.pp_tax, description:element.pp_description})}}><div class="inner-button-content"><span class="material-icons-outlined">done</span></div></button>                                                    
                                            </td>                  
                                        </tr>
                                    )):""
                                }
                                </tbody>
                            </table>
                        </div>
                    }
                </div> 
            }
            <Snackbar text={snackBarText} closeSnack={()=>{setSnackBarText(null)}}/>
        </div>
    )

}

export default PredefinedProductsManager