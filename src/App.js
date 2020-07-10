import React, { useEffect, useState, useCallback } from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";
import { ToastContainer, cssTransition, toast } from 'react-toastify';

import * as serviceWorker from './serviceWorker';

// Firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// styles
import './Styles/App.css';
import './Styles/animations.css';

// Components
import Home from './Components/Home';
import Lists from './Components/Lists';
import ServiceWorkerToast from './Components/Toasts/ServiceWorkerToast';

// assets
import defaultProfile from './assets/profile-avatars/050.svg';

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
db.enablePersistence({synchronizeTabs: true})
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
  const [currentListName, setCurrentListName] = useState(localStorage.getItem('currentList') || 'My List');
  const [currentListID, setCurrentListID] = useState(localStorage.getItem('currentListID') || '');
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [serviceWorkerInit, setServiceWorkerInit] = useState(false);
  const [serviceWorkerReg, setServiceWorkerReg] = useState(null);
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [loading, setLoading] = useState(false);
  const [showLists, setShowLists] = useState(false);

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

  // create a new list
  function createList(listName = 'New List') {
    this._id = new Date().toISOString();
    this.default = false;
    this.listName = listName;
    this.todoItems = [];
  }

  const loadUser = useCallback(() => {
    // get user from localStorage if loaded already
    if (localStorage.getItem('dbUser') !== null) {
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
          let newDbUser = {
            creationTime: user.metadata.creationTime,
            email: user.email,
            lists: {},
            name: user.displayName || '',
            profileURL: user.photoURL || defaultProfile,
            uid: user.uid,
          }
          db.collection('users').doc(user.uid)
            .set(newDbUser);
          setDbUser(newDbUser);
          console.log('New user created')
        }
      })
      .catch(error => console.error('Error loading User', error))
  }, [user]);

  // listen for realtime updates to dbUser if loaded
  useEffect(() => {
    let updateUser = null;
    if (user && user.uid) {
      console.log('Adding snapshot listener')
      updateUser = db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
          console.log('firestore snapshot read')
          setDbUser(doc.data())
        })
    }
    return () => {
      if (updateUser !== null) {
        console.log('Removing snapshot listener')
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
    const unsubscribe = firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        // user signed in
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // user logged out
        localStorage.clear()
        setUser(user);
        setDbUser(null);
        // TODO reset other state
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
    localStorage.setItem('currentList', currentListName);
    localStorage.setItem('currentListID', currentListID);
    localStorage.setItem('user', JSON.stringify(user) || null);
  }, [dbUser, currentListName, currentListID, user])

  // add an item to the list
  async function addItem(item) {
    console.log(item);
    // TODO Add item to db and state
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
    let newItems = [itemToAdd, ...items];
    setItems(newItems);
    let newLists = [...lists];
    newLists.forEach(list => {
      if (list._id === currentListID) list.todoItems = newItems;
    })
    setLists(newLists);
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

  // handle list name change
  const handleListChange = (e) => {
    let newListName = e.target.value;
    setCurrentListName(newListName);
    let newLists = [...lists];
    newLists.forEach(list => {
      if (list._id === currentListID) list.listName = newListName;
    })
    setLists(newLists);
    // TODO Update db
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
    console.log('TODO update db items', items)
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

  // send updated items to DB - TODO only send to firebase when finished editing
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
      // focus the new element - TODO figure out how to do this properly
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

  function updateLists(newList) {
    let newLists = [...lists, newList];
    setLists(newLists);
    // TODO update db
  }

  function deleteList(id) {
    // local changes if only one list
    if (lists.length === 1) {
      let blankList = new createList('New List');
      setLists([blankList]);
      setCurrentListID(blankList._id);
      setItems(blankList.todoItems);
      setCurrentListName(blankList.listName);
      setShowLists(false);
      // TODO Update db
    } else { // local changes if more than one list
      let newLists = [...lists];
      let ind = newLists.findIndex(el => el._id === id);
      // switch to view a different list before deleting
      if (ind !== 0) switchList(lists[ind - 1]._id);
      else switchList(lists[ind + 1]._id);
      // delete list from state
      if (ind !== -1) newLists.splice(ind, 1);
      setLists(newLists);
    }
    // TODO delete from DB
  }

  function switchList(id) {
    // get the index of the list to switch to
    let ind = lists.findIndex(el => el._id === id);
    setCurrentListID(id);
    setItems(lists[ind].todoItems);
    setCurrentListName(lists[ind].listName);
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
      <Switch>
        <Route path="/" exact >
          {localStorage.getItem('user') ?
            <Redirect to='/lists' />
            :
            <Home
              firebaseApp={firebaseApp}
              title='Home'
              uiConfig={uiConfig}
              loading={loading}
              setLoading={setLoading}
            />
          }
        </Route>
        <Route path="/lists" exact >
          {localStorage.getItem('user') ?
            <Lists
              dbUser={dbUser}
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
              currentListName={currentListName}
              handleListChange={handleListChange}
              lists={lists}
              updateLists={updateLists}
              deleteList={deleteList}
              switchList={switchList}
              showLists={showLists}
              setShowLists={setShowLists}
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
