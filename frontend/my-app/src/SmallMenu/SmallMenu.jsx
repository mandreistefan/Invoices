import './SmallMenu.css'
import React from 'react'

let SmallMenu = (props) =>{

    let [menuVisible, setVisibility] = React.useState(false)
    
    React.useEffect(() => {       
        const handleClick = (event) => {  
            //check if the event target is not the HTML element, meaning the click is outside of it
            if(carlig.current && !carlig.current.contains(event.target)){
                setVisibility(false)   
            }                  
        };
    
        //listenes for clicks
        document.addEventListener('click', handleClick);
    
        return () => {
            document.removeEventListener('click', handleClick);
        };

    }, []);

    //link with the html element
    let carlig = React.useRef()

    //an menu button is clicked; close the menu and call the prop function
    let handleButtonClick=(callback)=>{
        setVisibility(false)
        callback() 
    }

    //rise-above class only has z-index>1, so that each menu is above other menus
    //use different logic depending on the status of menuVisible (true if the menu is open and false if not)
    return(       
        <div className="dropdown" ref={carlig}>
            <button onClick={()=>{setVisibility(true)}} className="dropbtn" style={{padding:'2px', display:'flex', alignItems:'center'}}><span className="material-icons-outlined">menu</span></button>
            <div id="myDropdown" className={menuVisible ? "dropdown-content show" : "dropdown-content"} ref={carlig}>     
                {props.buttons.map((element, index)=>(
                    <button key={index} onClick={()=>{element.action()}} style={{display:'flex', alignItems:'center'}}><span className="material-icons-outlined">{element.icon}</span>{element.name}</button>
                ))}             
            </div>
        </div>
    )

}

export default SmallMenu;