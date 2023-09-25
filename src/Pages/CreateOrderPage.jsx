import React, { useState, useEffect } from 'react';
import { Steps, Form, Input, Button} from 'antd';
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
          />
        );
      case 1:
        return (
          <GroupDecorStep
            language={language}
        />
        );
        case 2:
        return (
          <FrameStep
            language={language}
          />
        );
      case 3:
        return (
          <ElementsStep
            language={language}
          />
        );
      case 4:
        return (
          <GroupAccessoriesStep
            language={language}
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

          <Button type="dashed" href="https://ant.design/index-cn" target="_blank">
            Find RAL colors
          </Button>

          <Button type="dashed" href="https://ant.design/index-cn" target="_blank">
            Find NSC colors
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
            // status: (currentStep === 0 ? 'process' : formData.doorStep ? 'finish' : 'error'),
          },
          {
            title: 'Decor',
            // status: (currentStep === 1 ? 'process' : formData.step2Field ? 'finish' : 'error'),
          },
          // {
          //   title: 'Decor',
            // status: (
            //   currentStep === 1
            //     ? 'process'
            //     : (formData.step2Field || formData.step3Field)
            //       ? 'finish'
            //       : 'error'
            // ),
          // },
          {
            title: 'Frame',
            // status: (currentStep === 2 ? 'process' : formData.step4Field ? 'finish' : 'error'),
          },
          {
            title: 'Elements',
            // status: (currentStep === 2 ? 'process' : formData.step4Field ? 'finish' : 'error'),
          },
          {
            title: 'Fitting',
            // status: (currentStep === 4 ? 'process' : formData.step5Field ? 'finish' : 'error'),
            // status: (
            //   currentStep === 4
            //     ? 'process'
            //     : (formData.hingesStep || formData.knobeStep || formData.lockStep || formData.skirtingStep)
            //       ? 'finish'
            //       : 'error'
            // ),
          },
          {
            title: 'Options',
            // status: (currentStep === 5 ? 'process' : formData.step6Field ? 'finish' : 'error'),
          },
          {
            title: 'Information',
            // status: (currentStep === 6 ? 'process' : formData.step7Field ? 'finish' : 'error'),
          },
        ]}
      >

      </Steps>

      {renderFormStep()}
    </div>
  );
};

