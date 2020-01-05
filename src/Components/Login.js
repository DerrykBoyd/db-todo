import React, { useEffect, useState } from 'react';
import './Login.css';
import Header from './Header';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'development' ?
    'http://localhost:4000' :
    'https://db-todo.duckdns.org/api';

export default function Login(props) {

    useEffect(() => {
        document.title = 'Todo-Login';
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    let history = useHistory();

    const handleInputChange = (event) => {
        if (event.target.name === 'email') setEmail(event.target.value);
        else setPassword(event.target.value);
    }

    const handleSubmit = (event) => {
        // send login cred. to server
        axios.post(`${API_URL}/login`, {
                email: email,
                password: password
        }).then(res => { // handle server response
            // login local user if success
            if (res.data.message === 'login success'){
                console.log('handle user here');
                props.loginLocal(res.data.user, history);
            }
            console.log(res)
        })
        event.preventDefault();
    }

    return (
        <div className={'App'}>
            <Header />
            <h3>Login</h3>
            <form className='login-form' onSubmit={handleSubmit}>
                <label htmlFor='email'>Email</label>
                <input type="email" name="email" autoComplete='on' value={email}
                    onChange={handleInputChange} />
                <label htmlFor='password'>Password</label>
                <input type="password" name="password" autoComplete='on'
                    value={password} onChange={handleInputChange} />
                <button className='mat-btn login-btn'>
                    Login
                        </button>
            </form>
            <div id='new-user'>
                <p>Don't have an account?</p>
                <Link to='/signup'>Register Here</Link>
            </div>
        </div>
    )
}