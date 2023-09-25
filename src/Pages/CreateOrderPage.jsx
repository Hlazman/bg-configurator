import React, { useState, useEffect } from 'react';
import { Steps, Form, Input, Button, Dropdown} from 'antd';
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


export const CreateOrderPage = ({language}) => {

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
    informationSend: false,
  });


  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

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

  // useEffect(() => {
  //   handleCreateOrder();
  // },[])

  const { orderId: urlOrderId } = useParams();

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
            language={language}
            setCurrentStepSend={setCurrentStepSend}
          />
        );
      case 1:
        return (
          <GroupDecorStep
            language={language}
            setCurrentStepSend={setCurrentStepSend}
        />
        );
        case 2:
        return (
          <FrameStep
            language={language}
            setCurrentStepSend={setCurrentStepSend}
          />
        );
      case 3:
        return (
          <ElementsStep
            language={language}
            setCurrentStepSend={setCurrentStepSend}
          />
        );
      case 4:
        return (
          <GroupAccessoriesStep
            language={language}
            setCurrentStepSend={setCurrentStepSend}
        />
        );
        case 5:
        return (
          <Form >
            <Form.Item name="step6Field" label="Шаг 5">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" htmlType="submit"> Отправить </Button>
          </Form>
        );
        case 6:
        return (
          <InformationStep
            language={language}
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
            RAL colors
          </Button>

          <Button type="dashed" icon={<SearchOutlined />} href="https://www.ncscolorguide.com/" target="_blank">
            NSC colors
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
            title: 'Door',
            status: (currentStep === 0 ? 'process' : currentStepSend.startDataSend && currentStepSend.canvasSend ? 'finish' : 'error'),
          },
          {
            title: 'Decor',
            status: (currentStep === 1 ? 'process' : currentStepSend.decorSend ? 'finish' : 'error'),
          },
          {
            title: 'Frame',
            status: (currentStep === 2 ? 'process' : currentStepSend.frameSend ? 'finish' : 'error'),
          },
          {
            title: 'Elements',
            status: (currentStep === 3 ? 'process' : currentStepSend.elementSend ? 'finish' : 'error'),
          },
          {
            title: 'Fitting',
            status: (
              currentStep === 4
                ? 'process'
                : (currentStepSend.fittingLockSend && currentStepSend.fittingHingeSend && currentStepSend.fittingKnobeSend )
                  ? 'finish'
                  : 'error'
            ),
          },
          {
            title: 'Options',
            status: (currentStep === 5 ? 'process' : currentStepSend.optionsSend ? 'finish' : 'error'),
          },
          {
            title: 'Information',
            status: (currentStep === 6 ? 'process' : currentStepSend.informationSend ? 'finish' : 'error'),
          },
        ]}
      >

      </Steps>

      {renderFormStep()}
    </div>
  );
};

