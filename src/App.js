import './App.css';
import { Button, ConfigProvider } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { NotFoundPage } from './Pages/NotFoundPage';
import { AuthPage } from './Pages/AuthPage';
import { TempPage } from './Pages/TempPage';


function App() {

  return (

    <div className="App">
      <Routes>
        <Route path="/" element={<TempPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  
  );
}

export default App;
