import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

// Components
import TodoItem from './TodoItem';


const SortableList = SortableContainer(({ items, props }) => {
  if (items) return (
    <div>
      {items.map((item, index) => (
        <SortableItem key={item.id} index={index} item={item} props={props} />
      ))}
    </div>
  )
  else return null
})

const SortableItem = SortableElement(({ item, props }) => (
  <div>
    <TodoItem
      dbUser={props.dbUser}
      item={item}
      checked={item.completed}
      handleItemUpdate={props.handleItemUpdate}
      handleLocalAdd={props.handleLocalAdd}
      handleItemChange={props.handleItemChange}
      handleChecked={props.handleChecked}
      deleteItem={props.deleteItem}
      updateLists={props.updateLists}  
    />
  </div>
));

export default function TodoList(props) {

  let currentList = null;
  if (props.dbUser && props.dbUser.lists[props.currentListID]) {
    currentList = props.dbUser.lists[props.currentListID];
  }


  const onSortEnd = ({ oldIndex, newIndex }) => {
    // update items in state
    let lists = {...props.dbUser}.lists;
    let items = lists[props.currentListID].items;
    lists[props.currentListID].items = arrayMove(items, oldIndex, newIndex);
    // update db
    props.updateLists(lists);
  }

  return (
    <section className="todo-items" id="todo-items">
      {currentList &&
        <SortableList
          items={props.dbUser.lists[props.currentListID].items}
          props={props}
          onSortEnd={onSortEnd}
          pressDelay={200}
        />}
    </section>
  )
}