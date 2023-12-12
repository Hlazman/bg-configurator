import React, { useState, useContext, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './Context/AuthContext';
import { useLanguage } from './Context/LanguageContext';
import languageMap from './Languages/language';
import { NotFoundPage } from './Pages/NotFoundPage';
import { AuthPage } from './Pages/AuthPage';
import { OrdersPage } from './Pages/OrdersPage';
import { TotalOrderDetailsPage } from './Pages/TotalOrderDetailsPage';
import { ResetPasswordPage } from './Pages/ResetPasswordPage';
import { SavePasswordPage } from './Pages/SavePasswordPage';
import { ClientsPage } from './Pages/ClientsPage';
import { FilesPage } from './Pages/FilesPage';
import { CreateClientPage } from './Pages/CreateClientPage';
import { CreateOrderPage } from './Pages/CreateOrderPage';
import { ConfigProvider, Layout, Select, Dropdown, Form, BackTop } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Navigation } from './Components/Navigation';
import logo from './logo.svg';
import './App.css';
import { EditClientPage } from './Pages/EditClientPage';
import { EditOrderPage } from './Pages/EditOrderPage';
import { OrderDetailsPage } from './Pages/OrderDetailsPage';
import axios from 'axios';
import { useSelectedCompany } from './Context/CompanyContext';

import CreateTotalOrderPage from './Pages/CreateTotalOrderPage';
import EditTotalOrderPage from './Pages/EditTotalOrderPage';
import { TotalOrdersPage } from './Pages/TotalOrdersPage';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;

const App = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { selectedCompany, setSelectedCompany } = useSelectedCompany();
  const [companies, setCompanies] = useState([]);
  const jwtToken = localStorage.getItem('token');
  const [form] = Form.useForm();
  

  const handleSelectChange = (value) => {
    setSelectedCompany(value);
    localStorage.setItem('selectedCompanyId', value);
  };

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

  const location = useLocation();
  const pageId = location.pathname.split('/').pop();

const getHeaderTitle = (location, Id) => {
  if (location.pathname.startsWith('/createorder/') || location.pathname.startsWith('/editorder/')) {
    return `${language.order} #${Id}`;
  }

  if (location.pathname.startsWith('/createtotalorder/') || location.pathname.startsWith('/edittotalorder/')) {
    return `${language.totalOrder} #${Id}`;
  }

  if (location.pathname.startsWith('/editclient/')) {
    return `${language.client} #${Id}`;
  }

  if (location.pathname.startsWith('/order/')) {
    return `${language.orderDetails} #${Id}`;
  }

  if (location.pathname.startsWith('/totalorderdetails') && localStorage.getItem('presentation') === 'factory') {
    return `${language.factory}`;
  }

  if (location.pathname.startsWith('/totalorderdetails') && localStorage.getItem('presentation') === 'full') {
    return `${language.fullPresentation}`;
  }

  if (location.pathname.startsWith('/totalorderdetails') && localStorage.getItem('presentation') === 'short') {
    return `${language.shortPresentation}`;
  }

  switch (location.pathname) {
    case '/':
      return language.orders;
    case '/orders':
      return language.orderList;
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

  const headerTitle = getHeaderTitle(location, pageId);

  useEffect(() => {
    localStorage.setItem('savedPath', location.pathname);
  }, [location.pathname]);

  // TODO
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

  const fetchData = async () => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($filters: CompanyFiltersInput) {
              companies(filters: $filters) {
                data {
                  id
                  attributes {
                    name
                    managers {
                      data {
                        id
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            filters: {
              managers: {
                id: {
                  eq: user?.id
                }
              }
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          }
        }
      );
  
      setCompanies(response?.data?.data?.companies?.data);
      
      if (!localStorage.getItem('selectedCompanyId')) {
        if (user?.id === '4') {
          setSelectedCompany('1');
        } else if (user?.id === '5') {
          setSelectedCompany('2');
        } else {
          setSelectedCompany('3');
        }
        
        form.setFieldsValue({
          company: selectedCompany,
        });

        localStorage.setItem('selectedCompanyId', selectedCompany);
      } else {
        form.setFieldsValue({
          company: localStorage.getItem('selectedCompanyId'),
        });
        setSelectedCompany(localStorage.getItem('selectedCompanyId'));
      }

    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [jwtToken, user?.id, selectedCompany, form]);

  
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
            <BackTop />
              <h1 className='headerTitle'>{headerTitle}</h1>

              <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
                <Dropdown.Button size="large" menu={{ items }} placement="bottom" icon={<UserOutlined />}>
                  {user.username}
                </Dropdown.Button>
                
                <Form form={form}>
                  <Form.Item name='company'>
                    <Select
                      value={selectedCompany}
                      onChange={handleSelectChange}
                      style={{ width: 150 }}
                      size='large'
                    >
                      {companies.map((company) => (
                        <Option key={company.id} value={company.id}>
                          {company.attributes.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
                
              </div>
            </Header>

            <Content style={{ margin: '0 16px' }}>
              <div className="App">
                <Routes>
                  <Route path="/" element={<TotalOrdersPage />} />
                  <Route path="/auth" element={<Navigate to="/" replace />} />
                  <Route path="/totalorder" element={<Navigate to="/" replace />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/createtotalorder" element={<CreateTotalOrderPage/>} />
                  <Route path="/createtotalorder/:totalorderId" element={<CreateTotalOrderPage/>} />
                  <Route path="/edittotalorder" element={<EditTotalOrderPage/>} />
                  <Route path="/edittotalorder/:totalorderId" element={<EditTotalOrderPage/>} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/createclient" element={<CreateClientPage />} />
                  <Route path="/editclient/:clientId" element={<EditClientPage />} />
                  <Route path="/createorder" element={<CreateOrderPage />} />
                  <Route path="/createorder/:orderId" element={<CreateOrderPage/>} />
                  <Route path="/editorder" element={<EditOrderPage />} />
                  <Route path="/editorder/:orderId" element={<EditOrderPage />} />
                  <Route path="/files" element={<FilesPage />} />
                  <Route path="/order/:orderId" element={<OrderDetailsPage />} />
                  <Route path="/resetpassword" element={<ResetPasswordPage />} />
                  <Route path="/savepassword" element={<SavePasswordPage />} />
                  <Route path="*" element={<NotFoundPage />} />

                  <Route path="/totalorderdetails" element={<TotalOrderDetailsPage />} />
                </Routes>
              </div>
            </Content>

            <Footer style={{ textAlign: 'center', backgroundColor: 'white', marginTop:'30px' }}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <p> ©2023 Created by <a href="https://www.boki-group.com/" rel="noreferrer" target="_blank"> Boki Group </a> </p> 
              <p><a href="https://www.exchangerate-api.com" rel="noreferrer" target="_blank"> Rates By Exchange Rate API</a></p>
              </div>
            </Footer>
          </Layout>
        </Layout>
      ) : (
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/savepassword" element={<SavePasswordPage />} />
        </Routes>
      )}
    </ConfigProvider>
  );
};

export default App;
