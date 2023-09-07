import React, { useState, useContext, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { ConfigProvider, Layout, Select, Dropdown, Spin} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Navigation } from './Components/Navigation';
import languageMap from './Languages/language';

import logo from './logo.svg';
import './App.css';
import { EditClientPage } from './Pages/EditClientPage';

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
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  // const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    return <Navigate to="/auth" replace />;
  };

  const navigate = useNavigate()
  const handleResetPassword = () => {
    return navigate('/resetpassword');
  };

  const items = [
    {
      label: 'Reset password',
      key: 'resetPass',
      icon: <UserOutlined />,
      onClick: handleResetPassword
    },
    {
      label: 'Logout',
      key: 'Logout',
      icon: <UserOutlined />,
      onClick: handleLogout
    },
  ];

  const handleLanguageChange = (language) => {
    localStorage.setItem('selectedLanguage', language);
    setSelectedLanguage(language);
  };

  const handleChange = (value) => {
    console.log(`Selected: ${value}`);
  };

  const language = languageMap[selectedLanguage];

  const location = useLocation();
  const orderId = location.pathname.split('/').pop();

const getHeaderTitle = (location, Id) => {
  if (location.pathname.startsWith('/createorder/')) {
    return `${language.order} #${Id}`;
  }

  if (location.pathname.startsWith('/editclient/')) {
    return `${language.client} #${Id}`;
  }

  switch (location.pathname) {
    case '/':
      return 'Orders';
    case '/clients':
      return 'Clients list';
    case '/createclient':
      return 'Create Client';
      case '/editclient':
      return 'Edit Client';
    case '/files':
      return 'Files and Instructions';
      case '/resetpassword':
        return 'Reset password';
    case '/savepassword':
      return 'Save password';
    default:
      return 'No such page';
  }
};

  const headerTitle = getHeaderTitle(location, orderId);

  useEffect(() => {
    setLoading(false);
  }, []);
  

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f06d20',
          colorLink: '#f06d20',
        },
      }}
    >
      {isAuthenticated() ? (
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

              <h1 className='headerTitle'>{headerTitle}</h1>

              <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>

                <Dropdown.Button size="large" menu={{ items }} placement="bottom" icon={<UserOutlined />}>
                  {user.username}
                </Dropdown.Button>

                {/* {user?.role==='Admin' && ( */}
                  <Select
                    key="Company"
                    size="large"
                    defaultValue="boki-poland"
                    onChange={handleChange}
                    options={options}
                  />
                {/* )} */}
                
              </div>
            </Header>

            <Content style={{ margin: '0 16px' }}>
              <div className="App">
                <Routes>
                  <Route path="/" element={<OrdersPage />} />
                  <Route path="/auth" element={<Navigate to="/" replace />} />
                  <Route path="/orders" element={<Navigate to="/" replace />} />
                  <Route path="/clients" element={<ClientsPage language={language}/>} />
                  <Route path="/createclient" element={<CreateClientPage />} />
                  <Route path="/editclient/:clientId" element={<EditClientPage />} />
                  {/* <Route path="/createorder" element={<CreateOrderPage />} /> */}
                  <Route path="/createorder/:orderId" element={<CreateOrderPage language={language}/>} />
                  <Route path="/files" element={<FilesPage />} />
                  <Route path="/resetpassword" element={<ResetPasswordPage />} />
                  <Route path="/savepassword" element={<SavePasswordPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </Content>

            <Footer style={{ textAlign: 'center', backgroundColor: 'white', marginTop:'30px' }}>
              Ant Design ©2023 Created by Ant UED
            </Footer>
          </Layout>
        </Layout>
      ) : (
        <Routes>
          <Route path="/auth" element={<AuthPage language={language} handleLanguageChange={handleLanguageChange}/>} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/savepassword" element={<SavePasswordPage />} />
        </Routes>
      )}
    </ConfigProvider>
  );
};

export default App;
