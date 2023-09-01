import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './Context/AuthContext'
import { ProductVariantProvider } from './Context/ProductVariantContext'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Router>
      <AuthProvider>
        <ProductVariantProvider>
          <App />
        </ProductVariantProvider>
      </AuthProvider>
    </Router>
  // </React.StrictMode>
);

reportWebVitals();
