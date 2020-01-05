import React, { useEffect } from 'react';
import {
  Link,
  useHistory,
} from "react-router-dom";
import GoogleLogin from 'react-google-login';
import Header from './Header';

// Home componemt
export default function Home(props) {

    useEffect(() => {
      document.title = 'Todo'
    }, []);
  
    // set the app history react router
    let history = useHistory();
  
    return (
      <div className={`App`}>
        <Header />
        <h3>Login</h3>
        <Link
          className="mat-btn"
          value="Login"
          to='/login'
        >Login
            </Link>
        <h3>Create new account</h3>
        <Link
          className="mat-btn"
          value="Register"
          to='/signup'
        >Sign Up
            </Link>
        <div className='google-btn'>
          <h3>Login with Google</h3>
          <GoogleLogin
            clientId="245694344398-gc2fikf31q0d4kcee70nuqj5lhnmu5u7.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={(res) => props.resGoogle(res, history)}
            onFailure={props.respGoogleFail}
            cookiePolicy={'single_host_origin'}
          />
        </div>
      </div>
    )
  }