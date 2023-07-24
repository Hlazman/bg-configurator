import React, { useState } from 'react';
import { Steps, Form, Input, Button, Radio, Card } from 'antd';
import { OrderDetails } from '../Components/OrderDetails';

import im1 from '../tempData/pics/im1.webp';
import im2 from '../tempData/pics/im2.webp';
import im3 from '../tempData/pics/im3.webp';
import im4 from '../tempData/pics/im4.webp';
import im5 from '../tempData/pics/im5.webp';
import im6 from '../tempData/pics/im6.webp';

const imgS = [im1, im2, im3, im4, im5, im6];

export const CreateOrderPage = () => {

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

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

  const handleCardClick = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      step1Field: prevFormData.step1Field === value ? null : value
    }));
  };


  const filteredImgS = imgS.filter((imgSrc, index) =>
    `Image ${index + 1}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form onFinish={handleFormSubmit} onValuesChange={handleFormValuesChange}>
            <p>Choose something from this form</p>
             <Input
              placeholder="Search by title"
              value={searchQuery}
              onChange={handleSearchInputChange}
              style={{ marginBottom: '10px' }}
            />
            <Form.Item name="step1Field" label="Шаг 1">
              <Radio.Group value={formData.step1Field}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {filteredImgS.map((imgSrc, index) => (
                    <div key={index} style={{ width: 200, margin: '10px' }}>
                      <Card
                        hoverable
                        style={{ border: formData.step1Field === `image${index + 1}.webp` ? '7px solid #f06d20' : 'none' }}
                        onClick={() => handleCardClick(`image${index + 1}.webp`)}
                      >
                        <div style={{ overflow: 'hidden', height: 220 }}>
                          <img
                            src={imgSrc}
                            alt={`${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            // onClick={() => handleCardClick(`image${index + 1}.webp`)}
                          />
                        </div>
                        <Card.Meta title={`Image ${index + 1}`} style={{ paddingTop: '10px' }} />
                        <Radio value={`image${index + 1}.webp`} style={{ display: 'none' }} />
                      </Card>
                    </div>
                  ))}
                </div>
              </Radio.Group>
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
