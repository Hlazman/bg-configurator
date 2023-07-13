import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

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

import { ConfigProvider } from 'antd';
import { Layout, Breadcrumb } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

import { Navigation } from './Components/Navigation';
import languageMap from './Languages/language';

import logo from './logo.svg';
import './App.css';


import { NavLink } from 'react-router-dom'; // TEMP

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const language = languageMap[selectedLanguage];

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
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <img src={logo} alt="Logo" style={{ width: '50%' }} />{' '}
          </div>
          <Navigation language={language} handleLanguageChange={handleLanguageChange} />
        </Sider>

        <Layout>
         {/* TEMP */}
         <NavLink to="/order">{'ORDER'}</NavLink> 
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
                <Route path="/" element={<OrdersPage />} />
                <Route path="/orders" element={<Navigate to="/" replace />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/createorder" element={<CreateOrderPage />} />
                <Route path="/createclient" element={<CreateClientPage />} />
                <Route path="/createproduct" element={<CreateProductPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/registartion" element={<RegistrationPage />} />
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
                <Route path="/savepassword" element={<SavePasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />



                <Route path="/order" element={<OrderPage />} />
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
