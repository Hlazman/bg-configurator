import React, { useState } from 'react';
import { Steps, Form, Input, Button } from 'antd';

const { Step } = Steps;

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

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form onFinish={handleFormSubmit}>
            <Form.Item name="step1Field" label="Шаг 1">
              <Input />
            </Form.Item>
            <Button type="primary" onClick={handleNext}> Далее </Button>
          </Form>
        );
      case 1:
        return (
          <Form onFinish={handleFormSubmit}>
            <Form.Item name="step2Field" label="Шаг 2">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" onClick={handleNext}> Далее </Button> 
          </Form>
        );
      case 2:
        return (
          <Form onFinish={handleFormSubmit}>
            <Form.Item name="step3Field" label="Шаг 3">
              <Input />
            </Form.Item>
            <Button onClick={handlePrev}>Назад</Button>
            <Button type="primary" onClick={handleNext}> Далее </Button> 
          </Form>
        );
      case 3:
        return (
          <Form onFinish={handleFormSubmit}>
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
      <Steps 
        current={currentStep} 
        type='navigation'
      >
        <Step
          style={{cursor: 'pointer'}}
          title="Шаг 1"
          onClick={() => handleStepClick(0)}
        />
        <Step
          style={{cursor: 'pointer'}}
          title="Шаг 2"
          onClick={() => handleStepClick(1)}
        />
        <Step
          style={{cursor: 'pointer'}}
          title="Шаг 3"
          onClick={() => handleStepClick(2)}
        />
        <Step
          style={{cursor: 'pointer'}}
          title="Шаг 4"
          onClick={() => handleStepClick(3)}
        />
      </Steps>
      {renderFormStep()}
    </div>
  );
};
