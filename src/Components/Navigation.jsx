import React from 'react';
import { NavLink, useLocation} from 'react-router-dom';
import { Menu } from 'antd';
import { 
  DatabaseOutlined, UserOutlined, FormOutlined, UsergroupAddOutlined, FileOutlined, TranslationOutlined, SettingOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';


export const Navigation = () => {
  const { handleLanguageChange, selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  
  const location = useLocation();
  const isCreateOrderDisabled = location.pathname.startsWith('/createorder/');
  const createOrderContent = isCreateOrderDisabled ? 'Create Order' : <NavLink to="/createorder">{language.createOrder}</NavLink>;

  const menuItems = [
    { type: "divider" },
    {
      'key': "createorder", 
      'icon': <FormOutlined />,
      // 'label': ( <NavLink to="/createorder">{language.createOrder}</NavLink>),
      'label': createOrderContent,
      'disabled': isCreateOrderDisabled,
    },
    {
      'key': "createclient", 
      'icon': <UsergroupAddOutlined />,
      'label': (<NavLink to="/createclient">{language.createClient}</NavLink>)
    },
    { type: "divider" },
    {
      'key': "orders", 
      'icon': <DatabaseOutlined />,
      'label': (<NavLink to="/">{language.orders}</NavLink>)
    },
    {
      'key': "clients", 
      'icon': <UserOutlined />,
      'label': (<NavLink to="/clients">{language.clients}</NavLink>)
    },
    {
      'key': "files", 
      'icon': <FileOutlined />,
      'label': (<NavLink to="/files">{language.files} </NavLink>)
    }, 
    { type: "divider" },
    {
      'key': "adminPanel", 
      'icon': <SettingOutlined />,
      'label': (<a href="https://api.boki.fortesting.com.ua/admin" target="_blank" rel="noopener noreferrer"> {language.AdminPanel} </a>),
    }, 
    { type: "divider" },
    {
      'key': "subLang", 
      'icon': <TranslationOutlined />,
      'label': language.language, 
      'children': [
        {
          'key': "en", 
          'label': 'English',
          onClick: () => handleLanguageChange('en'),
        },
        {
          'key': "ua", 
          'label': 'Українська',
          onClick: () => handleLanguageChange('ua'),
        },
        {
          'key': "pl", 
          'label': 'Polski',
          onClick: () => handleLanguageChange('pl'),
        },
        {
          'key': "cs", 
          'label': 'Čeština',
          onClick: () => handleLanguageChange('cs'),
        },
        {
          'key': "es", 
          'label': 'Español',
          onClick: () => handleLanguageChange('es'),
        },
        {
          'key': "de", 
          'label': 'Deutsch',
          onClick: () => handleLanguageChange('de'),
        },
      ]
    },
  ];

    return (
    <Menu theme="dark" defaultSelectedKeys={['1']} mode="vertical" items={menuItems}/>
  );
};

