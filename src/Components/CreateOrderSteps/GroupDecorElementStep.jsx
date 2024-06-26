import React, { useState, useEffect } from 'react';
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
import {queryLink} from '../../api/variables'
import {validateDecorElementsDisabled} from '../../api/validationOrder';

const GroupDecorElementStep = ({elementID, realElementId, showBronzeGold}) => {
  const [activeTab, setActiveTab] = useState('paint');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const jwtToken = localStorage.getItem('token');
  const [messageApi, contextHolder] = message.useMessage();
  const [previesDecorId, setPreviesDecorId] = useState('');

  const [hasDecor, setHasDecor] = useState({
    ceramogranite: {hasStoneware: false},
    veneer: {hasVeneer: false},
    primer: {hasPrimer: false},
    HPL: {hasHPL: false},
    paint: {hasPaint: false},
    mirror: {hasGlass: false},
  });

  const getHasDecors = async () => {
    const decorProperties = await validateDecorElementsDisabled(jwtToken, realElementId);
    setHasDecor(decorProperties);
  };

  useEffect(() => {
    getHasDecors();
  }, [jwtToken, realElementId]);

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };
  
  const fetchOrderData = async (orderIdToUse, setPreviousTitle, type, setSelectedPaintFor, isPaintType) => {
    try {
      const response = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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
            elementSuborderId: elementID,
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

    setPreviesDecorId(decorData?.id);
    
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
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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
              limit: 2000
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
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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
  
      return response?.data?.data?.createDecor?.data?.id;
    } catch (error) {
      console.error('Error creating decor:', error);
      throw error;
    }
  };

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
      // decor: selectedDecorId,
      decor: selectedDecorId!== null ? selectedDecorId : previesDecorId,
    };

    try {
      await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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
            updateElementSuborderId: elementID,
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
      messageApi.success(language.successQuery);

    } catch (error) {
      messageApi.error(language.errorQuery);
    }
  };

  return (
  <>
    {contextHolder}
    <Tabs 
      type="card" 
      activeKey={activeTab} 
      onChange={handleTabChange}
      destroyInactiveTabPane={true}
      items={[
        {
          label: language.veneer,
          key: 'veneer',
          disabled: hasDecor.veneer.hasVeneer,
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
          disabled: hasDecor.paint.hasPaint,
          children: 
            <PaintStep
              fetchDecorData={fetchDecorData}
              fetchOrderData={fetchOrderData}
              checkDecor={checkDecor}
              sendDecorForm={sendDecorForm}
              // colorRangeFilter={false}
              colorRangeFilter={true}
              showBronzeGold={showBronzeGold}
            />,
        },
        {
          label: language.stoneware,
          key: 'stoneware',
          disabled: hasDecor.ceramogranite.hasStoneware,
          children: 
            <StoneStep 
            fetchDecorData={fetchDecorData}
            fetchOrderData={fetchOrderData}
            checkDecor={checkDecor}
            sendDecorForm={sendDecorForm}
          />,
        },
        {
          label: `${language.mirror} / ${language.glass}`,
          key: 'mirror',
          disabled: hasDecor.mirror.hasGlass,
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
          disabled: hasDecor.HPL.hasHPL,
          children: 
            <HPLStep 
            fetchDecorData={fetchDecorData}
            fetchOrderData={fetchOrderData}
            checkDecor={checkDecor}
            sendDecorForm={sendDecorForm}
            />,
        },
        {
          label: language.primers,
          key: 'primer',
          disabled: hasDecor.primer.hasPrimer,
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
  </>
  );
};

export default GroupDecorElementStep;
