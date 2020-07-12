import React from 'react';

// styles
import '../styles/TodoAdd.css';
import FilteredItems from './FilteredItems';

export default function TodoAdd(props) {
    return (
        <div className="todo-add-footer">
            <div className='todo-add-wrapper'>
                <FilteredItems
                  filtered={props.filtered}
                  handleFilteredClick={props.handleFilteredClick}
                />
                <div className="todo-add-btm">
                    <input type="text"
                        className='todo-add-input'
                        value={props.newItem}
                        placeholder="New Item"
                        onChange={props.handleNewChange}
                        onKeyDown={props.handleLocalAdd}>
                    </input>
                </div>
                <div className="todo-add-btn"
                    onClick={props.handleLocalAdd}>
                    <i className="material-icons">add</i>
                </div>
                <div className="todo-menu-btn"
                    onClick={props.toggleLists}>
                    {!props.showLists && <i className="material-icons">menu</i>}
                    {props.showLists && <i className="material-icons">close</i>}
                </div>
            </div>
        </div>
    )
}