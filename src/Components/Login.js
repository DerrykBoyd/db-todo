import React, { useEffect } from 'react';
import './Login.css';
import Header from './Header';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {Link} from 'react-router-dom';

export default function Login(props) {

    useEffect(() => {
        document.title = 'Todo-Login'
    }, []);

    return (
        <div className={'App'}>
            <Header />
            <h3>Login Form</h3>
            <Formik
                initialValues={{ email: '', password: '' }}
                validate={values => {
                    const errors = {};
                    if (!values.email) {
                        errors.email = 'Required';
                    } else if (
                        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                    ) {
                        errors.email = 'Invalid email address';
                    }
                    return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                    setTimeout(() => {
                        alert(JSON.stringify(values, null, 2));
                        setSubmitting(false);
                    }, 400);
                }}
            >
                {({ isSubmitting }) => (
                    <Form className='login-form'>
                        <label htmlFor='email'>Email</label>
                        <Field type="email" name="email" autoComplete='on' />
                        <ErrorMessage className='err-msg' name="email" component="div" />
                        <label htmlFor='password'>Password</label>
                        <Field type="password" name="password" autoComplete='on' />
                        <ErrorMessage className='err-msg' name="password" component="div" />
                        <button className='mat-btn login-btn' type="submit" disabled={isSubmitting}>
                            Login
                        </button>
                    </Form>
                )}
            </Formik>
            <div id='new-user'>
                <p>Don't have an account?</p>
                <Link to='/signup'>Register Here</Link>
            </div>
        </div>
    )
}