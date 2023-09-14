import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const PaintStep = ({ formData, handleCardClick, handleNext }) => {
  const [paintData, setPaintData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorGroup, setSelectedColorGroup] = useState('ALL');
  const [selectedColorRange, setSelectedColorRange] = useState('RAL');
  // const [selectedPaintFor, setSelectedPaintFor] = useState('Paint for');
  const [selectedPaintFor, setSelectedPaintFor] = useState('paint');
  const [isLoading, setIsLoading] = useState(true);

  const jwtToken = localStorage.getItem('token');

  const [previousColorId, setPreviousColorId] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const { order } = useOrder();
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');

  const fetchDecorData = async () => {
    setIsLoading(true);
    try {
      const decorResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Decors($pagination: PaginationArg) {
              decors(pagination: $pagination) {
                data {
                  attributes {
                    title
                    type
                  }
                  id
                }
              }
            }
          `,
          variables: {
            pagination: {
              limit: 100
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const decorData = decorResponse.data.data.decors.data;
      setDecorData(decorData);
    } catch (error) {
      console.error('Error fetching decor data:', error);
    }
    setIsLoading(false);
    console.log(decorData)
  };

  const createDecor = async (data) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateDecor($data: DecorInput!) {
              createDecor(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {
              title: data.title,
              type: data.type,
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      return response.data.data.createDecor.data.id;
    } catch (error) {
      console.error('Error creating decor:', error);
      throw error;
    }
  };

  const checkDecor = async (type, title) => {
    const foundDecor = decorData.find(decor =>
      decor.attributes.type === type && decor.attributes.title.toLowerCase() === title.toLowerCase()
    );
  
    if (foundDecor) {
      setSelectedDecorId(foundDecor.id);
      console.log(`Найден декор с типом ${type} и названием ${title}`);
      console.log(foundDecor.id);
    } else {
      console.log(`Декор с типом ${type} и названием ${title} не найден. Создаем новый...`);
  
      try {
        const newDecorId = await createDecor({ title, type });
        fetchDecorData();
        setSelectedDecorId(newDecorId);
        console.log(`Декор успешно создан с id: ${newDecorId}`);
      } catch (error) {
        console.error('Ошибка при создании декора:', error);
      }
    }
  };

  const onFinish = async (values) => {
    const updateDoorSuborderId = doorSuborder.data.id; // Получаем id субордера

    const data = {
      decor: selectedDecorId,
      order: order.id,
    };

    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateDoorSuborderId: ID!, $data: DoorSuborderInput!) {
              updateDoorSuborder(id: $updateDoorSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateDoorSuborderId: updateDoorSuborderId,
            data: data
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log('Data sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

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

    const storedColorGroup = localStorage.getItem('selectedColorGroup') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedColorGroup(storedColorGroup);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const colorGroupOptions = ['ALL', ...new Set(paintData.map(paint => paint.attributes.color_group))];
  const colorRangeOptions = [...new Set(paintData.map(paint => paint.attributes.color_range))];

  const handleColorGroupChange = value => {
    localStorage.setItem('selectedColorGroup', value);
    setSelectedColorGroup(value);
    setSearchQuery('');
  };

  const handleColorRangeChange = value => {
    setSelectedColorRange(value);
    setSearchQuery('');
  };

    const handlePaintForChange = value => {
    setSelectedPaintFor(value);
    console.log(selectedPaintFor)
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImages = paintData
    .filter(paint =>
      (selectedColorGroup === 'ALL' || paint.attributes.color_group === selectedColorGroup) &&
      paint.attributes.color_range === selectedColorRange &&
      paint.attributes.color_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(paint => paint.attributes.main_properties.image.data.attributes.url);

  return (
    // <Form onFinish={formData} onValuesChange={formData}>
    <Form onFinish={onFinish}>

<Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>


      <div style={{ display: 'flex', gap: '30px' }}>
        <Select
          value={selectedColorGroup}
          onChange={handleColorGroupChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {colorGroupOptions.map((colorGroup, index) => (
            <Select.Option key={index} value={colorGroup}>
              {colorGroup}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={selectedColorRange}
          onChange={handleColorRangeChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {colorRangeOptions.map((colorRange, index) => (
            <Select.Option key={index} value={colorRange}>
              {colorRange}
            </Select.Option>
          ))}
        </Select>

          {/* <Select
          value={selectedPaintFor}
          onChange={handlePaintForChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          <Select.Option value="paint">Paint</Select.Option>
          <Select.Option value="painted_glass">Glass</Select.Option>
          <Select.Option value="painted_veneer">Veener</Select.Option>
        </Select> */}

        <Form.Item
        label="Paint for"
        name="selectedPaintFor" // Add a name to the Form.Item
        initialValue={selectedPaintFor} // Set initial value
        rules={[{ required: true, message: 'Please select a paint type' }]} // Add validation rule
        style={{ marginBottom: '10px', width: '100%' }}
      >
        <Select
          value={selectedPaintFor}
          onChange={handlePaintForChange}
          // style={{ marginBottom: '10px', width: '100%' }}
        >
          <Select.Option value="paint">Paint</Select.Option>
          <Select.Option value="painted_glass">Glass</Select.Option>
          <Select.Option value="painted_veneer">Veneer</Select.Option>
        </Select>
      </Form.Item>

        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>

      <Divider />

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="step2Field">
          <Radio.Group value={formData.step2Field}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImages.map((imgSrc) => {
                const paint = paintData.find(
                  paint =>
                    paint.attributes.main_properties.image.data.attributes.url === imgSrc
                );
                return (
                  <div key={paint.id} style={{ width: 220, margin: '20px 10px' }}>
                    <Card
                      className="custom-card"
                      hoverable
                      style={{
                        border:
                          // formData.step2Field === paint.id
                          previousColorId === paint.id
                            ? '7px solid #f06d20'
                            : 'none',
                      }}
                      // onClick={() => handleCardClick('step2Field', paint.id)}
                      onClick={() => {
                        checkDecor(selectedPaintFor, paint.attributes.color_code);
                        setPreviousColorId(paint.id);
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
                      <Radio value={paint.id} style={{ display: 'none' }} />
                    </Card>
                  </div>
                );
              })}
            </div>
          </Radio.Group>
        </Form.Item>
      )}
      <Button type="primary" onClick={handleNext}>
        Далее
      </Button>
    </Form>
  );
};

export default PaintStep;
