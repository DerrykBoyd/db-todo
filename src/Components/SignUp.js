import React, { useEffect } from 'react';
import './Login.css';
import Header from './Header';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ?
    'http://localhost:4000' :
    'https://db-todo.duckdns.org/api';

export default function Login(props) {

    useEffect(() => {
        document.title = 'Todo-SignUp'
    }, []);

    return (
        <div className={'App'}>
            <Header />
            <h3>Sign Up</h3>
            <Formik
                initialValues={{ name: '', email: '', password: '', passwordRpt: '' }}
                validate={values => {
                    const errors = {};
                    if (!values.email) {
                        errors.email = 'Required';
                    } else if (
                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                    ) {
                        errors.email = 'Invalid email address';
                    }
                    if (values.password !== values.passwordRpt) {
                        errors.passwordRpt = 'Passwords do not match'
                    }
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    axios.post(`${API_URL}/register`, values).then(res => {
                        console.log(res.body)
                    }).catch(e => console.log(e));
                }}
            >
                {({ isSubmitting }) => (
                    <Form className='login-form'>
                        <label htmlFor='name'>Name</label>
                        <Field type="text" name="name" />
                        <ErrorMessage className='err-msg' name="name" component="div" />
                        <label htmlFor='email'>Email</label>
                        <Field type="email" name="email" autoComplete='on' />
                        <ErrorMessage className='err-msg' name="email" component="div" />
                        <label htmlFor='password'>Password</label>
                        <Field type="password" name="password" autoComplete='on' />
                        <ErrorMessage className='err-msg' name="password" component="div" />
                        <label htmlFor='passwordRpt'>Repeat Password</label>
                        <Field type="password" name="passwordRpt" autoComplete='on' />
                        <ErrorMessage className='err-msg' name="passwordRpt" component="div" />
                        <button className='mat-btn login-btn' type="submit" disabled={isSubmitting}>
                            Register
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}