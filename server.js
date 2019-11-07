const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const http = require('http')

// Create Express app
const app = express();
app.use(helmet());
app.use(cors());

let testObj = { test: 'test' };
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

// Convert DB credentials to base64
let dbAuth = `${DB_USER}:${DB_PASS}`;
let buff = new Buffer.from(dbAuth);
let dbAuth64 = buff.toString('base64');

console.log(dbAuth64);

// Route for creating a new DB if none existing
app.put('/:dbName', (req, res) => {

    let dbName = req.params.dbName;

    let options = {
        hostname: DB_HOST,
        port: DB_PORT,
        path: `/${dbName}`,
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            Authorization: `Basic ${dbAuth64}`,
            Host: DB_HOST,
        },
    }

    const request = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            process.stdout.write(d)
        })
    })
    request.on('error', err => console.log(err));
    request.end();

    res.send(JSON.stringify(testObj));
})

// Start the Express server
app.listen(4000, () => console.log('Server running on port 4000!'))