import React, { useState, useEffect } from 'react';
import { Steps, Form, Input, Button, Divider} from 'antd';
import { OrderDetails } from '../Components/OrderDetails';
import GroupDoorStep from '../Components/CreateOrderSteps/GroupDoorStep';
import GroupDecorStep from '../Components/CreateOrderSteps/GroupDecorStep';
import GroupAccessoriesStep from '../Components/CreateOrderSteps/GroupAccessoriesStep';
import ElementsStep from '../Components/CreateOrderSteps/ElementsStep';
import { useParams } from 'react-router-dom';
import InformationStep from '../Components/CreateOrderSteps/InformationStep';
import FrameStep from '../Components/CreateOrderSteps/FrameStep';

import axios from 'axios';
import { useOrder } from '../Context/OrderContext';
import { useNavigate  } from 'react-router-dom';

export const CreateOrderPage = ({language}) => {


  const jwtToken = localStorage.getItem('token');  
  const { addOrder, addSuborder, order } = useOrder();
  const navigate = useNavigate();

  const { orderId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    doorStep: null,
    veenerStep: null,
    step2Field: null,
    step3Field: null,
    step4Field: null,
    step5Field: null,
    step6Field: null,
    step7Field: null,
    hingesStep: null,
    knobeStep: null,
    lockStep: null,
    skirtingStep: null,
  });

  const handleFormSubmit = (values) => {
    setFormData({ ...formData, ...values });
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleFormValuesChange = (changedValues) => {
    setFormData((prevFormData) => ({ ...prevFormData, ...changedValues }));
  };

  const handleCardClick = (step, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [step]: prevFormData[step] === value ? null : value,
    }));
    console.log(formData)
  };
   
  // const handleCreateOrder = async () => {
  //   try {
  //     const response = await axios.post(
  //       'https://api.boki.fortesting.com.ua/graphql',
  //       {
  //         query: `
  //           mutation CreateOrder($data: OrderInput!) {
  //             createOrder(data: $data) {
  //               data {
  //                 id
  //               }
  //             }
  //           }
  //         `,
  //         variables: {
  //           data: {}
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
  
  //     const createdOrderId = response.data.data.createOrder.data.id;  
  //     addOrder({ id: createdOrderId });
  
  //     const doorSuborderData = {
  //       data: {
  //         door: null,
  //         sizes: {
  //           height: null,
  //           thickness: null,
  //           width: null
  //         },
  //         decor: null,
  //         order: createdOrderId
  //       }
  //     };

  //     const doorSuborderResponse = await axios.post(
  //       'https://api.boki.fortesting.com.ua/graphql',
  //       {
  //         query: `
  //           mutation CreateDoorSuborder($data: DoorSuborderInput!) {
  //             createDoorSuborder(data: $data) {
  //               data {
  //                 id
  //               }
  //             }
  //           }
  //         `,
  //         variables: doorSuborderData,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
  
  //     const newDoorSuborderId = doorSuborderResponse.data.data.createDoorSuborder.data.id;
  //     addSuborder('doorSub', newDoorSuborderId);

  //     const frameSuborderData = {
  //       data: {
  //         order: createdOrderId
  //       }
  //     };
  
  //     const frameSuborderResponse = await axios.post(
  //       'https://api.boki.fortesting.com.ua/graphql',
  //       {
  //         query: `
  //           mutation CreateFrameSuborder($data: FrameSuborderInput!) {
  //             createFrameSuborder(data: $data) {
  //               data {
  //                 id
  //               }
  //             }
  //           }
  //         `,
  //         variables: frameSuborderData,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
  
  //     const newFrameSuborderId = frameSuborderResponse.data.data.createFrameSuborder.data.id;
  //     addSuborder('frameSub', newFrameSuborderId);
  
  //     // Запрос для создания FrameFitting
  //     const frameFittingData = {
  //       data: {
  //         order: createdOrderId
  //       }
  //     };
  
  //     const frameFittingResponse = await axios.post(
  //       'https://api.boki.fortesting.com.ua/graphql',
  //       {
  //         query: `
  //           mutation CreateFrameFitting($data: FrameFittingInput!) {
  //             createFrameFitting(data: $data) {
  //               data {
  //                 id
  //               }
  //             }
  //           }
  //         `,
  //         variables: frameFittingData,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
  
  //     const newFrameFittingId = frameFittingResponse.data.data.createFrameFitting.data.id;
  //     addSuborder('frameFitting', newFrameFittingId);

  //     navigate(`/createorder/${createdOrderId}`);
  //   } catch (error) {
  //     console.error('Error creating order:', error);
  //   }
  // };


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
      addOrder({ id: createdOrderId });
  
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
      addSuborder('doorSub', newDoorSuborderId);

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
      addSuborder('frameSub', newFrameSuborderId);

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
        addSuborder(`${fittingType}Sub`, newFittingSuborderId);
      }

      navigate(`/createorder/${createdOrderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  useEffect(() => {
    handleCreateOrder();
  },[])

  useEffect(() => {
    const savedFormData = localStorage.getItem(`orderFormData_${orderId}`);
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, [orderId]);

  useEffect(() => {
    localStorage.setItem(`orderFormData_${orderId}`, JSON.stringify(formData));
  }, [formData, orderId]);

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GroupDoorStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
          />
        );
      case 1:
        return (
          <GroupDecorStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
        />
        );
        case 2:
        return (
          <FrameStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
          />
        );
      case 3:
        return (
          <ElementsStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
          />
        );
      case 4:
        return (
          <GroupAccessoriesStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
        />
        );
        case 5:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
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
            formData={formData}
            language={language}
        />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      
      <div style={{textAlign: 'left', margin: '10px 0'}}>
        <OrderDetails/>
      </div>
      
      <Divider/>

      <Steps
        current={currentStep} 
        type='navigation'
        onChange={handleStepClick}
        items={[
          {
            title: 'Canvas',
            status: (currentStep === 0 ? 'process' : formData.doorStep ? 'finish' : 'error'),
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
      <Divider />
      {renderFormStep()}
    </div>
  );
};

