import React from 'react';
import { Form, Card, Radio } from 'antd';

const ImagesDecorVeenerForm = ({ 
  filteredImgs, language, name, previousTitle, checkDecor, decorData, setSelectedDecorId, setDecorData, setPreviousTitle, imgUrl
  }) => {
  return (
    <Form.Item name={name} rules={[{ required: previousTitle !== null ? false : true, message: language.requiredField }]}>
      <Radio.Group >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {filteredImgs.map((decor) => (
            <Radio key={decor.id} value={decor.id}>
              <Card
                className="custom-card"
                hoverable
                style={{
                  width: '200px', 
                  margin: '20px 10px',
                  border:
                    previousTitle === decor.title
                    ? '7px solid #f06d20'
                    : 'none',
                }}
                onClick={() => {
                  checkDecor('veneer', decor.title, decorData, setSelectedDecorId, decor.productId, setDecorData);
                  setPreviousTitle(decor.title);
                }}
              >
                <div style={{ overflow: 'hidden', height: 220 }}>
                  <img
                    src={`https://api.boki.fortesting.com.ua${decor.imgSrc}`}
                    alt={decor.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <Card.Meta
                  title={decor.title}
                  description={decor.description}
                  style={{ paddingTop: '10px' }}
                />
              </Card>
            </Radio>
          ))}
        </div>
      </Radio.Group>
    </Form.Item>
  );
};

export default ImagesDecorVeenerForm;
