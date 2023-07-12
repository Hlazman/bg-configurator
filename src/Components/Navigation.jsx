import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { 
  DatabaseOutlined, UserOutlined, FormOutlined, UsergroupAddOutlined, PieChartOutlined, UserAddOutlined, FileOutlined, 
  TranslationOutlined 
} from '@ant-design/icons';

export const Navigation = ({ language, handleLanguageChange }) => {
  const { SubMenu } = Menu;

  const items = [
    <Menu.Divider key="divider1" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,
    
    <Menu.Item key="1" icon={<DatabaseOutlined />}>
      <NavLink to="/">{language.orders}</NavLink>
    </Menu.Item>,
    
    <Menu.Item key="2" icon={<UserOutlined />}>
      <NavLink to="/clients">{language.clients}</NavLink>
    </Menu.Item>,
    
    <Menu.Divider key="divider2" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,
  
    <Menu.Item key="3" icon={<FormOutlined />}>
      <NavLink to="/createorder">{language.createOrder}</NavLink>
    </Menu.Item>,
  
    <Menu.Item key="4" icon={<UsergroupAddOutlined />}>
      <NavLink to="/createclient">{language.createClient}</NavLink>
    </Menu.Item>,
  
    <Menu.Item key="5" icon={<PieChartOutlined />}>
      <NavLink to="/createproduct">{language.createProduct}</NavLink>
    </Menu.Item>,
  
    <Menu.Item key="6" icon={<UserAddOutlined />}>
      <NavLink to="/registartion">{language.createManager}</NavLink>
    </Menu.Item>,
    
    <Menu.Divider key="divider3" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,
  
    <Menu.Item key="7" icon={<FileOutlined />}>
      <NavLink to="/files">{language.files} </NavLink>
    </Menu.Item>,
    
    <Menu.Divider key="divider4" style={{ borderColor: '#fff', width: '80%', margin: '15px auto' }} />,
    
    <SubMenu key="sub1" icon={<TranslationOutlined />} title={language.language}>
      <Menu.Item onClick={() => handleLanguageChange('en')} key="en">English</Menu.Item>
      <Menu.Item onClick={() => handleLanguageChange('ua')} key="ua">Українська</Menu.Item>
      <Menu.Item onClick={() => handleLanguageChange('pl')} key="pl">Polski</Menu.Item>
      <Menu.Item onClick={() => handleLanguageChange('cs')} key="cs">Čeština</Menu.Item>
      <Menu.Item onClick={() => handleLanguageChange('es')} key="es">Español</Menu.Item>
      <Menu.Item onClick={() => handleLanguageChange('de')} key="de">Deutsch</Menu.Item>
    </SubMenu>,
  ];

  return (
    <Menu theme="dark" defaultSelectedKeys={['1']} mode="vertical">
      {items}
    </Menu>
  );
};
