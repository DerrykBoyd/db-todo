import React, { useState } from 'react'

export default function ListSettingsModal(props) {

  const listName = props.dbUser.lists[props.currentListID].listName;

  const [newName, setNewName] = useState(listName);

  const handleKeyDown = (e) => {
    // submit on enter
    if (e.key === 'Enter') {
      props.setListModal(false)
      props.updateListName(newName)
    }
  }

  return (
    <>
      <div className='modal-overlay'></div>
      <div className='modal-wrapper'>
        <div className='modal-container card logout-modal'>
          <h3>List Settings</h3>
          <div className='list-name-change'>
            <span>Name</span>
            <input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
              }}
              onKeyDown={handleKeyDown}
            ></input>
          </div>
          <div className='btn-container'>
            <button className='btn btn-del-text'
              onClick={() => props.setListModal(false)}>Cancel</button>
            <button className='mat-btn'
              onClick={() => {
                props.setListModal(false)
                props.updateListName(newName)
              }}
            >Save</button>
          </div>
        </div>
      </div>
    </>
  )
}
