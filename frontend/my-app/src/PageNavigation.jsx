import {useEffect, useState} from "react";

/**
 * Renders pagination
 * @param {Object<{numberOfItems: integer, changePage:function}>} props numberOfItems is the number of elements to be displayed(to calculate the total number of pages), changePage(page) is a function to be called when the page changes(currently used to modify the page parameter of the query state object)
 * @returns 
 */

let PageNavigation=(props)=>{

    const step=10

    let [pagination, setPagination] = useState({
        currentPage: 1,
        numberOfPages: 1,
        pages:[],
        step:10
    })

    let changePage=(pageNumber)=>{
        let shallowCopy = {...pagination}
        //change the pageNumber in the shallow copy
        shallowCopy.currentPage=pageNumber
        //overwrite the data
        setPagination(shallowCopy)
    }

    let changeStep=(event)=>{
        let shallowCopy = {...pagination}
        let pagesNumber = props.numberOfItems%event.target.value>0 ? parseInt(props.numberOfItems/event.target.value+1) : parseInt(props.numberOfItems/event.target.value)
        shallowCopy.step = event.target.value
        shallowCopy.numberOfPages = pagesNumber
        shallowCopy.pages = arrayOfIndexes(pagesNumber)
        if(pagination.currentPage > pagesNumber) shallowCopy.currentPage=pagesNumber
        setPagination(shallowCopy)
    }
    
    function arrayOfIndexes(limit){
        let anArray=[]
        for(let i=1; i<=limit; i++){
            anArray.push(i)
        }
        return anArray
    }

    useEffect(()=>{
        let pagesNumber = props.numberOfItems%step>0 ? parseInt(props.numberOfItems/step+1) : parseInt(props.numberOfItems/step)
        setPagination({
            currentPage: pagination.currentPage || 1, 
            numberOfPages: pagesNumber,
            pages: arrayOfIndexes(pagesNumber),
            step: props.step ? props.step : pagination.step
        })
    },[])

    useEffect(()=>{
        props.changePage(pagination.currentPage, pagination.step)
    },[pagination.currentPage, pagination.step])

    return(   
            <div className='pagination-container' key={pagination.currentPage}>
                    <div style={{display:'inherit', justifyContent:'flex-start', alignItems:'center'}}>
                        <span>Show</span>
                        <select class="form-select" id="pagination" name="pagination" className="m-2" onChange={changeStep} value={pagination.step}>
                            <option value="10">10</option>
                            <option value="25">25</option>
                        </select>
                        <span>elements</span>
                    </div>
                <div style={{display:'inherit', justifyContent:'flex-start', alignItems:'center'}}>
                    <button className="" disabled={parseInt(pagination.currentPage)<2 ? true : false} onClick={()=>{setPagination({...pagination, currentPage:1})}}><span class="material-icons-outlined">first_page</span></button>
                    <button className="" disabled={parseInt(pagination.currentPage)<2 ? true : false} onClick={()=>{setPagination({...pagination, currentPage:pagination.currentPage-1})}}><span class="material-icons-outlined">arrow_back</span></button>
                    <nav key={props.numberOfItems} className='page-navigation' aria-label="Navigation">
                        {pagination.pages!==[]&&
                        <ul className="pagination">
                            {pagination.pages.map((element, i)=>(
                                <li key={element} className={pagination.currentPage===element ? "page-item active" : "page-item"}><div className="page-link" onClick={()=>{changePage(element)}}>{element}</div></li>
                            ))}
                        </ul>
                    }
                    </nav>
                    <button className=""  disabled={pagination.currentPage===pagination.numberOfPages ? true : false} onClick={()=>{setPagination({...pagination, currentPage:pagination.currentPage+1})}}><span class="material-icons-outlined">arrow_forward</span></button>
                    <button className="" disabled={pagination.currentPage===pagination.numberOfPages ? true : false} onClick={()=>{setPagination({...pagination, currentPage:pagination.numberOfPages})}}><span class="material-icons-outlined">last_page</span></button>
                </div>
            </div>
        
    )

}

export default PageNavigation