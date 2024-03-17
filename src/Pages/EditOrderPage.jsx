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
import ErrorDrawer from '../Components/ErrorDrawer';
import {validateElements } from '../api/validationOrder';


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
  
  const orderIdToUse = orderId;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [isDisabledOtherSteps, setIsDisabledOtherSteps] = useState(true);
  // const handlePrev = () => {
  //   setCurrentStep(currentStep - 1);
  // };

  const handleStepClick = async (step) => {
    setCurrentStep(step);
    if (step !== 2) {
      await validateElements(orderIdToUse, jwtToken);
    }
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
                        attributes {
                          door {
                            data {
                              id
                            }
                          }
                        }
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
        
      if (orderData?.door_suborder?.data?.attributes?.door?.data?.id)
      setIsDisabledOtherSteps(false);
  
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
  // }, [jwtToken, orderId, urlOrderId]);
  }, [jwtToken, orderId, urlOrderId, isDisabledOtherSteps]);

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GroupDoorStep setIsDisabledOtherSteps={setIsDisabledOtherSteps} />
        );
      case 1:
        return (
          // <GroupDecorStep />
          <DecorSidesGroupStep />
        );
        // case 2:
        // return (
        //   <FrameStep />
        // );
      case 2:
        return (
          <ElementsStep />
        );
      case 3:
        return (
          <GroupAccessoriesStep />
        );
        case 4:
        return (
          <OptionsStep />
        );
        case 5:
        return (
          <OptionsAdditionalStep />
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
      
      <div style={{display: 'flex', margin: '25px 0', gap: '20px', flexWrap: 'wrap', justifyContent: 'space-between', }}>
        <div style={{display: 'flex', flexBasis: '50%', gap: '15px' }}>
          <Button icon={<LeftCircleOutlined />} type="dashed" onClick={()=> navigate(`/orders`)}> {language.orderList} </Button>
          <OrderDrawer/>
          <CreateColorDrawer/>
          
        </div>
        
        <div style={{display: 'flex', paddingRight: '30px'}}>
          <ErrorDrawer/>
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
            disabled: isDisabledOtherSteps,
          },
          // {
          //   title: language.frame,
          //   status: (currentStep === 2 ? 'process' : 'finish'),
          // },
          {
            title: language.elements,
            status: (currentStep === 3 ? 'process' : 'finish'),
            disabled: isDisabledOtherSteps,
            // onBlur: async () => await validateElements(orderIdToUse, jwtToken),
          },
          {
            title: language.fitting,
            status: (currentStep === 4 ? 'process' : 'finish'),
            disabled: isDisabledOtherSteps,
          },
          {
            title: language.options,
            status: (currentStep === 5 ? 'process' : 'finish'),
            disabled: isDisabledOtherSteps,
          },
          {
            title: language.additional,
            status: (currentStep === 6 ? 'process' : 'finish'),
            disabled: isDisabledOtherSteps,
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

