import React, { useState, useContext, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './Context/AuthContext';

import { NotFoundPage } from './Pages/NotFoundPage';
import { AuthPage } from './Pages/AuthPage';
import { RegistrationPage } from './Pages/RegistrationPage';
import { OrdersPage } from './Pages/OrdersPage';
import { OrderPage } from './Pages/OrderPage';
import { ClientsPage } from './Pages/ClientsPage';
import { CreateClientPage } from './Pages/CreateClientPage';
import { CreateOrderPage } from './Pages/CreateOrderPage';
import { CreateProductPage } from './Pages/CreateProductPage';
import { ResetPasswordPage } from './Pages/ResetPasswordPage';
import { SavePasswordPage } from './Pages/SavePasswordPage';
import { FilesPage } from './Pages/FilesPage';
import { ManagersPage } from './Pages/ManagersPage';
import { AboutCompanyPage } from './Pages/AboutCompanyPage';

import { ConfigProvider, Layout, Breadcrumb, Select } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

// import axios from 'axios'; // Импортируем библиотеку Axios

import { Navigation } from './Components/Navigation';
import languageMap from './Languages/language';

import logo from './logo.svg';
import './App.css';



// TEMP
import { NavLink } from 'react-router-dom'; 
// TEMP

const options = [];
  options.push(
    {
    value: 'boki-poland',
    label: 'boki-poland',
   }, 
   {
    value: 'boki-prague',
    label: 'boki-prague',
   }, 
  );
// TEMP

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const { isAuthenticated, isRouteAllowed, loginUser, user} = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    // TEMP FOR TESTING AUTH
    loginUser(1);
    // TEMP FOR TESTING AUTH
    // eslint-disable-next-line
  }, []);
  
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleChange = (value) => {
    console.log(`Selected: ${value}`);
  };

  const language = languageMap[selectedLanguage];


  const isAdmin = isAuthenticated() && user.role === 'Admin';
  const isManager = isAuthenticated() && user.role === 'Manager';
  const isManagerWithClientsPermission =
    isManager && user.permission.includes('Clients data');
  const isManagerWithProductsPermission =
    isManager && user.permission.includes('Products data');

  return (
    <ConfigProvider
        theme={{
        token: {
        colorPrimary: '#f06d20',
        colorLink: '#f06d20',
      },
    }}
    >
      <Layout style={{ minHeight: '100vh'}}>
        {isAuthenticated() && (
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <img src={logo} alt="Logo" style={{ width: '40%' }} />{' '}
          </div>
          <Navigation language={language} handleLanguageChange={handleLanguageChange} user={user}/>
        </Sider>
        )}
        <Layout>

         {isAuthenticated() && user.role==='Admin' && (
            <Select
              key='Company'
                size='large'
                defaultValue="boki-poland"
                onChange={handleChange}
                style={{
                  width: 200,
                }}
                options={options}
            />
          )}

        {/* TEMP */}
        <NavLink to="/order">{'ORDER'}</NavLink> 
        <NavLink to="/auth">{'AUTH'}</NavLink> 
          {/* TEMP */}
          
          <Header style={{ padding: 0, background: '#fff' }}>
            <Breadcrumb
              style={{ margin: '20px' }}
              items={[
                {
                  href: '',
                  title: <HomeOutlined />,
                },
                {
                  href: '',
                  title: (
                    <>
                      <UserOutlined />
                      <span>Application List</span>
                    </>
                  ),
                },
                {
                  title: 'Application',
                },               
              ]}
            />
          </Header>

          <Content style={{ margin: '0 16px' }}>
          <div className="App">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated() ? (
                    <OrdersPage />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route path="/auth" element={<AuthPage />} />
              {isRouteAllowed('/resetpassword') && (
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
              )}
              
              {isRouteAllowed('/savepassword') && (
                <Route path="/savepassword" element={<SavePasswordPage />} />
              )}

              {isAdmin && (
                <>
                  <Route path="/createclient" element={<CreateClientPage />} />
                  <Route path="/createproduct" element={<CreateProductPage />} />
                  <Route path="/registration" element={<RegistrationPage />} />
                  <Route path="/managers" element={<ManagersPage />} />
                  <Route path="/about" element={<AboutCompanyPage />} />
                </>
              )}

              {isManagerWithClientsPermission && (
                <Route path="/createclient" element={<CreateClientPage />} />
              )}

              {isManagerWithProductsPermission && (
                <Route path="/createproduct" element={<CreateProductPage />} />
              )}

              <Route path="/createorder" element={<CreateOrderPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/files" element={<FilesPage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </div>
          </Content>

          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2023 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
