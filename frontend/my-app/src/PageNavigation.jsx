import React from "react";

/**
 * Renders pagination
 * @param {Object<{numberOfItems: integer, changePage:function}>} props numberOfItems is the number of elements to be displayed(to calculate the total number of pages), changePage(page) is a function to be called when the page changes(currently used to modify the page parameter of the query state object)
 * @returns 
 */

let PageNavigation=(props)=>{

    const step=25

    let [pagination, setPagination] = React.useState({
        currentPage: 1,
        numberOfPages: 1
    })

    let [pages, setPages] = React.useState([])

    //based on number of total elements, set the pages
    let numberOfPages=(itemsNumber)=>{
        let numberOfPages = itemsNumber%step>0 ? parseInt(itemsNumber/step+1) : parseInt(itemsNumber/step)
        buildPagesArray(numberOfPages)
        return numberOfPages
    }

    //the 123..N pages array
    let buildPagesArray=(numberOfPages)=>{
        let pages=[]
        for(let i=1; i<=numberOfPages; i++){
            pages.push(<li key={i} className={pagination.currentPage===i ? "page-item disabled" : "page-item"}><a className="page-link" href="#" onClick={()=>{changePage(i)}}>{i}</a></li>)
        }
        setPages(pages)
    }

    let changePage=(pageNumber)=>{
        let shallowCopy = pagination
        //change the pageNumber in the shallow copy
        shallowCopy.currentPage=pageNumber
        //overwrite the data
        setPagination(shallowCopy)
        //call the props function; should re-fetch data based on the new page number
        props.changePage(pageNumber)
    }
    
    React.useEffect(()=>{
        setPagination({
            currentPage: pagination.currentPage || 1, 
            numberOfPages: numberOfPages(props.numberOfItems)
        })
    },[props.numberOfItems, pagination.currentPage])

    return(
        <nav key={props.numberOfItems} className='page-navigation' aria-label="Navigation">
            <ul className="pagination">
                {pages}
            </ul>
        </nav>
    )

}

export default PageNavigation