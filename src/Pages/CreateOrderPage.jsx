import React, { useState } from 'react';
import { Steps, Form, Input, Button } from 'antd';
import { OrderDetails } from '../Components/OrderDetails';

export const CreateOrderPage = () => {

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

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

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step1Field" label="Шаг 1">
              <Input />
            </Form.Item>
            <Button type="primary" onClick={handleNext}> Далее </Button>
          </Form>
        );
      case 1:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step2Field" label="Шаг 2">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" onClick={handleNext}> Далее </Button> 
          </Form>
        );
      case 2:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step3Field" label="Шаг 3">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" onClick={handleNext}> Далее </Button> 
          </Form>
        );
      case 3:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <Form.Item name="step4Field" label="Шаг 4">
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
      <Steps 
        current={currentStep} 
        type='navigation'
        onChange={handleStepClick}
        items={[
          {
            title: 'Шаг 1',
            status: (currentStep === 0 ? 'process' : formData.step1Field ? 'finish' : 'error'),
          },
          {
            title: 'Шаг 2',
            status: (currentStep === 1 ? 'process' : formData.step2Field ? 'finish' : 'error'),
          },
          {
            title: 'Шаг 3',
            status: (currentStep === 2 ? 'process' : formData.step3Field ? 'finish' : 'error'),
          },
          {
            title: 'Шаг 4',
            status: (currentStep === 3 ? 'process' : formData.step4Field ? 'finish' : 'error'),
          },
        ]}
      >

      </Steps>
      {renderFormStep()}
    </div>
  );
};
