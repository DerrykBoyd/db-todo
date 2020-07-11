import React from 'react'
import githubLogo from '../assets/GitHub-Mark-Light-32px.png';

// styles
import '../styles/Credits.css';

const Credits = (props) => {
    return ( 
        <div id="credits">
          <span>Developed by dboydgit</span>
          <a href="https://github.com/dboydgit"
            target='_blank'
            rel='noopener noreferrer'
            id='github-link'><img src={githubLogo} alt='github-progile-link' /></a>
        </div>
     );
}
 
export default Credits;