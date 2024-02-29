import React, { useState, useEffect } from 'react';
import { Steps, Button} from 'antd';
import { SearchOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { OrderDrawer } from '../Components/OrderDrawer';
import GroupDoorStep from '../Components/CreateOrderSteps/GroupDoorStep';
// import GroupDecorStep from '../Components/CreateOrderSteps/GroupDecorStep';
import GroupAccessoriesStep from '../Components/CreateOrderSteps/GroupAccessoriesStep';
import ElementsStep from '../Components/CreateOrderSteps/ElementsStep';
import InformationStep from '../Components/CreateOrderSteps/InformationStep';
import FrameStep from '../Components/CreateOrderSteps/FrameStep';
import axios from 'axios';
import { useOrder } from '../Context/OrderContext';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateColorDrawer } from '../Components/CreateColorDrawer';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import OptionsStep from '../Components/CreateOrderSteps/OptionsStep';
import OptionsAdditionalStep from '../Components/CreateOrderSteps/OptionsAdditionalStep';
import {queryLink} from '../api/variables'
import DecorSidesGroupStep from '../Components/CreateOrderSteps/DecorSidesGroupStep';

export const EditOrderPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const jwtToken = localStorage.getItem('token');  
  const { 
    orderId, setOrderId, 
    dorSuborderId, setDoorSuborderId, 
    frameSuborderId, setFrameSuborderId, 
    hingeSuborderId, sethiHgeSuborderId,
    knobeSuborderId, setKnobeSuborderId,
    lockSuborderId, setLockSuborderId,
   } = useOrder();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);

  // const handlePrev = () => {
  //   setCurrentStep(currentStep - 1);
  // };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleEditOrder = async () => {
    try {
      const response = await axios.post(
        queryLink,
        {
          query: `
            query Query($orderId: ID) {
              order(id: $orderId) {
                data {
                  id
                  attributes {
                    door_suborder {
                      data {
                        id
                      }
                    }
                    fitting_suborders {
                      data {
                        id
                        attributes {
                          type
                        }
                      }
                    }
                    frame_suborder {
                      data {
                        id
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            orderId: orderId
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const orderData = response?.data?.data?.order?.data?.attributes;
  
      const doorSuborderId = orderData.door_suborder.data.id;
      setDoorSuborderId(doorSuborderId);
  
      const frameSuborderId = orderData.frame_suborder.data.id;
      setFrameSuborderId(frameSuborderId);
  
      for (const fittingSuborder of orderData.fitting_suborders.data) {
        const fittingType = fittingSuborder.attributes.type;
        const fittingSuborderId = fittingSuborder.id;
        
        if (fittingType === 'hinge') {
          sethiHgeSuborderId(fittingSuborderId);
        } else if (fittingType === 'knobe') {
          setKnobeSuborderId(fittingSuborderId);
        } else if (fittingType === 'lock') {
          setLockSuborderId(fittingSuborderId);
        }
      }
  
      navigate(`/editorder/${orderId}`);
    } catch (error) {
      console.error('Error handling order data:', error);
    }
  };

  const { orderId: urlOrderId } = useParams();

  useEffect(() => {
    if (!orderId) {
      setOrderId(urlOrderId);
    } else {
      handleEditOrder();
    }
  }, [jwtToken, orderId, urlOrderId]);

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GroupDoorStep />
        );
      case 1:
        return (
          // <GroupDecorStep />
          <DecorSidesGroupStep />
        );
        case 2:
        return (
          <FrameStep />
        );
      case 3:
        return (
          <ElementsStep />
        );
      case 4:
        return (
          <GroupAccessoriesStep />
        );
        case 5:
        return (
          <OptionsStep />
        );
        case 6:
        return (
          <OptionsAdditionalStep />
        );
        case 7:
          return (
            <InformationStep />
          );
      default:
        return null;
    }
  };

  return (
    <div>
      
      <div style={{display: 'flex', margin: '25px 0', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{display: 'flex', flexBasis: '50%', gap: '15px' }}>
          <Button icon={<LeftCircleOutlined />} type="dashed" onClick={()=> navigate(`/orders`)}> {language.orderList} </Button>
          <OrderDrawer/>
        </div>
        
        <div style={{display: 'flex', gap: '20px' }}>
          <CreateColorDrawer/>

          <Button type="dashed" icon={<SearchOutlined />} href="https://www.ralcolorchart.com/" target="_blank">
            RAL {language.colors}
          </Button>

          <Button type="dashed" icon={<SearchOutlined />} href="https://www.ncscolorguide.com/" target="_blank">
            NSC {language.colors}
          </Button>
        </div>
      </div>

      <Steps
        style={{background: '#F8F8F8', border: '1px solid #DCDCDC', margin: '30px 0', borderRadius: '10px'}}
        current={currentStep} 
        type='navigation'
        onChange={handleStepClick}
        items={[
          {
            title: language.door,
            status: (currentStep === 0 ? 'process' : 'finish'),
          },
          {
            title: language.decor,
            status: (currentStep === 1 ? 'process' : 'finish'),
          },
          {
            title: language.frame,
            status: (currentStep === 2 ? 'process' : 'finish'),
          },
          {
            title: language.elements,
            status: (currentStep === 3 ? 'process' : 'finish'),
          },
          {
            title: language.fitting,
            status: (currentStep === 4 ? 'process' : 'finish'),
          },
          {
            title: language.options,
            status: (currentStep === 5 ? 'process' : 'finish'),
          },
          {
            title: language.additional,
            status: (currentStep === 6 ? 'process' : 'finish'),
          },
          {
            title: language.information,
            status: (currentStep === 7 ? 'process' : 'finish'),
          },
        ]}
      >

      </Steps>

      {renderFormStep()}
    </div>
  );
};

