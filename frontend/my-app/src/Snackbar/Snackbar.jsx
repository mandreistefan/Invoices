import React from "react";
import './Snackbar.css'

let Snackbar = (props) =>{

    let [snackBar, setSnackBar] = React.useState({text: null})

    React.useEffect(()=>{
        if(props){
            setSnackBar({text:props.text})
        }        
    },[props.text])

    let closeSnack = ()=>{
        setSnackBar({text:null})
        props.closeSnack()
    }

    return(
        snackBar.text!=null&&
        <div className="snackbar-container alert alert-warning">
            {snackBar.text}
            <button type="button" className="close" aria-label="Close" onClick={()=>{closeSnack()}}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    )

}

export default Snackbar