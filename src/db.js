import PouchDB from 'pouchdb';

let db = new PouchDB('todo-app');
let host = window.location.hostname;
console.log(host);
let remoteDB = new PouchDB(`http://${host}:5984/todo-app`);

db.sync(remoteDB, {
    live: true,
    include_docs: true,
}).on('change', (e) => {
    console.log('Database Changed')
    console.log(e)
    if (e.deleted) {
        console.log(`Item deleted: ${e.change.docs}`)
    } else {
        console.log(`Updataed or Inserted: ${e.change.docs}`)
    }
}).on('error', () => {
    console.log('Database Error')
});

export async function addItem(item) {
    console.log(item);
    db.put(item)
}

export default db;