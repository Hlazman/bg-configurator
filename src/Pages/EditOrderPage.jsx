import React, { useState, useEffect } from 'react';
import { Steps, Form, Input, Button} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { OrderDrawer } from '../Components/OrderDrawer';
import GroupDoorStep from '../Components/CreateOrderSteps/GroupDoorStep';
import GroupDecorStep from '../Components/CreateOrderSteps/GroupDecorStep';
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

export const EditOrderPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const jwtToken = localStorage.getItem('token');  
  // const { addOrder, addSuborder, editOrderId } = useOrder();
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

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleEditOrder = async () => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
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
            // orderId: orderID
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
  
      const orderData = response.data.data.order.data.attributes;  
      // setOrderId(orderData);
  
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
          <GroupDecorStep />
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
          <Form >
            <Form.Item name="step6Field" label="Шаг 5">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
          </Form>
        );
        case 6:
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
        <div style={{display: 'flex', flexBasis: '50%' }}>
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
            title: 'Canvas',
            status: (currentStep === 0 ? 'process' : 'finish'),
          },
          {
            title: 'Decor',
            status: (currentStep === 1 ? 'process' : 'finish'),
          },
          {
            title: 'Frame',
            status: (currentStep === 2 ? 'process' : 'finish'),
          },
          {
            title: 'Elements',
            status: (currentStep === 3 ? 'process' : 'finish'),
          },
          {
            title: 'Fitting',
            status: (currentStep === 4 ? 'process' : 'finish'),
          },
          {
            title: 'Options',
            status: (currentStep === 5 ? 'process' : 'finish'),
          },
          {
            title: 'Information',
            status: (currentStep === 6 ? 'process' : 'finish'),
          },
        ]}
      >

      </Steps>

      {renderFormStep()}
    </div>
  );
};

