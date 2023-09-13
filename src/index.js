import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './Context/AuthContext'
// import { ProductVariantProvider } from './Context/ProductVariantContext'
import { OrderProvider } from './Context/OrderContext'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Router>
      <AuthProvider>
        {/* <ProductVariantProvider> */}
        <OrderProvider>
          <App />
        </OrderProvider>
        {/* </ProductVariantProvider> */}
      </AuthProvider>
    </Router>
  // </React.StrictMode>
);

reportWebVitals();
