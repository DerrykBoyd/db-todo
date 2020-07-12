import React, { useEffect } from 'react';

// Components
import ListMenu from './ListMenu';
import TodoList from './TodoList';
import TodoAdd from './TodoAdd';

// component to display user lists
export default function Lists(props) {

  useEffect(() => {
    document.title = 'Todo-My Lists'
  }, []);

  const toggleLists = () => {
    let cur = props.showLists;
    props.setShowLists(!cur);
  }

  return (
    <div className={`App Lists`}>
      {props.dbUser &&
        <>
          <TodoList
            currentListID={props.currentListID}
            dbUser = {props.dbUser}
            deleteItem={props.deleteItem}
            handleItemUpdate={props.handleItemUpdate}
            handleLocalAdd={props.handleLocalAdd}
            handleItemChange={props.handleItemChange}
            handleChecked={props.handleChecked}
            setDbUser={props.setDbUser}
            updateLists={props.updateLists}
          >
          </TodoList>
          <TodoAdd
            filtered={props.filtered}
            handleFilteredClick={props.handleFilteredClick}
            handleNewChange={props.handleNewChange}
            handleLocalAdd={props.handleLocalAdd}
            newItem={props.newItem}
            showLists={props.showLists}
            toggleLists={toggleLists}>
          </TodoAdd>
          {props.showLists &&
            <ListMenu
              createList={props.createList}
              dbUser={props.dbUser}
              updateLists={props.updateLists}
              deleteList={props.deleteList}
              switchList={props.switchList}
              setShowLists={props.setShowLists}
            />
          }
        </>
      }
    </div>
  )
}