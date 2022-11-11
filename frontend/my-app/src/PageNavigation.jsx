import React from "react";

let PageNavigation=(props)=>{

    let [pagination, setPagination] = React.useState({
        currentPage: 1,
        numberOfPages: 1
    })

    let [pages, setPages] = React.useState([])

    //based on number of total elements, set the pages
    let numberOfPages=(itemsNumber)=>{
        let numberOfPages = itemsNumber%10>0 ? parseInt(itemsNumber/10+1) : parseInt(itemsNumber/10)
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
        pagination.numberOfPages>1&&
        <nav key={props.numberOfItems} aria-label="Page navigation example">
            <ul className="pagination">
                {pages}
            </ul>
        </nav>
    )

}

export default PageNavigation