import React, { useEffect } from 'react';

// Components
import Credits from './Credits';

// Firebase
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

export default function Home(props) {

    useEffect(() => {
      document.title = 'Todo'
    }, []);
  
    return (
      <div className={`App`}>
        <StyledFirebaseAuth
          uiConfig={props.uiConfig}
          firebaseAuth={props.firebaseApp.auth()}
        />
        <Credits />
      </div>
    )
  }