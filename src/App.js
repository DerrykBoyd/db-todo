import React, { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from "react-router-dom";
import './App.css';
import './Styles/animations.css';
import PouchDB from 'pouchdb';
import axios from 'axios';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import Home from './Components/Home';
import Lists from './Components/Lists';

axios.defaults.withCredentials = true;

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => localStorage.getItem('loggedIn') === 'true'
        ? children
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
    />
  )
}

function App() {

  const API_URL = process.env.NODE_ENV === 'development' ?
    'http://localhost:4000' :
    'https://db-todo.duckdns.org/api';

  const DB_HOST = process.env.NODE_ENV === 'development' ?
    'http://localhost:5984' :
    'https://db-todo.duckdns.org/db';

  const [localDB, setLocalDB] = useState(null);
  const [remoteDB, setRemoteDB] = useState(null);
  const [loadingDB, setLoadingDB] = useState(true);
  const [currentList, setCurrentList] = useState('default');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') || "false");
  const [userID, setUserID] = useState(localStorage.getItem('userID') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userImg, setUserImg] = useState(localStorage.getItem('userImg') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  // check if logged in via local
  useEffect(() => {
    axios.get(`${API_URL}/test`).then((res) => {
      console.log(res);
    })
  }, [API_URL])

  // get data from the DB on load
  const getData = useCallback(() => {
    if (!remoteDB) return;
    remoteDB.allDocs({ include_docs: true }).then(res => {
      let filteredRes = res.rows.filter(row => row.doc.listName === currentList);
      if (filteredRes.length) setItems(filteredRes[0].doc.todoItems);
      setLoadingDB(false);
    });
  }, [remoteDB, currentList]);

  // set up local DB for each user
  useEffect(() => {
    setLocalDB(new PouchDB(userID))
  }, [userID]);

  // check if remote DB exists and create if not
  useEffect(() => {
    if (!userID) return;
    axios.head(`${DB_HOST}/db-${userID}`).then(res => {
      if (res.statusText === 'OK') {
        console.log('DB Exists')
        setRemoteDB(new PouchDB(`${DB_HOST}/db-${userID}`));
      };
    }).catch(err => {
      console.log(err);
      axios.put(`${API_URL}/db-${userID}`).then(res => {
        console.log(res)
        setRemoteDB(new PouchDB(`${DB_HOST}/db-${userID}`));
      });
    });
  }, [DB_HOST, API_URL, userID])

  // get data from the DB when ready
  useEffect(() => {
    if (!remoteDB) return;
    remoteDB.info();
    getData();
  }, [remoteDB, getData])

  // This effect handles logins
  useEffect(() => {
    localStorage.setItem('loggedIn', loggedIn)
    localStorage.setItem('userID', userID)
    localStorage.setItem('userEmail', userEmail)
    localStorage.setItem('userImg', userImg)
    localStorage.setItem('userName', userName)
  }, [loggedIn, userID, userEmail, userImg, userName])

  // This effect handles changes to the db from other clients
  useEffect(() => {

    if (loadingDB) return;

    let dbSync;

    const handleRemoteUpdate = (list) => {
      let newItems = [...items];
      newItems = list.todoItems;
      setItems(newItems);
    }

    if (loggedIn === 'true' && remoteDB && localDB) {
      dbSync = localDB.sync(remoteDB, {
        live: true,
        retry: true,
        include_docs: true,
      }).on('change', (e) => {
        console.log('Database Changed');
        console.log(e);
        let listChanged = e.change.docs[0];
        if (e.direction === 'pull') {
          // Handle update or insert
          handleRemoteUpdate(listChanged);
          console.log(`Updataed: ${listChanged._id}`)
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
  }, [items, loggedIn, userID, localDB, remoteDB, loadingDB])

  async function addItem(item) {
    console.log(item);
    // get all lists from the DB and update current list
    // make new list if current list does not exist
    localDB.allDocs({ include_docs: true }).then(res => {
      // TODO figure out how to use the list ID as the currentList var and not
      // the list name as that can be duplicated
      let listArr = res.rows.filter(row => row.doc.listName === currentList);
      let newList = {}
      if (listArr.length) {
        newList = listArr[0].doc;
      }
      console.log(newList)
      let newItems = newList.todoItems || [];
      newItems.unshift(item);
      if (!newList._id) {
        newList._id = new Date().toISOString();
        newList.listName = currentList;
      }
      newList.todoItems = newItems;
      localDB.put(newList);
    })
  }

  const handleLocalAdd = (e) => {
    // check if event came from keydown but not enter key => do nothing
    if (e.keyCode && e.keyCode !== 13) return;
    // if value empty do nothing
    if (!newItem) return;
    let itemToAdd = {
      _id: new Date().toISOString(),
      todo: newItem,
      completed: false,
    };
    addItem(itemToAdd);
    setItems([itemToAdd, ...items]);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
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
    // remove from local state
    let copyItems = [...items];
    let delInd = copyItems.findIndex(el => el._id === item._id);
    copyItems.splice(delInd, 1);
    setItems(copyItems);
    // update localDB
    updateItems(copyItems);
  }

  // send local state changes to the DB
  async function updateItems(newItems) {
    if (!localDB) return // no local DB
    localDB.allDocs({ include_docs: true }).then(res => {
      let curList = res.rows.find(el => el.doc.listName === currentList);
      localDB.get(curList.id).then(doc => {
        doc.todoItems = newItems;
        localDB.put(doc).catch(e => console.error(e))
      }).catch(e => {
        console.error(e)
      })
    })
  }

  // sort by completed at top
  const sortByCompleted = (todos) => {
    let uncheckedItems = [];
    let checkedItems = [];
    todos.forEach(el => {
      if (el.completed) checkedItems.push(el);
      else uncheckedItems.push(el);
    })
    let newItems = [...uncheckedItems, ...checkedItems];
    return newItems;
  }

  // send updated items to DB
  const handleItemUpdate = (e) => {
    // do not update on tab
    if (e.keyCode === 9) return;
    // enter should add a new blank todo
    if (e.keyCode === 13) {
      let newItems = [...items];
      let i = newItems.findIndex(el => el.todo === e.target.value);
      if (i === -1) return;
      let blankItem = {
        _id: new Date().toISOString(),
        todo: '',
        completed: false,
      };
      newItems.splice(i + 1, 0, blankItem);
      setItems(newItems);
      // focus the new element
      setTimeout(() => {
        document.getElementById(blankItem._id).focus();
      }, 200);
      return;
    }
    let copyItems = [...items];
    // find updated item
    let updatedIndex = copyItems.findIndex(el => el._id === e.target.id);
    if (updatedIndex === -1) return; //item not found
    // check if deleted and process
    if (e.keyCode === 8 && !e.target.value) {
      // delete item from local state
      copyItems.splice(updatedIndex, 1);
      setItems(copyItems);
      // update localDB
      updateItems(copyItems);
    } else {
      updateItems(copyItems);
    }
  }

  // update newItem state on input change
  const handleNewChange = (e) => {
    setNewItem(e.target.value);
  }

  // update state and DB when item checked
  const handleChecked = (item) => {
    // update the state
    let copyItems = [...items];
    for (let i of copyItems) {
      if (i === item) {
        i.completed = !i.completed;
      }
    }
    //sort by checked
    copyItems = sortByCompleted(copyItems);
    // set local state
    setItems(copyItems);
    // update the localDB
    updateItems(copyItems);
  }

  const resGoogle = (res, history) => {
    setUserID(res.profileObj.googleId);
    setUserEmail(res.profileObj.email);
    setUserImg(res.profileObj.imageUrl);
    setUserName(res.profileObj.name);
    setLoggedIn("true");
    history.push('/lists')
  }

  const loginLocal = (user, history) => {
    setUserID(user._id);
    setUserEmail(user.email);
    setUserImg(user.img);
    setUserName(user.name);
    setLoggedIn("true");
    history.push('/lists');
  }

  const respGoogleFail = (res) => {
    console.log(res);
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(true);
  }

  return (
    <Router>
      <Route path="/" exact render={() => {
        if (localStorage.getItem('loggedIn') === 'true') return <Redirect to='/lists' />
        return <Home 
          resGoogle={resGoogle}
          respGoogleFail={respGoogleFail}/>
      }} />
      <Route path="/login" render={() => {
        if (localStorage.getItem('loggedIn') === 'true') return <Redirect to='/lists' />
        return <Login loginLocal={loginLocal} />
      }} />
      <Route path="/signup" render={() => {
        if (localStorage.getItem('loggedIn') === 'true') return <Redirect to='/lists' />
        return <SignUp loginLocal={loginLocal} />
      }} />
      <PrivateRoute path="/lists" auth={loggedIn} >
        <Lists 
          handleLogout={handleLogout}
          loggedIn={loggedIn}
          userImg={userImg}
          items={items}
          setItems={setItems}
          updateItems={updateItems}
          handleItemUpdate={handleItemUpdate}
          handleLocalAdd={handleLocalAdd}
          handleItemChange={handleItemChange}
          handleChecked={handleChecked}
          deleteItem={deleteItem}
          newItem={newItem}
          handleNewChange={handleNewChange}
          />
      </PrivateRoute>
    </Router>
  )
}

export default App;
