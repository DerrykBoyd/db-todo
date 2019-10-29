import React, {useState, useEffect, useRef} from 'react';
import './TodoItem.css';

export default function TodoItem(props) {

    const [showPopup, setShowPopup] = useState(false);
    const [showClose, setShowClose] = useState(false);
    const [showDrag, setShowDrag] = useState(true);

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
        <div className="todo-item-wrapper">
            <i  onClick={toggleChecked}
                className={`material-icons ${props.checked ? "hidden" : ''}`}>check_box_outline_blank</i>
            <i  onClick={toggleChecked} 
                className={`material-icons checked ${!props.checked ? "hidden" : ''}`}>check_box</i>
            <input  type="text"
                    className={`todo-item ${props.checked ? "todo-checked" : ''}`}
                    placeholder="New Todo"
                    id={props.item._id}
                    onChange={props.handleItemChange}
                    onKeyDown={props.handleItemUpdate}
                    onBlur={props.handleItemUpdate}
                    value={props.item.todo}>
            </input>
            <div>
                <i className={`material-icons md-18 md-light md-inactive ${showDrag ? null : "hidden"}`}
                    onClick={showMenu}>drag_indicator</i>
                <i className={`material-icons md-18 ${showClose ? '' : "hidden"}`}
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
        </div>
    );
};