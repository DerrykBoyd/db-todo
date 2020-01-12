import React, { useEffect, useState } from 'react';
import Header from './Header';
import TodoList from './TodoList';
import TodoAdd from './TodoAdd';
import ListMenu from './ListMenu';

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
            <Header
                handleLogout={props.handleLogout}
                loggedIn={props.loggedIn}
                userImg={props.userImg}
                currentListName={props.currentListName}
                handleListChange={props.handleListChange} />
            <TodoList
                items={props.items}
                setItems={props.setItems}
                updateItems={props.updateItems}
                handleItemUpdate={props.handleItemUpdate}
                handleLocalAdd={props.handleLocalAdd}
                handleItemChange={props.handleItemChange}
                handleChecked={props.handleChecked}
                deleteItem={props.deleteItem}>
            </TodoList>
            <TodoAdd
                newItem={props.newItem}
                handleNewChange={props.handleNewChange}
                handleLocalAdd={props.handleLocalAdd}
                showLists={props.showLists}
                toggleLists={toggleLists}>
            </TodoAdd>
            {props.showLists &&
                <ListMenu 
                    lists={props.lists}
                    updateLists={props.updateLists}
                    deleteList={props.deleteList}
                    switchList={props.switchList}
                    setShowLists={props.setShowLists}
                />
            }
        </div>
    )
}