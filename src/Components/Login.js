import React, { useEffect, useState } from 'react';
import './Login.css';
import Header from './Header';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'development' ?
    'http://localhost:4000' :
    'https://db-todo.duckdns.org/api';

const validEmailRegex = RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);

export default function Login(props) {

    useEffect(() => {
        document.title = 'Todo-Login';
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [serverErr, setServerErr] = useState('');
    let history = useHistory();

    const handleInputChange = (event) => {
        if (event.target.name === 'email') setEmail(event.target.value);
        else setPassword(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setEmailErr('');
        setPasswordErr('');
        setServerErr('');
        // check for blank fields and valid email - set errors
        if (!email.length) setEmailErr('Required');
        else if (!validEmailRegex.test(email)) setEmailErr('Please enter a valid email');
        else if (!password.length) setPasswordErr('Required');
        // if no errors send login cred. to server
        else {
            axios.post(`${API_URL}/login`, {
                email: email,
                password: password
            }).then(res => { // handle server response
                console.log(res)
                // login local user if success
                if (res.data.message === 'login-success') {
                    props.loginLocal(res.data.user, history);
                } else if (res.data === 'user-not-found') {
                    setServerErr('Email not registered');
                } else if (res.data === 'incorrect-password') {
                    setServerErr('Incorrect Password');
                } else if (res.data === 'Password required') {
                    setServerErr(res.data)
                } else {
                    setServerErr('Login Error - Please try again')
                }
            })
        }
    }

    return (
        <div className={'App'}>
            <Header />
            <h3>Login</h3>
            <form className='login-form' noValidate>
                <label htmlFor='email'>Email</label>
                <input type="email" name="email" autoComplete='on' value={email}
                    onChange={handleInputChange} />
                {emailErr.length > 0 && <span className='err-msg'>{emailErr}</span>}
                <label htmlFor='password'>Password</label>
                <input type="password" name="password" autoComplete='on'
                    value={password} onChange={handleInputChange} />
                {passwordErr.length > 0 && <span className='err-msg'>{passwordErr}</span>}
                <button className='mat-btn login-btn' onClick={handleSubmit}>
                    Login
                </button>
                {serverErr.length > 0 &&
                    <div className='server-err'>
                        <p>{serverErr}</p>
                    </div>
                }
            </form>
            <div className='form-link'>
                <p>Don't have an account?</p>
                <Link to='/signup'>Register Here</Link>
            </div>
        </div>
    )
}