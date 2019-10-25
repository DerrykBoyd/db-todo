import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import db, { addItem } from './db';
import TodoItem from './Components/TodoItem';

function App() {

  

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("")

  const handleSubmit = (e) => {
    let itemToAdd = {
      _id: new Date().toISOString(),
      todo: newItem,
      completed: false,
    }
    addItem(itemToAdd)
    setItems([...items, itemToAdd]);
    setNewItem("");
    e.preventDefault();
  }

  useEffect(() => {
    let blankTodo = {
      _id: new Date().toISOString(),
      todo: "",
      completed:false,
    }
    function getData() {
      db.allDocs({ include_docs: true }).then(res => {
        let items = res.rows.map(row => row.doc);
        setItems([blankTodo, ...items])
      });
    }
    getData();
  }, [])

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
