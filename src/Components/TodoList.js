import React from 'react';
import TodoItem from './TodoItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

export default function TodoList(props) {

  const SortableItem = SortableElement(({ item }) => (
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
  ));

  const SortableList = SortableContainer(({ items }) => {
    return (
      <ul>
        {items.map((item, index) => (
          <SortableItem key={item._id} index={index} item={item} />
        ))}
      </ul>
    )
  })

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
        onSortEnd={onSortEnd}
        useDragHandle
      />
    </section>
  )
}