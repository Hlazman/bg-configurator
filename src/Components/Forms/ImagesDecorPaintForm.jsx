import React from 'react';
import { Form, Card, Radio } from 'antd';

const ImagesDecorPaintForm = ({ 
  filteredImages, language, paintData, previousColorTittle, selectedPaintFor, checkDecor, setPreviousColorTitle, decorData,
  setSelectedDecorId, setDecorData, messageApi, paintForSelectRef
  }) => {

  return (
    <Form.Item name="paintRadio"
      // rules={[{ required: true, message: language.requiredField }]}
      rules={[{ required: previousColorTittle !== null ? false : true, message: language.requiredField }]}
    >
    <Radio.Group>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {filteredImages.map((imgSrc) => {
          const paint = paintData.find(
            paint =>
              paint.attributes.main_properties.image.data.attributes.url === imgSrc
          );
          return (
            <Radio key={paint.id} value={paint.id}>
              <Card
                className="custom-card"
                hoverable
                style={{
                  width: 220, 
                  margin: '20px 10px', 
                  border:
                    previousColorTittle === paint.attributes.color_code
                      ? '7px solid #f06d20'
                      : 'none',
                }}
                onClick={() => {
                  if (selectedPaintFor) {
                    checkDecor(selectedPaintFor, paint.attributes.color_code, decorData, setSelectedDecorId, paint.id, setDecorData);
                    setPreviousColorTitle(paint.attributes.color_code);
                    paintForSelectRef.current.parentNode.parentNode.parentNode.parentNode.classList.remove("paintFor");
                  } else {
                    messageApi.error(language.firstPainFor);
                    paintForSelectRef.current.focus();
                    paintForSelectRef.current.parentNode.parentNode.parentNode.parentNode.classList.add("paintFor");
                  }
                }}
              >
                <div style={{ overflow: 'hidden', height: 120 }}>
                  <img
                    src={`https://api.boki.fortesting.com.ua${imgSrc}`}
                    alt={paint.attributes.color_code}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <Card.Meta
                  title={paint.attributes.color_code}
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

export default ImagesDecorPaintForm;
