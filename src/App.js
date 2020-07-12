import React, { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";
import { ToastContainer, cssTransition, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';

import * as serviceWorker from './serviceWorker';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// styles
import './styles/App.css';
import './styles/animations.css';
import './styles/Modal.css';

// Components
import Header from './Components/Header';
import Home from './Components/Home';
import Lists from './Components/Lists';
import ServiceWorkerToast from './Components/Toasts/ServiceWorkerToast';

// assets
import defaultProfile from './assets/profile-avatars/050.svg';
import ListSettingsModal from './Components/Modals/ListSettingsModal';

const Slide = cssTransition({
  enter: 'toast-in',
  exit: 'toast-out',
  duration: [500, 100]
})

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SEND_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  credentialHelper: 'none',
  signInFlow: 'popup',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false
  }
}

// Instantiate a Firebase app and database
const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.firestore();
// enable the offline database capability
db.enablePersistence({ synchronizeTabs: true })
  .then(() => console.log('Offline Database Active'))
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a a time.', err)
    } else if (err.code === 'unimplemented') {
      console.error('The current browser does not support all of the features required to enable persistence', err)
    }
  })

function App() {

  const [dbUser, setDbUser] = useState(JSON.parse(localStorage.getItem('dbUser')) || null);
  const [currentListID, setCurrentListID] = useState(localStorage.getItem('currentListID') || '');
  const [filtered, setFiltered] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [serviceWorkerInit, setServiceWorkerInit] = useState(false);
  const [serviceWorkerReg, setServiceWorkerReg] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [showLists, setShowLists] = useState(false);
  const [listModal, setListModal] = useState(false);

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.register({
    onSuccess: () => setServiceWorkerInit(true),
    onUpdate: reg => {
      setServiceWorkerReg(reg);
    },
  });

  // show service worker toast on first install
  useEffect(() => {
    if (serviceWorkerInit) {
      toast.success('App available for offline use.')
    }
  }, [serviceWorkerInit]);

  // allow user to update site when service worker changes and no active game
  useEffect(() => {
    if (serviceWorkerReg && serviceWorkerReg.waiting) {
      toast.info(
        <ServiceWorkerToast
          serviceWorkerReg={serviceWorkerReg}
        />,
        {
          closeOnClick: false,
          autoClose: false
        }
      );
    }
  }, [serviceWorkerReg])

  const loadUser = useCallback(() => {
    // get user from localStorage if loaded already
    if (!user || localStorage.getItem('dbUser') !== null) {
      return
    }
    // get the user from the db and load into state
    // add the user to the database if doesn't exist
    db.collection('users').doc(user.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          let newDbUser = doc.data();
          setDbUser(newDbUser);
          console.log('User fetched from database')
        } else {
          // add a new user entry
          let newListID = uuidv4();
          let createdTime = Date.now();
          let newDbUser = {
            creationTime: user.metadata.creationTime,
            email: user.email,
            lists: {
              [newListID]: {
                id: newListID,
                createdTime: createdTime,
                default: false,
                listName: 'New List',
                items: [],
              },
            },
            name: user.displayName || '',
            profileURL: user.photoURL || defaultProfile,
            uid: user.uid,
          }
          db.collection('users').doc(user.uid)
            .set(newDbUser)
            .then(console.log('New user created'));
          setDbUser(newDbUser);
          setCurrentListID(newListID);
        }
      })
      .catch(error => console.error('Error loading User', error))
  }, [user]);

  // listen for realtime updates to dbUser if loaded
  useEffect(() => {
    let updateUser = null;
    let newUser = { ...user };
    if (newUser && newUser.uid) {
      console.log('Adding user snapshot listener')
      updateUser = db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
          console.log('snapshot read')
          setDbUser(doc.data())
        })
    }
    return () => {
      if (updateUser !== null) {
        console.log('Removing user snapshot listener')
        updateUser();
      }
    }
  }, [user])

  useEffect(() => {
    // show toast for successful update
    if (localStorage.getItem('serviceWorkerUpdated') === 'true') {
      toast.success('Site Updated');
      localStorage.setItem('serviceWorkerUpdated', 'false');
    }
    // listen for auth state changes
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(userdoc => {
      if (userdoc) {
        // user signed in
        setUser(userdoc);
        localStorage.setItem('user', JSON.stringify(userdoc));
      } else {
        // user logged out
        setUser(null);
        setDbUser(null);
        setCurrentListID('');
        localStorage.clear();
      }
    })
    // unsubscribe to the listener when unmounting
    return () => unsubscribe()
    // eslint-disable-next-line
  }, []);

  // load the user on login (when user object changes)
  useEffect(() => {
    if (user) {
      loadUser();
    }
  }, [user, loadUser]);

  // save variables to localstorage to allow persistence on page reload
  useEffect(() => {
    localStorage.setItem('dbUser', JSON.stringify(dbUser) || null);
    localStorage.setItem('currentListID', currentListID || '');
    if (dbUser && Object.keys(dbUser.lists).length && !currentListID) {
      setCurrentListID(Object.keys(dbUser.lists)[0]);
    }
    if (dbUser && Object.keys(dbUser.lists).length && !Object.keys(dbUser.lists).includes(currentListID)) {
      try {
        setCurrentListID(Object.keys(dbUser.lists)[0]);
      } catch (e) {
        console.error('Error setting new list', e)
      }
    }
  }, [dbUser, currentListID])

  // add an item to the list
  async function addItem(item) {
    // Add item to db and state
    let newDbUser = { ...dbUser };
    newDbUser.lists[currentListID].items.unshift(item);
    setDbUser(newDbUser);
    updateDbLists(newDbUser.lists)
  }

  // delete item from delete button
  const deleteItem = (item) => {
    // remove from local state
    let newDbUser = { ...dbUser };
    let items = newDbUser.lists[currentListID].items;
    let delInd = items.findIndex(el => el.id === item.id);
    items.splice(delInd, 1);
    setDbUser(newDbUser);
    // update db
    updateDbLists(newDbUser.lists)
  }

  function deleteList(id) {
    // Error if only one list
    if (Object.keys(dbUser.lists).length === 1) {
      toast.error('Cannot delete default list')
    } else { // local changes if more than one list
      let newDbUser = { ...dbUser };
      // switch to view a different list before deleting
      if (currentListID === id) {
        let listIDs = Object.keys(newDbUser.lists);
        let ind = listIDs.findIndex(el => el === id);
        if (ind !== 0) switchList(listIDs[ind - 1].id);
        else switchList(listIDs[ind + 1].id);
      }
      // delete list from state
      delete newDbUser.lists[id];
      setDbUser(newDbUser);
      updateDbLists(newDbUser.lists)
    }
  }

  // update state and DB when item checked
  const handleChecked = (item) => {
    // update the state
    let newDbUser = { ...dbUser };
    let items = newDbUser.lists[currentListID].items;
    for (let i of items) {
      if (i === item) {
        i.completed = !i.completed;
      }
    }
    //sort by checked
    newDbUser.lists[currentListID].items = sortByCompleted(items)
    // set local state
    setDbUser(newDbUser);
    // update the localDB
    updateDbLists(newDbUser.lists)
  }

  // update items in state when typing
  const handleItemChange = (e) => {
    let newDbUser = { ...dbUser };
    let items = newDbUser.lists[currentListID].items;
    let changeIndex = items.findIndex(el => el.id === e.target.id);
    items[changeIndex].todo = e.target.value;
    setDbUser(newDbUser);
  }

  // send updated items to DB - only send to firebase when finished editing
  const handleItemUpdate = (e) => {
    // do not update on tab
    if (e.keyCode === 9) return;
    // enter should add a new blank todo
    else if (e.keyCode === 13) {
      let newDbUser = { ...dbUser };
      let items = newDbUser.lists[currentListID].items;
      let i = items.findIndex(el => el.todo === e.target.value);
      if (i === -1) return;
      let blankItem = {
        id: uuidv4(),
        createdTime: Date.now(),
        todo: '',
        completed: false,
      };
      items.splice(i + 1, 0, blankItem);
      setDbUser(newDbUser);
      // focus the new element - TODO figure out how to do this properly
      setTimeout(() => {
        document.getElementById(blankItem.id).focus();
      }, 200);
      return;
    }
    // check if deleted and process delete
    else if (e.keyCode === 8 && !e.target.value) {
      let newDbUser = { ...dbUser };
      let items = newDbUser.lists[currentListID].items;
      // find updated item
      let updatedIndex = items.findIndex(el => el.id === e.target.id);
      if (updatedIndex === -1) return; //item not found
      // delete item from local state
      items.splice(updatedIndex, 1);
      setDbUser(newDbUser);
      // update db
      updateDbLists(newDbUser.lists)
    } else {
      console.log('No update needed')
    }
  }

  const handleLocalAdd = (e) => {
    // check if event came from keydown but not enter key => do nothing
    if (e.keyCode && e.keyCode !== 13) return;
    // if value empty do nothing
    if (!newItem) return;
    // TODO if value already exists move to top and uncheck
    let curItems = [...dbUser.lists[currentListID].items];
    let ind = curItems.findIndex(item => item.todo === newItem);
    if (ind !== -1) {
      let newDbUser = { ...dbUser };
      let newItems = newDbUser.lists[currentListID].items;
      let existingItemArr = newItems.splice(ind, 1);
      existingItemArr[0].completed = false;
      newItems.unshift(existingItemArr[0]);
      setDbUser(newDbUser);
      setNewItem('');
      // TODO send to db when working
      updateDbLists(newDbUser.lists);
      return;
    }
    let itemToAdd = {
      id: uuidv4(),
      createdTime: Date.now(),
      todo: newItem,
      completed: false,
    };
    addItem(itemToAdd);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
    setNewItem("");
    setFiltered([]);
    e.preventDefault();
  }

  const handleFilteredClick = (item) => {
    let newDbUser = { ...dbUser };
    let newItems = newDbUser.lists[currentListID].items;
    let clickedInd = newItems.findIndex(el => el.id === item.id);
    if (clickedInd === -1) {
      console.log('Item not found')
      return
    }
    let moveArr = newItems.splice(clickedInd, 1);
    moveArr[0].completed = false;
    newItems.unshift(moveArr[0]);
    setDbUser(newDbUser);
    updateDbLists(newDbUser.lists);
    setNewItem('');
    setFiltered([]);
  }

  // update newItem state on input change
  const handleNewChange = (e) => {
    setNewItem(e.target.value);
    if (!e.target.value) {
      setFiltered([]);
      return;
    }
    let newFiltered = dbUser.lists[currentListID].items.filter(item => {
      if (item.todo.includes(e.target.value)) return true
      return false
    })
    setFiltered(newFiltered)
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

  function switchList(id) {
    setCurrentListID(id);
  }

  async function updateDbLists(lists) {
    db.collection('users').doc(user.uid).update({
      lists: lists
    });
  }

  function updateLists(newLists) {
    let newDbUser = { ...dbUser };
    newDbUser.lists = newLists;
    setDbUser(newDbUser);
    // update db
    updateDbLists(newDbUser.lists)
  }

  // handle list name change
  const updateListName = (newName) => {
    let newDbUser = { ...dbUser };
    newDbUser.lists[currentListID].listName = newName;
    setDbUser(newDbUser);
    // Update db
    updateDbLists(newDbUser.lists);
  }

  return (
    <Router>
      <ToastContainer
        autoClose={4000}
        draggable={false}
        hideProgressBar
        newestOnTop={false}
        transition={Slide}
      />
      <Header
        currentListID={currentListID}
        dbUser={dbUser}
        firebaseApp={firebaseApp}
        setListModal={setListModal}
      />
      {listModal &&
        <ListSettingsModal
          currentListID={currentListID}
          dbUser={dbUser}
          setListModal={setListModal}
          updateListName={updateListName}
        />
      }
      <Switch>
        <Route path="/" exact >
          {localStorage.getItem('user') && dbUser ?
            <Redirect to='/lists' />
            :
            <Home
              firebaseApp={firebaseApp}
              title='Home'
              uiConfig={uiConfig}
            />
          }
        </Route>
        <Route path="/lists" exact >
          {localStorage.getItem('user') && dbUser ?
            <Lists
              currentListID={currentListID}
              dbUser={dbUser}
              deleteItem={deleteItem}
              deleteList={deleteList}
              filtered={filtered}
              handleFilteredClick={handleFilteredClick}
              handleItemUpdate={handleItemUpdate}
              handleLocalAdd={handleLocalAdd}
              handleItemChange={handleItemChange}
              handleChecked={handleChecked}
              handleNewChange={handleNewChange}
              newItem={newItem}
              setDbUser={setDbUser}
              setShowLists={setShowLists}
              showLists={showLists}
              switchList={switchList}
              updateLists={updateLists}
            />
            :
            <Redirect to='/' />
          }
        </Route>
        <Route>
          <Redirect to='/' />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
