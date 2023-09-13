import React from 'react';
import { NavLink, useNavigate  } from 'react-router-dom';
import { Menu } from 'antd';
import { 
  DatabaseOutlined, UserOutlined, FormOutlined, UsergroupAddOutlined, FileOutlined, TranslationOutlined, SettingOutlined,
} from '@ant-design/icons';
import axios from 'axios';

import { useProductVariant } from '../Context/ProductVariantContext';

export const Navigation = ({ language, handleLanguageChange }) => {


  const navigate = useNavigate();
  const jwtToken = localStorage.getItem('token');
  
  const { updateProductVariantId } = useProductVariant();

  const handleCreateOrderClick = async () => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateOrder($data: OrderInput!) {
              createOrder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {}
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const createdOrderId = response.data.data.createOrder.data.id;
      const createProductVariantData = {
        data: {
          door: null,
        },
      };
  
      const createProductVariantResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateProductVariant($data: ProductVariantInput!) {
              createProductVariant(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: createProductVariantData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const newProductVariantId = createProductVariantResponse.data.data.createProductVariant.data.id;
      updateProductVariantId(newProductVariantId);

       const createSuborderData = {
        data: {
          order: createdOrderId,
          amount: 1,
          product_variant: newProductVariantId,
        },
      };
    
      await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateSuborder($data: SuborderInput!) {
              createSuborder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: createSuborderData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      navigate(`/createorder/${createdOrderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const menuItems = [
    { type: "divider" },
    {
      'key': "createorder", 
      'icon': <FormOutlined />,
      'label': ( <NavLink to="/createorder">{language.createOrder}</NavLink>),
      onClick: handleCreateOrderClick
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
      'label': (<a href="https://www.google.com" target="_blank" rel="noopener noreferrer"> {language.AdminPanel} </a>),
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
