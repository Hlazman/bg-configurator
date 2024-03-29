import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
// import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './Context/AuthContext'
import { SelectedCompanyProvider } from './Context/CompanyContext'
import { OrderProvider } from './Context/OrderContext'
import { TotalOrderProvider } from './Context/TotalOrderContext'
import { LanguageProvider  } from './Context/LanguageContext';
import { ErrorsProvider  } from './Context/ErrorsOrderContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Router>
      <LanguageProvider>
      <AuthProvider>
        <SelectedCompanyProvider>
          <TotalOrderProvider>
            {/* <ErrorsProvider> */}
              <OrderProvider>
                <ErrorsProvider>
                  <App />
                </ErrorsProvider>
              </OrderProvider>
            {/* </ErrorsProvider> */}
          </TotalOrderProvider>
        </SelectedCompanyProvider>
      </AuthProvider>
      </LanguageProvider>
    </Router>
  // </React.StrictMode>
);

reportWebVitals();
