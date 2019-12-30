const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();
app.use(helmet());
app.use(cors());

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const SERV_PORT = 4000;

// Convert DB credentials to base64
let dbAuth = `${DB_USER}:${DB_PASS}`;

// connect nano to couchDB
const nano = require('nano')(`http://${dbAuth}@${DB_HOST}:${DB_PORT}`);

// test if server is running
app.get('/test', (req, res) => {
    res.send(`Server Running on port ${SERV_PORT}`)
})

// Route for creating a new DB if none existing
app.put('/:dbName', (req, res) => {

    let dbName = req.params.dbName;

    // use nano to create new DB and send res back to client
    nano.db.create(dbName).then(body => {
        res.send('Database Created')
    }).catch(err => {
        if (err.error === 'file_exists') res.send('DB already exists')
    })

})

// Start the Express server
app.listen(SERV_PORT, () => console.log('Server running on port 4000'))