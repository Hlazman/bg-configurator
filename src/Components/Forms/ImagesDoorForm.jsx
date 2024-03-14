import React from 'react';
import { Form, Card, Radio } from 'antd';

const ImagesDoorForm = ({ filteredImgS, previousDoorId, language, form, doorData, setPreviousDoorId }) => {
  return (
    <Form.Item
      name="doorStep"
      rules={[{ required: previousDoorId !== null ? false : true, message: language.requiredField }]}
    >
      <Radio.Group
        value={form.door}
        >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {filteredImgS.map((imgSrc) => {
            const door = doorData.find(
              door =>
                door.attributes.product_properties.image.data.attributes.url === imgSrc
            );
            return (
                <Radio key={door.id} value={door.id} >
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: '200px', 
                      margin: '20px 10px',
                      border:
                        previousDoorId === door.id
                          ? '7px solid #f06d20'
                          : 'none',
                    }}
                    onClick={() => { 
                      setPreviousDoorId(door.id);
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${imgSrc}`}
                        alt={door.attributes.product_properties.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={door.attributes.product_properties.title}
                      style={{ paddingTop: '10px' }}
                    />
                  </Card>
                </Radio>
            );
          })}
        </div>
      </Radio.Group>
  </Form.Item>
  );
};

export default ImagesDoorForm;
