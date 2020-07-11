import React, { useState, useEffect, useRef } from 'react';

// styles
import '../styles/Header.css';

// assets
import logo from '../assets/logo.svg';

export default function Header(props) {

  const [showMenu, setShowMenu] = useState(false);

  const ref = useRef(null);
  let profileRef = useRef(null);

  const handleClickOutside = (e) => {
    if (showMenu) {
      if (ref.current &&
        !ref.current.contains(e.target) &&
        !profileRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  })

  const showProfileMenu = () => {
    if (!showMenu) setShowMenu(true);
  }

  let profile;

  if (!props.dbUser || !props.dbUser.profileURL) {
    profile = <i
      ref={profileRef}
      className="material-icons profile-img"
      onClick={showProfileMenu}>person</i>
  } else {
    profile = (
      <div>
        {props.dbUser && props.dbUser.profileURL && <img
          ref={profileRef}
          className="profile-img"
          onClick={showProfileMenu}
          src={props.dbUser.profileURL}
          alt="profile"></img>}
        <div className={`profile-menu-wrap ${showMenu ? '' : 'hidden'}`}>
          <div className="profile-menu scale-in-tr" ref={ref}>
            <button
              className="mat-btn"
              value="Logout"
              onClick={() => console.log('TODO Logout')}
            >Logout</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <header className="App-header">
      <div className='header-content'>
        <img src={logo} className="App-logo" alt="logo" />
        {!props.dbUser && <h1 className='app-title'>dboydgit To-Do</h1>}
        {props.dbUser && props.dbUser.lists && props.dbUser.lists[props.currentListID] &&
          <div className="app-title" >
            <span>{props.dbUser.lists[props.currentListID].listName}</span>
          </div>}
        <span className='material-icons'>settings</span>
        {props.dbUser && profile}
      </div>
    </header>
  )
}