import React, { useState, useRef, useEffect } from 'react';
import './ListMenu.css';

function ListList(props) {
    const lists = props.lists;
    const listItems = lists.map((list) =>
        <div key={list._id}
            id={list._id}
            className='list-item'
            onClick={props.switchList}>
            <span>{list.listName}</span>
            <div id='list-icons'>
                <i className='material-icons list-icon'
                    onClick={(e) => {
                        e.cancelBubble = true;
                        if (e.stopPropagation) e.stopPropagation();
                        props.deleteList(list._id)
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
        console.log('TODO - switch list on click');
        console.log(e.target.id)
    }

    function showNewListInput() {
        setShowNewList(true);
    }

    function addList(e) {
        console.log('new list add...');
        let name = newListName;
        const newList = {
            _id: new Date().toISOString(),
            default: false,
            listName: name,
            todoItems: []
        };
        // add the new list to state and DB
        props.updateLists(newList);
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
        <div className={`list-menu slide-in-bottom`}>
            <h3 id='list-menu-title'>My Lists</h3>
            <p>Todo - Switch lists on click!</p>
            <ListList lists={props.lists}
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
                {!newListName && <i className='material-icons'
                    onClick={() => setShowNewList(false)}>close</i>}
                {newListName && <i className='material-icons'
                    onClick={addList}>add_circle_outline</i>}
            </div>}
            <div id='add-list'
                className='list-item'
                onClick={showNewListInput}>
                <span>Add New List</span>
                <i className='material-icons'>add_circle_outline</i>
            </div>
        </div>
    )
}