import { useState } from 'react';
import { Route, Routes, useNavigate, NavLink, Navigate } from 'react-router-dom';

import { NotFoundPage } from './Pages/NotFoundPage';
import { AuthPage } from './Pages/AuthPage';
import { RegistrationPage } from './Pages/RegistrationPage';
import { OrdersPage } from './Pages/OrdersPage';
import { ClientsPage } from './Pages/ClientsPage';
import { CreateClientPage } from './Pages/CreateClientPage';
import { CreateOrderPage } from './Pages/CreateOrderPage';
import { CreateProductPage } from './Pages/CreateProductPage';
import { ResetPasswordPage } from './Pages/ResetPasswordPage';
import { SavePasswordPage } from './Pages/SavePasswordPage';
import { FilesPage } from './Pages/FilesPage';

import { ConfigProvider } from 'antd';
import { FileOutlined, DatabaseOutlined, UsergroupAddOutlined, UserAddOutlined, FormOutlined,
  PieChartOutlined, UserOutlined, HomeOutlined, TranslationOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu } from 'antd';

import logo from './logo.svg'
import './App.css';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const items = [
  <Menu.Divider key="divider1" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,
  
  <Menu.Item key="1" icon={<DatabaseOutlined />}>
    <NavLink to="/">Orders</NavLink>
  </Menu.Item>,
  
  <Menu.Item key="2" icon={<UserOutlined />}>
    <NavLink to="/clients">Clients</NavLink>
  </Menu.Item>,
  
  <Menu.Divider key="divider2" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,

  <Menu.Item key="3" icon={<FormOutlined />}>
    <NavLink to="/createorder">Create Order</NavLink>
  </Menu.Item>,

  <Menu.Item key="4" icon={<UsergroupAddOutlined />}>
    <NavLink to="/createclient">Create Client</NavLink>
  </Menu.Item>,

  <Menu.Item key="5" icon={ <PieChartOutlined />}>
    <NavLink to="/createproduct">Create Product </NavLink>
  </Menu.Item>,

  <Menu.Item key="6" icon={<UserAddOutlined />}>
    <NavLink to="/registartion">Create Manager </NavLink>
  </Menu.Item>,
  
  <Menu.Divider key="divider3" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,

  <Menu.Item key="7" icon={<FileOutlined />}>
    <NavLink to="/files">Files </NavLink>
  </Menu.Item>,
  
  <Menu.Divider key="divider4" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,
  
  <SubMenu key="sub1" icon={<TranslationOutlined />} title="Language">
    <Menu.Item key="en">English</Menu.Item>
    <Menu.Item key="ua">Українська</Menu.Item>
    <Menu.Item key="pl">Polski</Menu.Item>
    <Menu.Item key="cs">Čeština</Menu.Item>
    <Menu.Item key="es">Español</Menu.Item>
    <Menu.Item key="de">Deutsch</Menu.Item>
  </SubMenu>,
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Хранение выбранного языка

  const navigate = useNavigate(); // Объект навигации

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language); // Обновление выбранного языка
    // Выполнение перехода на соответствующий путь с языком
    navigate(`/${language}/`);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#f06d20',
          colorLink: '#f06d20',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            {' '}
            <img src={logo} alt="Logo" style={{ width: '50%' }} />{' '}
          </div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="vertical">
            {items}
          </Menu>
        </Sider>

        <Layout>
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
