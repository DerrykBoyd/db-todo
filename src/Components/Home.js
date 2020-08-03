import React, { useEffect } from 'react';

// Components
import Credits from './Credits';

// Firebase
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import '../styles/Home.css';
import screenshot from '../assets/db-todo-screenshot_iphonexspacegrey_portrait.webp';

export default function Home(props) {

  useEffect(() => {
    document.title = 'Todo'
  }, []);

  return (
    <div className={`App`}>
      <div className="home-content">
        <StyledFirebaseAuth
          uiConfig={props.uiConfig}
          firebaseAuth={props.firebaseApp.auth()}
        />
        <div className="screenshot">
          <img className="screenshot"
            src={screenshot}
            alt="app-screenshot" />
        </div>
      </div>
      <div className='footer'>
        <Credits />
      </div>
    </div>
  )
}