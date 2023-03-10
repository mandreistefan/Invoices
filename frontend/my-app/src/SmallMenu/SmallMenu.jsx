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
        <div class="dropdown" ref={carlig}>
            <button onClick={()=>{setVisibility(true)}} className="dropbtn"><span class="material-icons-outlined">more_vert</span></button>
            <div id="myDropdown" className={menuVisible ? "dropdown-content show" : "dropdown-content"} ref={carlig}>
                <h3>Hello</h3>
            </div>
        </div>
    )

}

export default SmallMenu;