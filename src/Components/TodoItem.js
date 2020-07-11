import React, { useState, useEffect, useRef } from 'react';

// styles
import '../styles/TodoItem.css';

export default function TodoItem(props) {

    const [showPopup, setShowPopup] = useState(false);
    const [showClose, setShowClose] = useState(false);
    const [showDrag, setShowDrag] = useState(true);

    const prevValue = useRef();

    useEffect(() => {
      prevValue.current = props.item.todo;
      // save to db if not blurred before unmount
      return () => {
        if (props.item.todo !== prevValue.current) {
          let newLists = {...props.dbUser.lists}
          props.updateLists(newLists)
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const showMenu = () => {
        if (!showPopup) {
            setShowPopup(true)
            setShowClose(true)
            setShowDrag(false)
        }
        // else hide()
    }
    const hideClose = () => {
        setShowClose(false)
        setShowDrag(true)
    }

    const hidePopup = () => {
        setShowPopup(false);
        hideClose();
    }

    const toggleChecked = () => {
        hidePopup();
        props.handleChecked(props.item);
    }

    const ref = useRef(null);

    const handleClickOutside = (e) => {
        if (showPopup) {
            if (ref.current && !ref.current.contains(e.target)) {
                hidePopup();
            }
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    })

    return (
        <div className="todo-item-wrapper" data-id={props.item.id}>
            <i onClick={toggleChecked}
                className={`material-icons checkbox ${props.checked ? "hidden" : ''}`}>check_box_outline_blank</i>
            <i onClick={toggleChecked}
                className={`material-icons checkbox ${!props.checked ? "hidden" : ''}`}>check_box</i>
            <input type="text"
                className={`todo-item ${props.checked ? "todo-checked" : ''}`}
                placeholder="Todo"
                key={props.item.id}
                id={props.item.id}
                onChange={props.handleItemChange}
                onKeyDown={props.handleItemUpdate}
                onBlur={() => {
                  if (props.item.todo !== prevValue.current) {
                    let newLists = {...props.dbUser.lists}
                    props.updateLists(newLists)
                    prevValue.current = props.item.todo;
                  }
                }}
                value={props.item.todo}>
            </input>
            <div className='overflow-icons'>
                <i className={`material-icons md-light ${props.checked ? "md-inactive" : ''} ${showDrag ? null : "hidden"}`}
                    onClick={showMenu}>more_vert</i>
                <i className={`material-icons ${showClose ? '' : "hidden"}`}
                    onClick={hideClose}>close</i>
                <div className="item-menu-wrap">
                    <div
                        ref={ref}
                        className={`item-menu scale-in-br ${showPopup ? '' : "hidden"}`}>
                        <i className="material-icons"
                            onClick={() => props.deleteItem(props.item)}>delete</i>
                        <i className="material-icons"
                            onClick={toggleChecked}>check</i>
                    </div>
                </div>
            </div>
            <i className={`material-icons md-light handle ${props.checked ? "md-inactive" : ''}`}
            >drag_handle</i>
        </div>
    );
};