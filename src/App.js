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
        console.log(res);
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

  const handleSubmit = (e) => {
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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="item-wrapper">
          <p>
            My ToDo List
          </p>
          {items.map(item => {
            return <TodoItem key={item._id} item={item}
              checked={item.completed}></TodoItem>
          })}
          <form onSubmit={handleSubmit}>
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
