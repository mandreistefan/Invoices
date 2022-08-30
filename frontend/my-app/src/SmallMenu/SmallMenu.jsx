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
        <div className={ (menuVisible) ? 'small-menu-container rise-above' : 'small-menu-container' } ref={carlig}>
            <div className='handler-bar'><button className='small-menu-button' style={{float:'right'}}onClick={()=>{(menuVisible) ? setVisibility(false): setVisibility(true)}}><span className="material-icons-outlined">{(menuVisible) ? 'arrow_drop_up' : 'arrow_drop_down'}</span></button></div>
            <div className='menu-content'>
                {menuVisible&&
                    props.items.map((element, index)=>(
                        <button key={index} className='small-menu-button' disabled={element.disabled ? true : false} onClick={()=>{handleButtonClick(element.clickAction)}}>                                
                            <div className='inner-button-content'>
                                <span className="material-icons-outlined">{element.icon}</span>{element.name}
                            </div>
                        </button>
                    ))
                }
            </div>
        </div>
    )

}

export default SmallMenu;