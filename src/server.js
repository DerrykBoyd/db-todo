const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Create Express app
const app = express();
app.use(helmet());
app.use(cors());

let testObj = {test: 'test'};

// A sample route
app.get('/', (req, res) => {
    console.log(JSON.stringify(req.headers))
    res.send(JSON.stringify(testObj));
})

app.get('/api', (req, res) => res.send('Hello World! API - Test'))

// Start the Express server
app.listen(4000, () => console.log('Server running on port 4000!'))