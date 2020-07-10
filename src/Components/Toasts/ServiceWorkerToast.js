import React from 'react'

export default function ServiceWorkerToast(props) {

  const updateServiceWorker = () => {
    const registrationWaiting = props.serviceWorkerReg.waiting;
    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
      registrationWaiting.addEventListener('statechange', e => {
        if (e.target.state === 'activated') {
          localStorage.setItem('serviceWorkerUpdated', 'true');
          window.location.reload();
        }
      });
    }
  };

  return (
    <div className='sw-toast'>
      <h4>New version available</h4>
      <button
        className='btn'
        onClick={() => {
          updateServiceWorker();
          props.closeToast();
        }}
      >Update</button>
    </div>
  )
}
