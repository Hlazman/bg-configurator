import React, { useState } from 'react';
import { Tabs, message } from 'antd';
import VeneerStep from './VeneerStep';
import PaintStep from './PaintStep';
import StoneStep from './StoneStep';
import MirrorStep from './MirrorStep';
import HPLStep from './HPLStep';
import axios from 'axios';
import PrimerStep from './PrimerStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const GroupDecorElementStep = (elementID) => {
  const [activeTab, setActiveTab] = useState('veneer');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const jwtToken = localStorage.getItem('token');

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };
  
  const fetchOrderData = async (orderIdToUse, setPreviousTitle, type, setSelectedPaintFor, isPaintType) => {
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

      if (setSelectedPaintFor && decorData?.attributes?.type) {
        if (isPaintType) {
          if (decorData.attributes.type === 'paint' 
          || decorData.attributes.type === 'painted_glass' 
          || decorData.attributes.type === 'painted_veneer') {
            setSelectedPaintFor(decorData.attributes.type);
          }
        }
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
    let dataType = '';
    
    if (data.type === 'painted_glass' || data.type === 'painted_veneer') {
      dataType = 'paint';
    } else {
      dataType = data.type;
    }

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
              [dataType]: data.productId,
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

  // const checkDecor = async (type, title, decorData, setSelectedDecorId, productId) => {
  const checkDecor = async (type, title, decorData, setSelectedDecorId, productId, setDecorData) => {
    const foundDecor = decorData.find(decor =>
      decor.attributes.type === type && decor.attributes.title.toLowerCase() === title.toLowerCase()
    );
  
    if (foundDecor) {
      setSelectedDecorId(foundDecor.id);
      console.log(`Found ${type} ${title}`);
    } else {
      console.log(`Not Found ${type} ${title} Creating...`);
  
      try {
        const newDecorId = await createDecor({ title, type, productId});
        // fetchDecorData();
        fetchDecorData(setDecorData);
        setSelectedDecorId(newDecorId);
        console.log(`Created: ${newDecorId}`);
      } catch (error) {
        console.error('Error creating:', error);
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
      message.success(language.successQuery);
    } catch (error) {
      console.error('Error sending data:', error);
      message.error(language.errorQuery);
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
          label: language.veneer,
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
          label: language.paint,
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
          label: language.stoneware,
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
          label: language.mirror,
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
          label: language.hpl,
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
          label: language.primer,
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
