import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// styles
import '../styles/ListMenu.css';

function ListList(props) {
  const lists = props.lists;
  const listItems = lists.map((list) =>
    <div
      key={list.id}
      id={list.id}
      className='list-item'
      onClick={props.switchList}
    >
      <span className='list-name'>{list.listName}</span>
      <div id='list-icons'>
        <i className='material-icons list-icon'
          onClick={(e) => {
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            props.deleteList(list.id)
          }}>delete</i>
        <i className='material-icons list-icon'>arrow_right</i>
      </div>
    </div>
  );
  return <div className='list-container'>{listItems}</div>
}

// component to display user lists
export default function ListMenu(props) {

  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [showNewList])

  function switchList(e) {
    let id = (e.currentTarget.id);
    props.switchList(id);
    props.setShowLists(false);
  }

  function showNewListInput() {
    setShowNewList(true);
  }

  function addList(e) {
    let name = newListName;
    let newListID = uuidv4();
    const newList = {
      id: newListID,
      createdTime: Date.now(),
      default: false,
      listName: name,
      items: []
    };
    let newLists = {...props.dbUser.lists}
    newLists[newListID] = newList;
    // add the new list to state and DB
    props.updateLists(newLists);
    // reset the add input and hide
    setNewListName('');
    setShowNewList(false);
  }

  function updateNewListName(e) {
    setNewListName(e.target.value)
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13 && e.target.value) {
      addList();
    }
  }

  return (
    <>
      {props.dbUser && <div className={`list-menu slide-in-bottom`}>
        <h3 id='list-menu-title'>My Lists</h3>
        <ListList
          lists={Object.values(props.dbUser.lists)}
          switchList={switchList}
          deleteList={props.deleteList}
        />
        {showNewList && <div className='list-item'>
          <input
            className='new-list-input'
            ref={inputRef}
            onChange={updateNewListName}
            onKeyDown={handleKeyDown}
            placeholder='New List...'
            value={newListName}
          />
          {!newListName && <i className='material-icons list-icon'
            onClick={() => setShowNewList(false)}>close</i>}
          {newListName && <i className='material-icons list-icon'
            onClick={addList}>add_circle_outline</i>}
        </div>}
        <div id='add-list'
          className='list-item'
          onClick={showNewListInput}>
          <span>Add New List</span>
          <i className='material-icons list-icon'>add_circle_outline</i>
        </div>
      </div>}
    </>
  )
}