import React, { useState, useEffect, useRef } from 'react';
import '../Styles/Header.css';
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

  if (!props.userImg || props.userImg === 'undefined') {
    profile = <i
      ref={profileRef}
      className="material-icons profile-img"
      onClick={showProfileMenu}>person</i>
  } else {
    profile = (
      <div>
        <img
          ref={profileRef}
          className="profile-img"
          onClick={showProfileMenu}
          src={props.userImg}
          alt="profile"></img>
          <div className={`profile-menu-wrap ${showMenu ? '' : 'hidden'}`}>
          <div className="profile-menu scale-in-tr" ref={ref}>
            <button
              className="mat-btn"
              value="Logout"
              onClick={props.handleLogout}
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
        {!props.loggedIn && <h1 className='app-title'>dboydgit To-Do</h1>}
        {props.loggedIn &&
          <div
            className="app-title"
          >{props.currentListName}</div>}
        {props.loggedIn && profile}
        
      </div>
    </header>
  )
}