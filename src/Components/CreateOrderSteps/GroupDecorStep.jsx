import React, { useState } from 'react';
import { Tabs } from 'antd';
import VeneerStep from './VeneerStep';
import PaintStep from './PaintStep';
import StoneStep from './StoneStep';
import MirrorStep from './MirrorStep';
import HPLStep from './HPLStep';
import axios from 'axios';

const GroupDecorStep = () => {
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
            query Query($orderId: ID) {
              order(id: $orderId) {
                data {
                  attributes {
                    door_suborder {
                      data {
                        id
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
                }
              }
            }
          `,
          variables: {
            orderId: orderIdToUse,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      
      const decorData = response.data.data.order?.data?.attributes?.door_suborder?.data?.attributes?.decor?.data;

      if (decorData && decorData.attributes && decorData.attributes.type === type) {
        setPreviousTitle(decorData.attributes.title);

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

  const checkDecor = async (type, title, decorData, setSelectedDecorId) => {
    const foundDecor = decorData.find(decor =>
      decor.attributes.type === type && decor.attributes.title.toLowerCase() === title.toLowerCase()
    );
  
    if (foundDecor) {
      setSelectedDecorId(foundDecor.id);
      console.log(`Найден декор c типом ${type} и названием ${title}`);
      console.log(foundDecor.id);
    } else {
      console.log(`Декор c типом ${type} и названием ${title} не найден. Cоздаем новый...`);
  
      try {
        const newDecorId = await createDecor({ title, type });
        fetchDecorData();
        setSelectedDecorId(newDecorId);
        console.log(`Декор успешно создан c id: ${newDecorId}`);
      } catch (error) {
        console.error('Ошибка при создании декора:', error);
      }
    }
  };

  const sendDecorForm = async (orderIdToUse, doorSuborder, selectedDecorId) => {
    // const updateDoorSuborderId = doorSuborder.data.id; // Получаем id субордера
    const updateDoorSuborderId = doorSuborder; // Получаем id субордера

    const data = {
      decor: selectedDecorId,
      order: orderIdToUse,
    };

    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateDoorSuborderId: ID!, $data: DoorSuborderInput!) {
              updateDoorSuborder(id: $updateDoorSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateDoorSuborderId: updateDoorSuborderId,
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
      console.log('Data sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending data:', error);
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
      ]}
    />
  );
};

export default GroupDecorStep;
