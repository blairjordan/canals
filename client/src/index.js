import React from 'react';
import ReactDOM from 'react-dom/client';
import './Styles/index.css';
import reportWebVitals from './reportWebVitals';

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';


const App = React.lazy(() => import('./Components/App'));
const Test = React.lazy(() => import('./Components/Test'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <React.Suspense fallback={<div></div>}>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<App />} />
              <Route path='/test/:id' element={<Test/>} />
          </Routes>
      </BrowserRouter>
    </React.Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
