import React, { useState, useContext, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './Context/AuthContext';

import { NotFoundPage } from './Pages/NotFoundPage';
import { AuthPage } from './Pages/AuthPage';
import { OrdersPage } from './Pages/OrdersPage';
import { ResetPasswordPage } from './Pages/ResetPasswordPage';
import { SavePasswordPage } from './Pages/SavePasswordPage';
import { ClientsPage } from './Pages/ClientsPage';
import { FilesPage } from './Pages/FilesPage';
import { CreateClientPage } from './Pages/CreateClientPage';
import { CreateOrderPage } from './Pages/CreateOrderPage';

import { ConfigProvider, Layout, Select, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Navigation } from './Components/Navigation';
import languageMap from './Languages/language';

import logo from './logo.svg';
import './App.css';

const options = [
  {
    value: 'boki-poland',
    label: 'boki-poland',
  },
  {
    value: 'boki-prague',
    label: 'boki-prague',
  },
];

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const { isAuthenticated, loginUser, user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const items = [
    {
      label: 'Reset password',
      key: 'resetPass',
      icon: <UserOutlined />,
    },
    {
      label: 'Logout',
      key: 'Logout',
      icon: <UserOutlined />,
    },
  ];

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

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f06d20',
          colorLink: '#f06d20',
        },
      }}
    >
      {isAuthenticated() ? ( // If user is authenticated
        <Layout style={{ minHeight: '100vh' }}>
          <Sider 
            style={{ zIndex: '1000000' }} 
            collapsible 
            collapsed={collapsed} 
            onCollapse={setCollapsed} 
            breakpoint="md"
            >
              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <img src={logo} alt="Logo" style={{ width: '40%' }} />{' '}
              </div>
              <Navigation language={language} handleLanguageChange={handleLanguageChange} />
          </Sider>
          <Layout>
            <Header className="header">
              <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
                
                <Dropdown.Button size="large" menu={{ items }} placement="bottom" icon={<UserOutlined />}>
                  {user?.firstName}
                </Dropdown.Button>

                {user?.role==='Admin' && (
                  <Select
                    key="Company"
                    size="large"
                    defaultValue="boki-poland"
                    onChange={handleChange}
                    options={options}
                  />
                )}
                
              </div>
            </Header>

            <Content style={{ margin: '0 16px' }}>
              <div className="App">
                <Routes>
                  <Route path="/" element={<OrdersPage />} />
                  <Route path="/auth" element={<Navigate to="/" replace />} />
                  <Route path="/orders" element={<Navigate to="/" replace />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/createclient" element={<CreateClientPage />} />
                  <Route path="/createorder" element={<CreateOrderPage />} />
                  <Route path="/files" element={<FilesPage />} />
                  <Route path="/resetpassword" element={<ResetPasswordPage />} />
                  <Route path="/savepassword" element={<SavePasswordPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </Content>

            <Footer style={{ textAlign: 'center', backgroundColor: 'white' }}>
              Ant Design ©2023 Created by Ant UED
            </Footer>
          </Layout>
        </Layout>
      ) : ( // If user is not authenticated
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/savepassword" element={<SavePasswordPage />} />
        </Routes>
      )}
    </ConfigProvider>
  );
};

export default App;

