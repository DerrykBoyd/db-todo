import React from 'react';
import './TodoItem.css';

export default function TodoItem(props) {
    return (
        <div className="todo-item"
            contentEditable data-placeholder="New Todo"
            suppressContentEditableWarning>{props.item.todo}</div>
    );
};