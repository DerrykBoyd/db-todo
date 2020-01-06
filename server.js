const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const uuid = require('uuid/v5');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const HTTP = process.env.DB_HTTP;
const SERV_PORT = 4000;
const NAMESPACE = process.env.NAMESPACE;
const APP_URL = process.env.APP_URL;
const cookieAge = 1000 * 60 * 60 * 24 * 30;

// Create Express app
const app = express();
app.use(helmet());
app.use(cors({
    credentials: true,
    origin: APP_URL
}));
app.use(cookieParser());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

let dbAuth = `${DB_USER}:${DB_PASS}`;
const opts = {
    url: `${HTTP}${dbAuth}@${DB_HOST}`,
    parseUrl: false,
    family: 4
}

// connect nano to couchDB
const nano = require('nano')(opts);
const userDB = nano.use('todo-users');

const isValidPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}

// test if server is running
app.get('/test', (req, res) => {
    res.send(`Server running on port: ${SERV_PORT} - Test`)
})

// Route for creating a new DB if none existing
app.put('/:dbName', (req, res) => {

    let dbName = req.params.dbName;

    // use nano to create new DB and send res back to client
    nano.db.create(dbName).then(body => {
        res.send('Database Created')
    }).catch(err => {
        if (err.error === 'file_exists') res.send('DB already exists');
        else res.send(err);
    })

})

const validEmail = (email) => {
    const validEmailRegex = RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    return validEmailRegex.test(email)
}

// register a new user
app.post('/register', (req, res) => {
    let form = req.body;
    // check name is present
    if (!form.name.length || !form.password.length) {
        res.send('All fields Required');
        return;
    }
    // check valid email
    if (!validEmail(form.email)) {
        res.send('Invalid Email');
        return;
    }
    // check valid password
    if (form.password.length < 6) {
        res.send('Password must be at least 6 characters');
        return;
    } else if (form.password !== form.passwordRpt) {
        res.send('Passwords do not match');
        return;
    }
    // generate id from user email
    let id = uuid(req.body.email, NAMESPACE);
    // check if user already exists, return if so
    userDB.get(id).then(user => {
        res.send('User email already registered');
        return;
    }).catch(e => {
        if (e.error === 'not_found') {
            // save the user in the db
            let hash = bcrypt.hashSync(req.body.password, salt);
            let newUser = {
                _id: id,
                name: req.body.name,
                email: req.body.email,
                img: '',
                password: hash,
            }
            userDB.insert(newUser);
            res.send({
                message: 'signup-success',
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    img: newUser.img
                }
            });
            return;
        }
    });
})

app.post('/login', (req, res) => {
    let form = req.body;
    // server side form validation
    // check if valid email
    if (!validEmail(form.email)) {
        res.send('Invalid Email');
        return;
    }
    // check password
    if (!form.password.length) {
        res.send('Password required');
        return;
    }
    // retrieve ID from user email
    let id = uuid(form.email, NAMESPACE);
    userDB.get(id, function (err, user) {
        if (err) {
            if (err.error === 'not_found') {
                res.send(`user-not-found`);
                return;
            } else {
                res.send(`login-error`);
                return;
            }
        }
        let validPW = isValidPassword(req.body.password, user.password);
        if (!validPW) {
            res.send(`incorrect-password`);
            return;
        }
        if (validPW) {
            res.send({
                message: `login-success`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    img: user.img
                }
            });
            return;
        }
        res.send(`login-error`)
    });
}
);

// Start the Express server
app.listen(SERV_PORT, () => console.log('Server running on port 4000'))