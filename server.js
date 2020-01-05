const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const uuid = require('uuid/v5');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

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
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: cookieAge }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

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

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    userDB.get(id, function (err, user) {
        done(err, user);
    });
});

// Configure the login strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
},
    function (req, username, password, done) {
        let id = uuid(username, NAMESPACE);
        userDB.get(id, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!isValidPassword(password, user.password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

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

// register a new user
app.post('/register', (req, res) => {
    console.log(req.body); // for testing
    // generate id from user email
    let id = uuid(req.body.email, NAMESPACE);
    // check if user already exists, return if so
    userDB.get(id).then(body => console.log('User already exists'))
        .catch(e => {
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
            }
        });
    console.log('Testing register route');
    res.send('Register route!');
})

app.post('/login', (req, res) => {
    console.log(req.body); // for testing
    // retrieve ID from user email
    let id = uuid(req.body.email, NAMESPACE);
    userDB.get(id, function (err, user) {
        if (err) {
            if (err.error === 'not_found') {
                res.send(`user not found`);
                return;
            } else {
                res.send(`login error`);
                return;
            } 
        }
        let validPW = isValidPassword(req.body.password, user.password);
        if (!validPW) {
            res.send(`incorrect password`);
            return;
        }
        if (validPW) {
            res.send({
                message: `login success`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    img: user.img
                }
            });
            return;
        }
        res.send(`login error`)
    });
}
);

// Start the Express server
app.listen(SERV_PORT, () => console.log('Server running on port 4000'))