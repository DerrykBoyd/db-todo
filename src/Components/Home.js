import React, { useEffect } from 'react';
import Header from './Header';
import Credits from './Credits';

// Firebase
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

// Home componemt
export default function Home(props) {

    useEffect(() => {
      document.title = 'Todo'
    }, []);
  
    return (
      <div className={`App`}>
        <Header />
        <h3>Login</h3>
        <h4>TODO Firebase Login</h4>
        <StyledFirebaseAuth
          uiConfig={props.uiConfig}
          firebaseAuth={props.firebaseApp.auth()}
        />
        
        <Credits />
      </div>
    )
  }