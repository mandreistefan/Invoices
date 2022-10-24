import React from 'react'

export default class ProductsTable extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            tableElements: [
                ["", "", "", "", ""]
            ]
        };
    }

    updateTable = (event) =>{
        let position = event.target.getAttribute('position').split(',')
        let items = [...this.state.tableElements]
        items[position[0]][position[1]]=event.target.value;
        this.setState({tableElements: items})
        this.props.setElementTables(items)
    }

    createTableBody = () => {

        let arr=[];
        let currentData =  this.state.tableElements;

        currentData.map((element, index)=>{
            arr.push(
                <tr key={index} id={index}>
                    <td><input type="text" className="product_name form-control-sm" position={[index,0]} autoComplete="off" value={element[0]} onChange={this.updateTable}/></td>
                    <td><input type="text" className="product_um form-control-sm" position={[index,1]} autoComplete="off" value={element[1]} onChange={this.updateTable}/></td>
                    <td><input type="text" className="product_q form-control-sm" position={[index,2]} autoComplete="off" value={element[2]} onChange={this.updateTable}/></td>
                    <td><input type="text" className="product_tax form-control-sm" position={[index,3]} autoComplete="off" value={element[3]} onChange={this.updateTable}/></td>
                    <td><input type="text" className="product_ppu form-control-sm" position={[index,4]} autoComplete="off" value={element[4]} onChange={this.updateTable}/></td>
                </tr>
            )
        })      

        return arr;

    }

    addNewRow = () =>{
        this.setState({tableElements:[...this.state.tableElements,["", "", "", "", ""]]})
    }

    render()
    {
        return(
            <div className="invoices-add-form-products-container">
                <table className="table app-data-table" id="invoice-products-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>UM</th>
                            <th>Quantity</th>
                            <th>Tax</th>
                            <th>Price/ item</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.createTableBody()}
                    </tbody>
                </table>
                <button type="button" className="add-row-button" onClick={this.addNewRow}>Add new row</button>
            </div>
        )
    }

}