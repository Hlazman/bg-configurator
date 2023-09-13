import React, { useState, useEffect } from 'react';
import { Steps, Form, Input, Button, Divider} from 'antd';
import { OrderDetails } from '../Components/OrderDetails';
import GroupDoorStep from '../Components/CreateOrderSteps/GroupDoorStep';
import GroupDecorStep from '../Components/CreateOrderSteps/GroupDecorStep';
import GroupAccessoriesStep from '../Components/CreateOrderSteps/GroupAccessoriesStep';
import ElementsStep from '../Components/CreateOrderSteps/ElementsStep';
import { useParams } from 'react-router-dom';
import InformationStep from '../Components/CreateOrderSteps/InformationStep';

export const CreateOrderPage = ({language}) => {

  const { orderId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    doorStep: null,
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
          <ElementsStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
          />
        );
      case 3:
        return (
          <GroupAccessoriesStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
            language={language}
        />
        );
        case 4:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step6Field" label="Шаг 5">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" htmlType="submit"> Отправить </Button>
          </Form>
        );
        case 5:
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
            title: 'Elements',
            // status: (currentStep === 2 ? 'process' : formData.step4Field ? 'finish' : 'error'),
          },
          {
            title: 'Accessories',
            // status: (currentStep === 4 ? 'process' : formData.step5Field ? 'finish' : 'error'),
            status: (
              currentStep === 4
                ? 'process'
                : (formData.hingesStep || formData.knobeStep || formData.lockStep || formData.skirtingStep)
                  ? 'finish'
                  : 'error'
            ),
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

