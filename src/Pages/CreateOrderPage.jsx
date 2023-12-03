import React, { useState, useEffect } from 'react';
import { Steps, Button} from 'antd';
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
import OptionsStep from '../Components/CreateOrderSteps/OptionsStep';
import OptionsAdditionalStep from '../Components/CreateOrderSteps/OptionsAdditionalStep';

export const CreateOrderPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const jwtToken = localStorage.getItem('token');  
  const { 
    orderId, setOrderId, 
    setDoorSuborderId, 
    setFrameSuborderId, 
    sethiHgeSuborderId,
    setKnobeSuborderId,
    setLockSuborderId,
   } = useOrder();
  
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { orderId: urlOrderId } = useParams();
  const [currentStepSend, setCurrentStepSend] = useState({
    startDataSend: false,
    canvasSend: false,
    decorSend: false,
    frameSend: false,
    elementSend: false,
    fittingLockSend: false,
    fittingKnobeSend: false,
    fittingHingeSend: false,
    optionsSend: false,
    optionsAdditionalSend: false,
    informationSend: false,
  });

  // const handlePrev = () => {
  //   setCurrentStep(currentStep - 1);
  // };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleCreateOrder = async () => {
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
      setOrderId(createdOrderId);
  
      const doorSuborderData = {
        data: {
          door: null,
          sizes: {
            height: null,
            thickness: null,
            width: null
          },
          decor: null,
          order: createdOrderId
        }
      };

      const doorSuborderResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateDoorSuborder($data: DoorSuborderInput!) {
              createDoorSuborder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: doorSuborderData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const newDoorSuborderId = doorSuborderResponse.data.data.createDoorSuborder.data.id;
      setDoorSuborderId(newDoorSuborderId);

      const frameSuborderData = {
        data: {
          order: createdOrderId
        }
      };
  
      const frameSuborderResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateFrameSuborder($data: FrameSuborderInput!) {
              createFrameSuborder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: frameSuborderData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const newFrameSuborderId = frameSuborderResponse.data.data.createFrameSuborder.data.id;
      setFrameSuborderId(newFrameSuborderId);

      const fittingTypes = ['hinge', 'knobe', 'lock'];

      for (const fittingType of fittingTypes) {
        const fittingSuborderData = {
          data: {
            type: fittingType,
            title: fittingType,
            order: createdOrderId
          }
        };
  
        const fittingSuborderResponse = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              mutation CreateFrameFitting($data: FrameFittingInput!) {
                createFrameFitting(data: $data) {
                  data {
                    id
                  }
                }
              }
            `,
            variables: fittingSuborderData,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
  
        const newFittingSuborderId = fittingSuborderResponse.data.data.createFrameFitting.data.id;
        if (fittingType === 'hinge') {
          sethiHgeSuborderId(newFittingSuborderId);
        } else if (fittingType === 'knobe') {
          setKnobeSuborderId(newFittingSuborderId);
        } else if (fittingType === 'lock') {
          setLockSuborderId(newFittingSuborderId);
        }
      }

      navigate(`/createorder/${createdOrderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  useEffect(() => {
    if (urlOrderId) {
      setOrderId(urlOrderId);
      navigate(`/editorder/`);
    } else {
      handleCreateOrder()
    }
  }, []);

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GroupDoorStep
            setCurrentStepSend={setCurrentStepSend}
          />
        );
      case 1:
        return (
          <GroupDecorStep
            setCurrentStepSend={setCurrentStepSend}
        />
        );
        case 2:
        return (
          <FrameStep
            setCurrentStepSend={setCurrentStepSend}
          />
        );
      case 3:
        return (
          <ElementsStep
            setCurrentStepSend={setCurrentStepSend}
          />
        );
      case 4:
        return (
          <GroupAccessoriesStep
            setCurrentStepSend={setCurrentStepSend}
        />
        );
        case 5:
        return (
          <OptionsStep
            setCurrentStepSend={setCurrentStepSend}
        />
        );
        case 6:
        return (
          <OptionsAdditionalStep
            setCurrentStepSend={setCurrentStepSend}
        />
        );
        case 7:
        return (
          <InformationStep
            setCurrentStepSend={setCurrentStepSend}
        />
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
            title: language.door,
            status: (currentStep === 0 ? 'process' : currentStepSend.startDataSend && currentStepSend.canvasSend ? 'finish' : 'error'),
          },
          {
            title: language.decor,
            status: (currentStep === 1 ? 'process' : currentStepSend.decorSend ? 'finish' : 'error'),
          },
          {
            title: language.frame,
            status: (currentStep === 2 ? 'process' : currentStepSend.frameSend ? 'finish' : 'error'),
          },
          {
            title: language.elements,
            status: (currentStep === 3 ? 'process' : currentStepSend.elementSend ? 'finish' : 'error'),
          },
          {
            title: language.fitting,
            status: (
              currentStep === 4
                ? 'process'
                : (currentStepSend.fittingLockSend && currentStepSend.fittingHingeSend && currentStepSend.fittingKnobeSend )
                  ? 'finish'
                  : 'error'
            ),
          },
          {
            title: language.options,
            status: (currentStep === 5 ? 'process' : currentStepSend.optionsSend ? 'finish' : 'error'),
          },
          {
            title: language.additional,
            status: (currentStep === 6 ? 'process' : currentStepSend.optionsAdditionalSend ? 'finish' : 'error'),
          },
          {
            title: language.information,
            status: (currentStep === 7 ? 'process' : currentStepSend.informationSend ? 'finish' : 'error'),
          },
        ]}
      >

      </Steps>

      {renderFormStep()}
    </div>
  );
};

