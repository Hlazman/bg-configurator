import React, { useState, useContext, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './Context/AuthContext';
import { useLanguage } from './Context/LanguageContext';
import languageMap from './Languages/language';
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
import logo from './logo.svg';
import './App.css';
import { EditClientPage } from './Pages/EditClientPage';
import { EditOrderPage } from './Pages/EditOrderPage';
import { OrderDetailsPage } from './Pages/OrderDetailsPage';

// TEMP
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
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  // const [loading, setLoading] = useState(true);

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
      label: language.resetPass,
      key: 'resetPass',
      icon: <UserOutlined />,
      onClick: handleResetPassword
    },
    {
      label: language.logout,
      key: 'Logout',
      icon: <UserOutlined />,
      onClick: handleLogout
    },
  ];

  const handleChange = (value) => {
    console.log(`Selected: ${value}`);
  };

  const location = useLocation();
  const orderId = location.pathname.split('/').pop();

const getHeaderTitle = (location, Id) => {
  if (location.pathname.startsWith('/createorder/')) {
    return `${language.order} #${Id}`;
  }

  if (location.pathname.startsWith('/editorder/')) {
    return `${language.order} #${Id}`;
  }

  if (location.pathname.startsWith('/editclient/')) {
    return `${language.client} #${Id}`;
  }

  if (location.pathname.startsWith('/order/')) {
    return `${language.orderDetails} #${Id}`;
  }

  switch (location.pathname) {
    case '/':
      return language.orders;
    case '/clients':
      return language.clients;
    case '/createclient':
      return language.createClient;
    case '/files':
      return language.files;
      case '/resetpassword':
        return language.resetPass;
    case '/savepassword':
      return language.savePass;
    default:
      return language.notFound;
  }
};

  const headerTitle = getHeaderTitle(location, orderId);

  useEffect(() => {
    localStorage.setItem('savedPath', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith('/createorder/')) {
      localStorage.removeItem('currentOrder');
    }

    const savedPath = localStorage.getItem('savedPath');
    if (savedPath) {
      navigate(savedPath);
    } else {
      navigate('/');
    }
  }, [location.pathname, navigate]);
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f06d20',
          colorLink: '#f06d20',
          colorBgMask: 'rgba(0, 0, 0, 0.85)'
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
              <Navigation/>
          </Sider>
          
          <Layout>
            <Header className="header">

              <h1 className='headerTitle'>{headerTitle}</h1>

              <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
                <Dropdown.Button size="large" menu={{ items }} placement="bottom" icon={<UserOutlined />}>
                  {user.username}
                </Dropdown.Button>

                {/* {user?.role==='Admin' && ( */}
                  {/* <Select
                    key="Company"
                    size="large"
                    defaultValue="boki-poland" // TEMP
                    onChange={handleChange}
                    options={options} // TEMP
                  /> */}
                {/* )} */}
                
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
                  <Route path="/editclient/:clientId" element={<EditClientPage />} />
                  <Route path="/createorder" element={<CreateOrderPage />} />
                  <Route path="/createorder/:orderId" element={<CreateOrderPage />} />
                  <Route path="/editorder" element={<EditOrderPage />} />
                  <Route path="/editorder/:orderId" element={<EditOrderPage />} />
                  <Route path="/files" element={<FilesPage />} />
                  {/* <Route path="/order" element={<OrderDetailsPage />} /> */}
                  <Route path="/order/:orderId" element={<OrderDetailsPage />} />
                  <Route path="/resetpassword" element={<ResetPasswordPage />} />
                  <Route path="/savepassword" element={<SavePasswordPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </Content>

            <Footer style={{ textAlign: 'center', backgroundColor: 'white', marginTop:'30px' }}>
              ©2023 Created by
            </Footer>
          </Layout>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<AuthPage />} />
          {/* <Route path="/auth" element={<AuthPage />} /> */}
          {/* <Route path="*" element={<Navigate to="/auth" replace />} /> */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/savepassword" element={<SavePasswordPage />} />
        </Routes>
      )}
    </ConfigProvider>
  );
};

export default App;
