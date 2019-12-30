import React from 'react';
import TodoItem from './TodoItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

const SortableList = SortableContainer(({ items, props }) => {
  return (
    <div>
      {items.map((item, index) => (
        <SortableItem key={item._id} index={index} item={item} props={props} />
      ))}
    </div>
  )
})

const SortableItem = SortableElement(({ item, props }) => (
  <div>
    <TodoItem
      item={item}
      checked={item.completed}
      handleItemUpdate={props.handleItemUpdate}
      handleLocalAdd={props.handleLocalAdd}
      handleItemChange={props.handleItemChange}
      handleChecked={props.handleChecked}
      deleteItem={props.deleteItem}>
    </TodoItem>
  </div>
));

export default function TodoList(props) {

  const onSortEnd = ({oldIndex, newIndex}) => {
    // update items in state
    let newList = arrayMove(props.items, oldIndex, newIndex);
    props.setItems(newList);
    // update localDB
    props.updateItems(newList);
  }

  return (
    <section className="todo-items" id="todo-items">
      <SortableList
        items={props.items}
        props={props}
        onSortEnd={onSortEnd}
        pressDelay={200}
      />
    </section>
  )
}