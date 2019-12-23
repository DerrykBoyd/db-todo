import React, { useEffect } from 'react';
import TodoItem from './TodoItem';
import { ReactSortable, Sortable, MultiDrag } from 'react-sortablejs'

export default function TodoList(props) {

  useEffect(() => {
    let list = document.getElementById('sortable-list')
    let sortable = Sortable.get(list);
    sortable.sort(props.order)
  })


  return (
    <section className="todo-items" id="todo-items">
      <ReactSortable
        id='sortable-list'
        handle='.handle'
        animation={150}
        list={props.items}
        setList={newState => props.setItems(newState)}
        plugins={new MultiDrag()}
        store={{
          get: function () {
            return props.order ? props.order : [];
          },
          set: function (sortable) {
            props.setOrder(sortable.toArray())
          }
        }}
      >
        {props.items.map(item => (
          <TodoItem
            key={item._id}
            item={item}
            checked={item.completed}
            handleItemUpdate={props.handleItemUpdate}
            handleLocalAdd={props.handleLocalAdd}
            handleItemChange={props.handleItemChange}
            handleChecked={props.handleChecked}
            deleteItem={props.deleteItem}>
          </TodoItem>
        ))}
      </ReactSortable>
    </section>
  )
}