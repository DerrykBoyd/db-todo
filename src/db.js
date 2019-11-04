import PouchDB from 'pouchdb';

let localDB;
let host = window.location.hostname;
console.log(host);
let remoteDB;

export async function initLocalDB(userID) {
    localDB = PouchDB(userID);
}

export async function initRemoteDB(userID) {
    if (!userID) return;
    remoteDB = new PouchDB(`http://${host}:5984/db-${userID}`);
    await remoteDB.info();
}

export async function addItem(item) {
    console.log(item);
    localDB.put(item)
}

export async function deleteItem(item) {
    localDB.get(item._id).then((doc) => {
        doc._deleted = true;
        return localDB.put(doc);
    }).catch(err => console.log(`Database Error: ${err}`))
}

export async function updateItem(item) {
    localDB.get(item._id).then((doc => {
        if (item.todo === doc.todo && item.completed === doc.completed) return //item has not changed
        return localDB.put({
            _id: item._id,
            _rev: doc._rev,
            todo: item.todo,
            completed: item.completed,
        })
    }))
}

export {localDB, remoteDB};