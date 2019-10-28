import React from 'react';
import './TodoAdd.css';

export default function TodoAdd(props) {
    return (
        <div className="todo-add">
            <input type="text"
                className="todo-add-btm"
                value={props.newItem}
                placeholder="New Todo"
                onChange={props.handleNewChange}
                onKeyDown={props.handleLocalAdd}>
            </input>
            <div className="todo-add-btn"
                onClick={props.handleLocalAdd}>
                <p>Add</p>
            </div>
        </div>
    )
}