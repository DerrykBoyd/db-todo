import React, { useEffect } from 'react';
import './ListMenu.css';

// component to display user lists
export default function ListMenu(props) {

    return (
        <div className={`list-menu slide-in-bottom`}>
            <h3 id='list-menu-title'>My Lists</h3>
            <p>Todo - Add multiple list functionality</p>
            <p>---</p>
            <p>Logic for multiple list in DB</p>
            <p>update state with multiple lists</p>
            <p>Pass lists to this component</p>
            <p>Highlight currently selected list</p>
        </div>
    )
}