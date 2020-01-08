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

    const [showLists, setShowLists] = useState(false);

    const toggleLists = () => {
        let cur = showLists;
        setShowLists(!cur);
    }

    return (
        <div className={`App Lists`}>
            <Header
                handleLogout={props.handleLogout}
                loggedIn={props.loggedIn}
                userImg={props.userImg} />
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
                showLists={showLists}
                toggleLists={toggleLists}>
            </TodoAdd>
            {showLists &&
                <ListMenu />
            }
        </div>
    )
}