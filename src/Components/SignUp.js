import React, { useEffect, useState } from 'react';
import './Login.css';
import Header from './Header';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ?
    'http://localhost:4000' :
    'https://db-todo.duckdns.org/api';

export default function Login(props) {

    const blankForm = {
        name: '',
        email: '',
        password: '',
        passwordRpt: ''
    };
    const validEmailRegex = RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);

    useEffect(() => {
        document.title = 'Todo-SignUp'
    }, []);

    const [form, setForm] = useState(blankForm);
    const [nameErr, setNameErr] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [passwordRptErr, setPasswordRptErr] = useState('');
    const [serverErr, setServerErr] = useState('');

    let history = useHistory();

    const handleInputChange = (event) => {
        let value = event.target.value;
        setForm({
            ...form,
            [event.target.name]: value
        });
    }

    const resetErrors = () => {
        setNameErr('');
        setEmailErr('');
        setPasswordErr('');
        setPasswordRptErr('');
    }

    const handleSubmit = (event) => { //TODO
        event.preventDefault();
        // reset errors
        resetErrors();
        setServerErr('');
        // check for blank name - return err
        if (!form.name.length) setNameErr('Required');
        // check for valid email - return err
        else if (!validEmailRegex.test(form.email)) setEmailErr('Invalid email');
        // check password length - return err
        else if (form.password.length < 6) setPasswordErr('Password must be at least 6 characters')
        // check matching passwords - return err
        else if (form.password !== form.passwordRpt) setPasswordRptErr('Passwords do not match')
        // if no errors send login cred. to server & handle response
        else {
            axios.post(`${API_URL}/register`, form).then(res => {
                // handle server response
                // login local user if signup successful
                if (res.data.message === 'signup-success') {
                    props.loginLocal(res.data.user, history);
                } else if (res.data === 'invalid-email') {
                    setServerErr('Invalid email');
                } else {
                    setServerErr(res.data);
                }
                console.log(res)
            })
        }
    }

    return (
        <div className={'App'}>
            <Header />
            <h3>Sign Up</h3>
            <form className='login-form' noValidate>
                <label htmlFor='name'>Name</label>
                <input type="text" name="name" autoComplete='on' value={form.name}
                    onChange={handleInputChange} />
                {nameErr.length > 0 && <span className='err-msg'>{nameErr}</span>}
                <label htmlFor='email'>Email</label>
                <input type="email" name="email" autoComplete='on' value={form.email}
                    onChange={handleInputChange} />
                {emailErr.length > 0 && <span className='err-msg'>{emailErr}</span>}
                <label htmlFor='password'>Password</label>
                <input type="password" name="password" autoComplete='on' value={form.password}
                    onChange={handleInputChange} />
                {passwordErr.length > 0 && <span className='err-msg'>{passwordErr}</span>}
                <label htmlFor='passwordRpt'>Repeat Password</label>
                <input type="password" name="passwordRpt" autoComplete='on' value={form.passwordRpt}
                    onChange={handleInputChange} />
                {passwordRptErr.length > 0 && <span className='err-msg'>{passwordRptErr}</span>}
                <button className='mat-btn login-btn' onClick={handleSubmit}>
                    Register
                </button>
                {serverErr.length > 0 &&
                    <div className='server-err'>
                        <p>{serverErr}</p>
                    </div>
                }
            </form>
            <div className='form-link'>
                <p>Already have an account?</p>
                <Link to='/login'>Login Here</Link>
            </div>
        </div>
    )
}