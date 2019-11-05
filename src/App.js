import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import './Styles/animations.css';
import * as db from './db';
import TodoList from './Components/TodoList';
import TodoAdd from './Components/TodoAdd';
import Header from './Components/Header';
import GoogleLogin from 'react-google-login';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";


function App() {

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("")
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') || false);
  const [userID, setUserID] = useState(localStorage.getItem('userID') || '')
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '')
  const [userImg, setUserImg] = useState(localStorage.getItem('userImg') || '')
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '')

  const getData = () => {
    db.remoteDB.allDocs({ include_docs: true }).then(res => {
      let fetchedItems = [];
      res.rows.map(row => fetchedItems.unshift(row.doc));
      setItems([...fetchedItems]);
    });
  }

  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn)
    localStorage.setItem('userID', userID)
    localStorage.setItem('userEmail', userEmail)
    localStorage.setItem('userImg', userImg)
    localStorage.setItem('userName', userName)

    // set initial items after login with userID for DB name
    if (userID) {
      db.initLocalDB(userID);
      db.initRemoteDB(userID).then(getData());
    }

  }, [loggedIn, userID, userEmail, userImg, userName])

  // This effect handles changes to the db from other clients
  useEffect(() => {

    let dbSync;

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
      } else {
        newItems.unshift(doc);
        setItems(newItems);
      }
    }

    if (loggedIn === 'true') {
      dbSync = db.localDB.sync(db.remoteDB, {
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
    }

    return () => {
      if (loggedIn === 'true') dbSync.cancel();
    };
  }, [items, loggedIn])

  const handleLocalAdd = (e) => {
    // check if event came from keydown but not enter key => do nothing
    if (e.keyCode && e.keyCode !== 13) return;
    // if value empty do nothing
    if (!newItem) return;
    let itemToAdd = {
      _id: new Date().toISOString(),
      todo: newItem,
      completed: false,
    }
    db.addItem(itemToAdd)
    setItems([itemToAdd, ...items]);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    })
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

  // delete item from delete button
  const deleteItem = (item) => {
    db.deleteItem(item).then(() => {
      // remove from local state
      let copyItems = [...items];
      let delInd = copyItems.findIndex(el => el._id === item._id);
      copyItems.splice(delInd, 1);
      setItems(copyItems);
    })
  }

  // send updated items to DB
  const handleItemUpdate = (e) => {
    let copyItems = [...items];
    // find updated item
    let updatedIndex = copyItems.findIndex(el => el._id === e.target.id);
    if (updatedIndex === -1) return //item not found
    // check if deleted and process
    if (e.keyCode === 8 && !e.target.value) {
      // delete item from DB
      db.deleteItem(copyItems[updatedIndex]).then(() => {
        // remove from local state
        copyItems.splice(updatedIndex, 1);
        setItems(copyItems);
      }).catch(err => "Error removing from DB" + err);
    } else {
      db.updateItem(copyItems[updatedIndex]);
    }
    // check if enter and add new blank todo below
    // COME BACK TO THIS WHEN DOING SORTABLE
    // if (e.keyCode === 13) {
    //   let newBlank = {
    //     _id: new Date().toISOString(),
    //     todo: newItem,
    //     completed: false,
    //   }
    //   copyItems.splice(updatedIndex + 1, 0, newBlank);
    //   setItems(copyItems);
    //   db.addItem(newBlank);
    //   return;
    // }
    // update item in DB
  }

  // update newItem state on input change
  const handleNewChange = (e) => {
    setNewItem(e.target.value);
  }

  // update state and DB when item checked
  const handleChecked = (item) => {
    // debugger
    let copyItems = [...items];
    for (let i of copyItems) {
      if (i === item) {
        // debugger
        i.completed = !i.completed;
        db.updateItem(i);
      }
    }
    setItems(copyItems);
  }

  const resGoogle = (res) => {
    setUserID(res.profileObj.googleId);
    setUserEmail(res.profileObj.email);
    setUserImg(res.profileObj.imageUrl);
    setUserName(res.profileObj.name);
    setLoggedIn("true");
  }

  const respGoogleFail = (res) => {
    console.log(res);
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(true);
  }

  // A wrapper for <Route> that redirects to the login
  // screen if you're not yet authenticated.
  function PrivateRoute() {
    return loggedIn !== "true"
      ? (<Redirect to='/login' />)
      : (<Route render={() => <AppPage />} />)
  }

  function PublicRoute() {
    return loggedIn === "true"
      ? (<Redirect to="/" />)
      : (<Route component={LoginPage} />)
  }

  function LoginPage() {
    return (
      <div className='App'>
        <Header logo={logo} />
        <h3>Login with Google</h3>
        <GoogleLogin
          clientId="245694344398-gc2fikf31q0d4kcee70nuqj5lhnmu5u7.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={(res) => resGoogle(res)}
          onFailure={respGoogleFail}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    );
  }

  function AppPage() {
    return (
      <div className='App'>
        <Header
          handleLogout={handleLogout}
          logo={logo}
          loggedIn={loggedIn}
          userImg={userImg} />
        <TodoList
          items={items}
          handleItemUpdate={handleItemUpdate}
          handleLocalAdd={handleLocalAdd}
          handleItemChange={handleItemChange}
          handleChecked={handleChecked}
          deleteItem={deleteItem}>
        </TodoList>
        <TodoAdd
          newItem={newItem}
          handleNewChange={handleNewChange}
          handleLocalAdd={handleLocalAdd}>
        </TodoAdd>
      </div >
    )
  }

  return (
    <Router>
      <Switch>
        <PublicRoute path='/login'>
        </PublicRoute>
        <PrivateRoute exact path='/'>
        </PrivateRoute>
      </Switch>
    </Router>
  );
}

export default App;
