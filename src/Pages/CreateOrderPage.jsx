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
import GroupFrameStep from '../Components/CreateOrderSteps/GroupFrameStep';
import axios from 'axios';
import { useOrder } from '../Context/OrderContext';
import { useSelectedCompany } from '../Context/CompanyContext';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateColorDrawer } from '../Components/CreateColorDrawer';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import OptionsStep from '../Components/CreateOrderSteps/OptionsStep';
import OptionsAdditionalStep from '../Components/CreateOrderSteps/OptionsAdditionalStep';
import { useTotalOrder } from '../Context/TotalOrderContext';
import {queryLink} from '../api/variables'
import DecorSidesGroupStep from '../Components/CreateOrderSteps/DecorSidesGroupStep';
import ErrorDrawer from '../Components/ErrorDrawer';
import {validateElements } from '../api/validationOrder';

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
    setSlidingSuborderId,
   } = useOrder();
  
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { orderId: urlOrderId } = useParams();
  const orderIdToUse = orderId;
  
  const [currentStepSend, setCurrentStepSend] = useState({
    startDataSend: false,
    slidingSend: false,
    decorSend: false,
    frameSend: false,
    elementSend: false,
    fittingLockSend: false,
    fittingKnobeSend: false,
    fittingHingeSend: false,
    fittingInsertSealSend: false,
    optionsSend: false,
    optionsAdditionalSend: false,
    informationSend: false,
  });
  const { selectedCompany } = useSelectedCompany();
  const { totalOrderId } = useTotalOrder();
  
  const handleStepClick = async (step) => {
    setCurrentStep(step);

    if (step !== 2) {
      await validateElements(orderIdToUse, jwtToken);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const response = await axios.post(
        queryLink,
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
            data: {
              company: selectedCompany,
              total_order: totalOrderId,
            }
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const createdOrderId = response?.data?.data?.createOrder?.data?.id;
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
        queryLink,
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
        queryLink,
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

      //+++++++++++++++++++++++ slidingsuboreder start
      const SlidingSuborderData = {
        data: {
          order: createdOrderId
        }
      };

      const slidingSuborderResponse = await axios.post(
        queryLink,
        {
          query: `
            mutation Mutation($data: SlidingSuborderInput!) {
              createSlidingSuborder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: SlidingSuborderData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const newSlidingSuborderId = slidingSuborderResponse.data.data.createSlidingSuborder.data.id;
      setSlidingSuborderId(newSlidingSuborderId);

      //+++++++++++++++++++++++ slidingsuboreder end

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
          queryLink,
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
            currentStepSend={currentStepSend}
          />
        );
      case 1:
        return (
          // <GroupDecorStep
          <DecorSidesGroupStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
        />
        );
        case 2:
        return (
          // <FrameStep
          <GroupFrameStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
          />
        );
      case 3:
        return (
          <ElementsStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
          />
        );
      case 4:
        return (
          <GroupAccessoriesStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
        />
        );
        case 5:
        return (
          <OptionsStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
        />
        );
        case 6:
        return (
          <OptionsAdditionalStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
        />
        );
        case 7:
        return (
          <InformationStep
            setCurrentStepSend={setCurrentStepSend}
            currentStepSend={currentStepSend}
        />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      
      <div style={{display: 'flex', margin: '25px 0', gap: '20px', flexWrap: 'wrap', justifyContent: 'space-between', }}>
        <div style={{display: 'flex', flexBasis: '50%', gap: '20px', }}>
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
            status: (currentStep === 0 ? 'process' : currentStepSend.startDataSend && currentStepSend.canvasSend ? 'finish' : 'error'),
          },
          {
            title: language.decor,
            status: (currentStep === 1 ? 'process' : currentStepSend.decorSend ? 'finish' : 'error'),
            disabled: currentStepSend.canvasSend ? false : true,
          },
          {
            // title: language.frame,
            title: `${language.frame} / Slido`,
            status: (currentStep === 2 ? 'process' : currentStepSend.frameSend ? 'finish' : 'error'),
            disabled: currentStepSend.canvasSend ? false : true,
          },
          {
            title: language.elements,
            status: (currentStep === 3 ? 'process' : currentStepSend.elementSend ? 'finish' : 'error'),
            disabled: currentStepSend.canvasSend ? false : true,
          },
          {
            title: language.fitting,
            status: (
              currentStep === 4
                ? 'process'
                : (currentStepSend.fittingLockSend && currentStepSend.fittingHingeSend && currentStepSend.fittingKnobeSend && currentStepSend.fittingInsertSealSend )
                  ? 'finish'
                  : 'error'
            ),
            disabled: currentStepSend.canvasSend ? false : true,
          },
          {
            title: language.options,
            status: (currentStep === 5 ? 'process' : currentStepSend.optionsSend ? 'finish' : 'error'),
            disabled: currentStepSend.canvasSend ? false : true,
          },
          {
            title: language.additional,
            status: (currentStep === 6 ? 'process' : currentStepSend.optionsAdditionalSend ? 'finish' : 'error'),
            disabled: currentStepSend.canvasSend ? false : true,
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

