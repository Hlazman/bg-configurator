import React from 'react';
import { Form, Card, Radio } from 'antd';

const ImagesFittingsForm = ({ filteredImgs, language, stepName, previousId, setPreviousId, imageHeight }) => {
  return (
    <Form.Item name={stepName} rules={[{ required: previousId !== null ? false : true, message: language.requiredField }]}>
      <Radio.Group >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {filteredImgs.map((product) => (
            <Radio key={product.id} value={product.id}>
              <Card
                className="custom-card"
                hoverable
                style={{
                  width: '220px', 
                  margin: '20px 10px',
                  border:
                  previousId === product.id
                      ? '7px solid #f06d20'
                      : 'none',
                }}
                onClick={() => setPreviousId(product.id)}
              >
                <div style={{ overflow: 'hidden', height: imageHeight }}>
                  <img
                    src={`https://api.boki.fortesting.com.ua${product.imgSrc}`}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <Card.Meta
                  title={product.title}
                  description={product?.brand}
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

export default ImagesFittingsForm;
