import React from 'react';
import TodoItem from './TodoItem';

export default function TodoList(props) {

  return (
    <section className="todo-items" id="todo-items">
      {props.items.map(item => {
        return <TodoItem
          key={item._id}
          item={item}
          checked={item.completed}
          handleItemUpdate={props.handleItemUpdate}
          handleLocalAdd={props.handleLocalAdd}
          handleItemChange={props.handleItemChange}
          handleChecked={props.handleChecked}
          deleteItem={props.deleteItem}>
        </TodoItem>
      })}
    </section>
  )
}