import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import * as db from './db';
import TodoItem from './Components/TodoItem';

function App() {

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("")

  useEffect(() => {
    // set initial items from the remote DB - only runs once
    function getData() {
      db.remoteDB.allDocs({ include_docs: true }).then(res => {
        let fetchedItems = [];
        res.rows.map(row => fetchedItems.push(row.doc));
        setItems([...fetchedItems]);
      });
    }
    getData();
  }, [])

  // This effect handles changes to the db from other clients
  useEffect(() => {

    const handleRemoteDelete = (id) => {
      let newItems = [...items];
      let delIndex = newItems.findIndex(el => el._id === id);
      if (delIndex === -1) return;
      newItems.splice(delIndex, 1);
      setItems(newItems);
      console.log(`Deleted: ${id}`);
    }

    const handleRemoteUpdate = (doc) => {
      let newItems = [...items];
      let updateIndex = newItems.findIndex(el => el._id === doc._id);
      if (updateIndex !== -1) {
        newItems[updateIndex] = doc;
        setItems(newItems);
        return;
      } else {
        newItems.push(doc);
        setItems(newItems);
      }
    }
    
    let dbSync = db.localDB.sync(db.remoteDB, {
      live: true,
      retry: true,
      include_docs: true,
    }).on('change', (e) => {
      console.log('Database Changed');
      console.log(e);
      let itemChanged = e.change.docs[0];
      if (itemChanged._deleted && e.direction === 'pull') {
        console.log(`Item deleted: ${itemChanged._id}`)
        handleRemoteDelete(itemChanged._id);
      } else if (e.direction === 'pull') {
        // Handle update or insert
        handleRemoteUpdate(itemChanged);
        console.log(`Updataed or Inserted: ${itemChanged._id}`)
      } else {
        console.log('This was a local change');
      }
    }).on('active', () => {
      console.log('sync active')
    }).on('error', () => {
      console.log('Database Error')
    });
    return () => {
      dbSync.cancel();
    };
  }, [items])

  const handleLocalAdd = (e) => {
    let itemToAdd = {
      _id: new Date().toISOString(),
      todo: newItem,
      completed: false,
    }
    db.addItem(itemToAdd)
    setItems([...items, itemToAdd]);
    setNewItem("");
    e.preventDefault();
  }

  // update items in state when typing
  const handleItemChange = (e) => {
    let newItems = [...items];
    let changeIndex = newItems.findIndex(el => el._id === e.target.id);
    newItems[changeIndex].todo = e.target.value;
    setItems(newItems);
  }

  // send updated items to DB when unfocused
  const handleItemUpdate = (e) => {
    let copyItems = [...items];
    // find updated item
    let updatedIndex = copyItems.findIndex(el => el._id === e.target.id);
    if (updatedIndex === -1) return //item not found
    // update item in DB
    db.updateItem(copyItems[updatedIndex]);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="item-wrapper">
          <p>
            My ToDo List
          </p>
          {items.map(item => {
            return <TodoItem
              key={item._id}
              item={item}
              checked={item.completed}
              handleItemUpdate={handleItemUpdate}
              handleItemChange={handleItemChange}>
              </TodoItem>
          })}
          <form onSubmit={handleLocalAdd}>
            <input type="text" value={newItem} placeholder="New Todo"
              onChange={e => setNewItem(e.target.value)}>
            </input>
            <input type="submit" className="add-btn" value="Add Item"></input>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
