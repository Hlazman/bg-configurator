import React, { useState, useEffect } from 'react';
import { Tabs, message, Affix, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
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
import {checkDecorSecondSide, removeDecorSecondSide} from '../../api/decor'
import {validateDecor} from '../../api/validationOrder';
import { useOrder } from '../../Context/OrderContext';

const GroupDecorStepSecond = ({ setCurrentStepSend, currentStepSend }) => {
  const { orderId } = useOrder();
  const orderIdToUse = orderId;
  const [activeTab, setActiveTab] = useState('paint');
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [messageApi, contextHolder] = message.useMessage();
  const [btnColor, setBtnColor] = useState('#ff0505');
  const [isDataSecondDecor, setIsDataSecondDecor] = useState(true);

  const [previesDecorId, setPreviesDecorId] = useState('');

  const [hasDecor, setHasDecor] = useState({
    ceramogranite: {hasStoneware: false},
    veneer: {hasVeneer: false},
    primer: {hasPrimer: false},
    HPL: {hasHPL: false},
    paint: {hasPaint: false},
    mirror: {hasGlass: false},
  });

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };
  
  const fetchOrderData = async (orderIdToUse, setPreviousTitle, type, setSelectedPaintFor, isFetch) => {
    try {
      const response = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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
                          otherSideDecor {
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
      
      const decorData = response.data.data.order?.data?.attributes?.door_suborder?.data?.attributes?.otherSideDecor?.data;

      setPreviesDecorId(decorData?.id)

      if (decorData && decorData.attributes && decorData.attributes.type === type) {
        setPreviousTitle(decorData.attributes.title);
      }

      if (setSelectedPaintFor && decorData?.attributes?.type) {
        if (isFetch) {
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
      // console.log(`Found ${type} ${title}`);
    } else {
      console.log(`Not found ${type}  ${title} . Creating...`);
  
      try {
        const newDecorId = await createDecor({ title, type, productId});
        fetchDecorData(setDecorData);
        setSelectedDecorId(newDecorId);
        // console.log(`Created: ${newDecorId}`);
      } catch (error) {
        console.error('Error creating:', error);
      }
    }
  };

  const sendDecorForm = async (orderIdToUse, doorSuborder, selectedDecorId) => {
    const updateDoorSuborderId = doorSuborder;

    const data = {
      // decor: selectedDecorId,
      // otherSideDecor: selectedDecorId,
      otherSideDecor: selectedDecorId!== null ? selectedDecorId : previesDecorId,
      order: orderIdToUse,
    };

    try {
      const response = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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

      // if (response.data.errors) {
      //   throw new Error()
      // } else {
      //   messageApi.success(language.successQuery);

      //   if (setCurrentStepSend) {
      //     setCurrentStepSend(prevState => {
      //       return {
      //         ...prevState,
      //         decorSend: true
      //       };
      //     });
      //   }
      // }

      messageApi.success(language.successQuery);

        if (setCurrentStepSend) {
          setCurrentStepSend(prevState => {
            return {
              ...prevState,
              decorSend: true
            };
          });
        }

      await getHasDecors();
      await checkDecorSecondSide(jwtToken, orderIdToUse, setIsDataSecondDecor);

    } catch (error) {
      console.error('Error sending data:', error);
      messageApi.error(`${language.errorQuery}. ${language.wrongDecor}`);
    }
  };

  const getHasDecors = async () => {
    const decorProperties = await validateDecor(orderIdToUse, jwtToken);
    setHasDecor(decorProperties);
  };

  useEffect(() => {
    getHasDecors();
    checkDecorSecondSide(jwtToken, orderIdToUse, setIsDataSecondDecor);
  }, [orderIdToUse, jwtToken, isDataSecondDecor]);

  return (
    <>
       <div style={{ position: 'absolute', top: '-50px', right: '20px'}}>
        <Button
          disabled={isDataSecondDecor} 
          danger 
          htmlType="submit" 
          icon={<DeleteOutlined />} 
          onClick={() => removeDecorSecondSide(jwtToken, orderIdToUse, setIsDataSecondDecor, messageApi, language)}>
          {`${language.delete} ${language.decor}`}
        </Button>
      </div>

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
                currentStepSend={currentStepSend}
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
                currentStepSend={currentStepSend}
                colorRangeFilter={true}
                showBronzeGold={false}
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
              currentStepSend={currentStepSend}
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
                currentStepSend={currentStepSend}
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
              currentStepSend={currentStepSend}
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
              currentStepSend={currentStepSend}
              />,
          },
        ]}
      />
    </>
  );
};

export default GroupDecorStepSecond;
