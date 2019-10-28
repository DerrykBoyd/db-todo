import React from 'react';
import './TodoItem.css';

export default function TodoItem(props) {
    return (
        <input  type="text"
                className="todo-item"
                placeholder="New Todo"
                id={props.item._id}
                onChange={props.handleItemChange}
                onKeyDown={props.handleItemUpdate}
                onBlur={props.handleItemUpdate}
                value={props.item.todo}>
        </input>
    );
};