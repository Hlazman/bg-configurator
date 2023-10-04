import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, message } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { CreateColorDrawer } from '../CreateColorDrawer';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const PaintStep = ({ orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm, isPaintDecor }) => {
  const [paintData, setPaintData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedColorGroup, setSelectedColorGroup] = useState('ALL');
  const [selectedColorGroup, setSelectedColorGroup] = useState('');
  const [selectedColorRange, setSelectedColorRange] = useState('RAL');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  // const [selectedPaintFor, setSelectedPaintFor] = useState('');
  const [selectedPaintFor, setSelectedPaintFor] = useState(isPaintDecor ? 'paint' : '');
  const [isPaintType, setIsPaintType] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');
  const [previousColorTittle, setPreviousColorTitle] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);

  const [isDisabledGroup, setIsDisabledGroup] = useState(false);
  
  const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;

  const [form] = Form.useForm();

  const onFinish = async () => {
    sendDecorForm(orderIdToUse, dorSuborderId, selectedDecorId);
  };

  const colorGroupOptions = [...new Set(paintData.map(paint => paint.attributes?.color_group)), language.all];
  const colorRangeOptions = [...new Set(paintData.map(paint => paint.attributes?.color_range))];

  const handleColorGroupChange = value => {
    localStorage.setItem('selectedColorGroup', value);
    setSelectedColorGroup(value);
    setSearchQuery('');
  };


  const handleColorRangeChange = value => {
    setSelectedColorRange(value);
    setSearchQuery('');
  
    if (value === 'NCS') {
      setSelectedColorGroup('no_group');
      setIsDisabledGroup(true)
    } else {
      setIsDisabledGroup(false)
      setSelectedColorGroup('black_white_9')
    }
  };
 
    const handlePaintForChange = value => {
    setIsPaintType(false)
    setSelectedPaintFor(value);
  };


  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImages = paintData
    .filter(paint =>
      (selectedColorGroup === language.all || paint.attributes.color_group === selectedColorGroup) &&
      paint.attributes.color_range === selectedColorRange &&
      paint.attributes.color_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(paint => paint.attributes.main_properties.image.data.attributes.url);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Data($pagination: PaginationArg) {
                paints(pagination: $pagination) {
                  data {
                    id
                    attributes {
                      color_code
                      color_group
                      color_range
                      main_properties {
                        image {
                          data {
                            attributes {
                              url
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              pagination: {
                limit: 300,
              },
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const paints = response.data.data.paints.data;
        setPaintData(paints);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const storedColorGroup = localStorage.getItem('selectedColorGroup') || 'black_white_9';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedColorGroup(storedColorGroup);
    setSearchQuery(storedSearchQuery);

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousColorTitle, selectedPaintFor, setSelectedPaintFor, isPaintType);
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData, selectedPaintFor, isPaintType]);


  return (
    <Form onFinish={onFinish} form={form} style={{marginTop: '20px'}}>
        
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>

        <Input
          placeholder={language.search}
          addonBefore={language.searchBy}
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
        />
          
        <Form.Item 
          label="Paint for" 
          rules={[{ required: true, message: language.requiredField }]}
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
        >
          <Select
            name="selectedPaintFor"
            // value={selectedPaintFor}
            value={ !isPaintDecor ? selectedPaintFor : 'paint'}
            onChange={handlePaintForChange}
            disabled={isPaintDecor}
          >
            <Select.Option value="paint">{language.paint}</Select.Option>
            <Select.Option value="painted_glass">{language.glass}Glass</Select.Option>
            <Select.Option value="painted_veneer">{language.veneer}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Choose type o color" style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}>
          <Select
            value={selectedColorRange}
            onChange={handleColorRangeChange}
          >
            {colorRangeOptions.map((colorRange, index) => (
              <Select.Option key={index} value={colorRange}>
                {colorRange}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={language.sorting} style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}} >
        <Select
          value={selectedColorGroup}
          onChange={handleColorGroupChange}
          disabled={isDisabledGroup}
        >
          {colorGroupOptions.map((colorGroup, index) => (
            <Select.Option key={index} value={colorGroup}>
              {colorGroup}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>

        </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="paintRadio" rules={[{ required: true, message: language.requiredField }]}>
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
                        // if (isOnlyPaintDecor) {
                        //   setSelectedPaintFor('paint')
                        // }

                        if (selectedPaintFor) {
                          checkDecor(selectedPaintFor, paint.attributes.color_code, decorData, setSelectedDecorId, paint.id, setDecorData);
                          setPreviousColorTitle(paint.attributes.color_code);
                        } else {
                          message.error('First you need to choose "Pait for" ')
                        }

                        // if (selectedPaintFor) {
                        //   checkDecor(selectedPaintFor, paint.attributes.color_code, decorData, setSelectedDecorId, paint.id, setDecorData);
                        //   setPreviousColorTitle(paint.attributes.color_code);
                        // } else {
                        //   message.error('First you need to choose "Pait for" ')
                        // }
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
      )}

      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          {language.submit}
        </Button>
      </Form.Item>
      
    </Form>


  );
};

export default PaintStep;
