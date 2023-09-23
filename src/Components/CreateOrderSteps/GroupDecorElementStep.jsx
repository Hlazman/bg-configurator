import React, { useState } from 'react';
import { Tabs, message } from 'antd';
import VeneerStep from './VeneerStep';
import PaintStep from './PaintStep';
import StoneStep from './StoneStep';
import MirrorStep from './MirrorStep';
import HPLStep from './HPLStep';
import axios from 'axios';
import PrimerStep from './PrimerStep';

const GroupDecorElementStep = (elementID) => {
  const [activeTab, setActiveTab] = useState('veneer');
  const jwtToken = localStorage.getItem('token');

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };
  
  const fetchOrderData = async (orderIdToUse, setPreviousTitle, type) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
          query ElementSuborder($elementSuborderId: ID) {
            elementSuborder(id: $elementSuborderId) {
              data {
                attributes {
                  decor {
                    data {
                      id
                      attributes {
                        type
                        title
                      }
                    }
                  }
                }
              }
            }
          }
          `,
          variables: {
            elementSuborderId: elementID.elementID.toString(),
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
    
    const decorData = response.data.data.elementSuborder?.data?.attributes?.decor?.data;
    
    if (decorData && decorData.attributes && decorData.attributes.type === type) {
      const title = decorData.attributes.title;
      setPreviousTitle(title);
      }
    } catch (error) {
      console.error('Error fetching door suborder data:', error);
    }
  };

  const fetchDecorData = async (setDecorData) => {
    try {
      const decorResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Decors($pagination: PaginationArg) {
              decors(pagination: $pagination) {
                data {
                  attributes {
                    title
                    type
                  }
                  id
                }
              }
            }
          `,
          variables: {
            pagination: {
              limit: 100
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const decorData = decorResponse.data.data.decors.data;
      setDecorData(decorData);
    } catch (error) {
      console.error('Error fetching decor data:', error);
    }
  };

  const createDecor = async (data) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateDecor($data: DecorInput!) {
              createDecor(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {
              title: data.title,
              type: data.type,
              [data.type]: data.productId,
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      return response.data.data.createDecor.data.id;
    } catch (error) {
      console.error('Error creating decor:', error);
      throw error;
    }
  };

  const checkDecor = async (type, title, decorData, setSelectedDecorId, productId) => {
    const foundDecor = decorData.find(decor =>
      decor.attributes.type === type && decor.attributes.title.toLowerCase() === title.toLowerCase()
    );
  
    if (foundDecor) {
      setSelectedDecorId(foundDecor.id);
      console.log(`Найден декор с типом ${type} и названием ${title}`);
      console.log(foundDecor.id);
    } else {
      console.log(`Декор с типом ${type} и названием ${title} не найден. Создаем новый...`);
  
      try {
        const newDecorId = await createDecor({ title, type, productId});
        fetchDecorData();
        setSelectedDecorId(newDecorId);
        console.log(`Декор успешно создан с id: ${newDecorId}`);
      } catch (error) {
        console.error('Ошибка при создании декора:', error);
      }
    }
  };

  const sendDecorForm = async (orderIdToUse, doorSuborder, selectedDecorId) => {
    const data = {
      decor: selectedDecorId,
    };

    try {
      await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
              updateElementSuborder(id: $updateElementSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateElementSuborderId: elementID.elementID.toString(),
            data: data
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log('Data sent successfully:');
      message.success('Decor add successfully');
    } catch (error) {
      console.error('Error sending data:', error);
      message.error('Error to add Decor');
    }
  };

  return (
    <Tabs 
      type="card" 
      activeKey={activeTab} 
      onChange={handleTabChange}
      destroyInactiveTabPane={true}
      items={[
        {
          label: 'Veneer',
          key: 'veneer',
          children: 
            <VeneerStep 
              fetchDecorData={fetchDecorData}
              fetchOrderData={fetchOrderData}
              checkDecor={checkDecor}
              sendDecorForm={sendDecorForm} 
            />,
        },
        {
          label: 'Paint',
          key: 'paint',
          children: 
            <PaintStep 
            fetchDecorData={fetchDecorData}
            fetchOrderData={fetchOrderData}
            checkDecor={checkDecor}
            sendDecorForm={sendDecorForm}  
            />,
        },
        {
          label: 'Stoneware',
          key: 'stoneware',
          children: 
            <StoneStep 
            fetchDecorData={fetchDecorData}
            fetchOrderData={fetchOrderData}
            checkDecor={checkDecor}
            sendDecorForm={sendDecorForm} 
          />,
        },
        {
          label: 'Mirror',
          key: 'mirror',
          children: 
            <MirrorStep 
              fetchDecorData={fetchDecorData}
              fetchOrderData={fetchOrderData}
              checkDecor={checkDecor}
              sendDecorForm={sendDecorForm}
          />,
        },
        {
          label: 'HPL Panels',
          key: 'hpl',
          children: 
            <HPLStep 
            fetchDecorData={fetchDecorData}
            fetchOrderData={fetchOrderData}
            checkDecor={checkDecor}
            sendDecorForm={sendDecorForm}
            />,
        },
        {
          label: 'Primers',
          key: 'primer',
          children: 
            <PrimerStep 
            fetchDecorData={fetchDecorData}
            fetchOrderData={fetchOrderData}
            checkDecor={checkDecor}
            sendDecorForm={sendDecorForm} 
            />,
        },
      ]}
    />
  );
};

export default GroupDecorElementStep;
