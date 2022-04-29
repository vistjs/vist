import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { createLocalDbRecorder, createLocalDbPlayer, getUrlParam } from 'rtweb';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// @ts-ignore xxx
window.__reactRoot = root;
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (getUrlParam('recordId')) {
  // @ts-ignore
  window.replayer = createLocalDbPlayer();
  type EventTypes = 'play' | 'stop' | 'pause' | 'speed' | 'resize';
  // @ts-ignore
  window.replayer.on('play', (...args) => {
    console.log('replay', args);
  });
  // @ts-ignore
  window.replayer.on('pause', (...args) => {
    console.log('pause', args);
  });
} else {
  // @ts-ignore
  window.recorder = createLocalDbRecorder();
}
