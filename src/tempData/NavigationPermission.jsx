import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { 
  DatabaseOutlined, UserOutlined, FormOutlined, UsergroupAddOutlined, PieChartOutlined, UserAddOutlined, FileOutlined, 
  TranslationOutlined, AuditOutlined, BankOutlined,
} from '@ant-design/icons';

export const Navigation = ({ language, handleLanguageChange, user }) => {
  
  const menuItems = [
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
      'key': "managers", 
      'icon': <AuditOutlined />,
      'label': (<NavLink to="/managers">{language.managers}</NavLink>)
    },
    { type: "divider" },
    {
      'key': "createorder", 
      'icon': <FormOutlined />,
      'label': ( <NavLink to="/createorder">{language.createOrder}</NavLink>)
    },
    {
      'key': "createclient", 
      'icon': <UsergroupAddOutlined />,
      'label': (<NavLink to="/createclient">{language.createClient}</NavLink>)
    },
    {
      'key': "createproduct", 
      'icon': <PieChartOutlined />,
      'label': (<NavLink to="/createproduct">{language.createProduct}</NavLink>)
    },
    {
      'key': "registartion", 
      'icon': <UserAddOutlined />,
      'label': (<NavLink to="/registration">{language.createManager}</NavLink>)
    }, 
    { type: "divider" },
    {
      'key': "aboutCompany", 
      'icon': <BankOutlined />,
      'label': (<NavLink to="/about">{language.aboutCompany} </NavLink>)
    },
    {
      'key': "files", 
      'icon': <FileOutlined />,
      'label': (<NavLink to="/files">{language.files} </NavLink>)
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

  const isAdmin = user?.role === "Admin";
  const hasProductsPermission = user?.permission?.includes("Products data");
  const hasClientsPermission = user?.permission?.includes("Clients data");

  const filteredMenuItems = menuItems.filter((item) => {
    if (!isAdmin) {
      if (item.key === "createclient" && !hasClientsPermission) {
        return false;
      }

      if (item.key === "createproduct" && !hasProductsPermission) {
        return false;
      }

      if (item.key === "managers" || item.key === "aboutCompany" || item.key === "registartion") {
        return false;
      }
    }
    return true;
  });

    return (
    <Menu theme="dark" defaultSelectedKeys={['1']} mode="vertical" items={filteredMenuItems}/>
  );
};
