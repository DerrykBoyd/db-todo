import React from 'react'

import '../styles/FilteredItems.css';

export default function FilteredItems(props) {
  return (
    <>
      {props.filtered.length !== 0 &&
        <div className='filtered-container'>
          {props.filtered.map(item => (
            <div
              className='filtered-item'
              key={`filter-${item.id}`}
              onClick={() => props.handleFilteredClick(item)}
            >{item.todo}</div>
          ))}
        </div>
      }
    </>
  )
}
