import React from 'react';
import { Form, Card, Radio } from 'antd';

const ImagesDecorForm = ({
  language, filteredImg, name, previousTitle, checkDecor, setPreviousTitle, decorData, setSelectedDecorId, setDecorData, decorType
  }) => {
  return (
    <Form.Item name={name} rules={[{ required: previousTitle !== null ? false : true, message: language.requiredField }]}>
    <Radio.Group>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {filteredImg.map(decor => (
          <Radio key={decor.id} value={decor.id}>
            <Card
              className="custom-card"
              hoverable
              style={{
                width: 220, 
                margin: '20px 10px',
                border:
                  previousTitle === decor.attributes.title ? '7px solid #f06d20' : 'none',
              }}
              onClick={() => {
                checkDecor(decorType, decor.attributes.title, decorData, setSelectedDecorId, decor.id, setDecorData);
                setPreviousTitle(decor.attributes.title);
              }}
            >
              <div style={{ overflow: 'hidden', height: 220 }}>
                <img
                  src={`https://api.boki.fortesting.com.ua${decor.attributes.image.data.attributes.url}`}
                  alt={decor.attributes.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <Card.Meta title={decor.attributes.title} style={{ paddingTop: '10px' }} />
            </Card>
          </Radio>
        ))}
      </div>
    </Radio.Group>
  </Form.Item>
  );
};

export default ImagesDecorForm;
