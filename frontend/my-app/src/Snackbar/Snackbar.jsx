import {useState, useEffect} from "react";
import './Snackbar.css'

let Snackbar = (props) =>{

    let [snackBar, setSnackBar] = useState(null)    

    useEffect(()=>{
        if(props.properties){
            let properties = {
                text: props.properties.text,
                icon: props.properties.icon
            }
            setSnackBar(properties)
            setTimeout(()=>{props.closeSnack()}, 5000)            
        }       
    },[])

    return(
        snackBar!==null&&
        <div className="snackbar-container">
            {snackBar.icon && <span class="material-icons-outlined" style={{marginRight:'10px'}}>{snackBar.icon}</span>}
            {snackBar.text}
            <button type="button" className="close" aria-label="Close" onClick={()=>{props.closeSnack()}}>
                <span aria-hidden="true" style={{color:'white'}}>&times;</span>
            </button>
        </div>
    )

}

export default Snackbar