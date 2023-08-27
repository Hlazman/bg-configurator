import React, { useState } from 'react';
import { Steps, Form, Input, Button, Divider} from 'antd';
import { OrderDetails } from '../Components/OrderDetails';
import DoorStep from '../Components/OrderSteps/DoorStep';
import DecorStep from '../Components/OrderSteps/DecorStep';
import OptionsStep from '../Components/OrderSteps/OptionsStep';

export const CreateOrderPage = () => {

  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    step1Field: null,
    step2Field: null,
    step3Field: null,
    step4Field: null,
    step5Field: null,
    step6Field: null,
    step7Field: null,
    step10Field: null,
    step11Field: null,
    step12Field: null,
    step13Field: null,
  });

  const handleFormSubmit = (values) => {
    setFormData({ ...formData, ...values });
    // Здесь можно выполнить дополнительные действия при отправке формы
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

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DoorStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
          />
        );
      case 1:
        return (
          <DecorStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
        />
        );
      case 2:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step4Field" label="Шаг 3">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" onClick={handleNext}> Далее </Button> 
          </Form>
        );
      case 3:
        return (
          <OptionsStep
            formData={formData}
            handleCardClick={handleCardClick}
            handleNext={handleNext}
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
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step7Field" label="Шаг 6">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" htmlType="submit"> Отправить </Button>
          </Form>
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
            status: (currentStep === 0 ? 'process' : formData.step1Field ? 'finish' : 'error'),
          },
          {
            title: 'Decor',
            status: (currentStep === 1 ? 'process' : formData.step2Field ? 'finish' : 'error'),
          },
          // {
          //   title: 'Decor',
          //   status: (
          //     currentStep === 1
          //       ? 'process'
          //       : (formData.step2Field || formData.step3Field)
          //         ? 'finish'
          //         : 'error'
          //   ),
          // },
          {
            title: 'Шаг 3',
            status: (currentStep === 2 ? 'process' : formData.step4Field ? 'finish' : 'error'),
          },
          {
            title: 'Options',
            status: (currentStep === 3 ? 'process' : formData.step5Field ? 'finish' : 'error'),
          },
          {
            title: 'Шаг 5',
            status: (currentStep === 3 ? 'process' : formData.step6Field ? 'finish' : 'error'),
          },
          {
            title: 'Шаг 6',
            status: (currentStep === 3 ? 'process' : formData.step7Field ? 'finish' : 'error'),
          },
        ]}
      >

      </Steps>

      <Divider />
      
      {renderFormStep()}
    </div>
  );
};
