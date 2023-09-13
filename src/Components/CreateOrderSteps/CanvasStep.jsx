import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const CanvasStep = ({ formData, handleNext }) => {
  const { order } = useOrder();
  const { addSuborder } = useOrder();
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const orderId = order.id;
  const jwtToken = localStorage.getItem('token');

  const [doorData, setDoorData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [previousDoorId, setPreviousDoorId] = useState(null);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { width, height, thickness } = values; // Извлекаем значения из формы
    const updateDoorSuborderId = doorSuborder.data.id; // Получаем id субордера

    const data = {
      decor: null,
      door: previousDoorId.toString(),
      order: null,
      sizes: {
        height: height,
        thickness: thickness,
        width: width
      }
    };

    console.log(previousDoorId)

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
      setIsLoading(true);
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Doors {
                doors (pagination: { limit: 100 },) {
                  data {
                    id
                    attributes {
                      collection
                      product_properties {
                        description
                        id
                        title
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
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        
        const doors = response.data.data.doors.data;
        setDoorData(doors);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    const storedCollection = localStorage.getItem('selectedCollection') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedCollection(storedCollection);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const collectionOptions = ['ALL', ...new Set(doorData.map(door => door.attributes.collection))];

  const handleCollectionChange = value => {
    localStorage.setItem('selectedCollection', value);
    setSelectedCollection(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgS = doorData
    .filter(door =>
      (selectedCollection === 'ALL' || door.attributes.collection === selectedCollection) &&
      door.attributes.product_properties.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(door => door.attributes.product_properties.image.data.attributes.url);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      style={{ padding: '10px 25px' }}
    >
      <div style={{ display: 'flex', gap: '30px'}}>
    
        <Form.Item name="width" style={{ width: '100%' }} >
          <InputNumber addonBefore="Width" addonAfter="mm"/>
        </Form.Item>
        
        <Form.Item name="height" style={{ width: '100%' }} >
          <InputNumber addonBefore="Height" addonAfter="mm"/>
        </Form.Item>

        <Form.Item name="thickness" style={{ width: '100%' }} >
          <InputNumber addonBefore="Thickness" addonAfter="mm"/>
        </Form.Item>
        
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

    </div>
    
      <div style={{ display: 'flex', gap: '30px' }}>
        
        <Select
          value={selectedCollection}
          onChange={handleCollectionChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {collectionOptions.map((collection, index) => (
            <Select.Option key={index} value={collection}>
              {collection}
            </Select.Option>
          ))}
        </Select>

        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>
      
      <Divider />

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item name="doorStep">
          <Radio.Group value={formData.doorStep}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgS.map((imgSrc) => {
                const door = doorData.find(
                  door =>
                    door.attributes.product_properties.image.data.attributes.url === imgSrc
                );
                return (
                  <div key={door.id} style={{ width: 220, margin: '20px 10px' }}>
                    <Card
                      className="custom-card"
                      hoverable
                      style={{
                        border:
                          previousDoorId === door.id
                            ? '7px solid #f06d20'
                            : 'none',
                      }}
                      // onClick={() => handleDoorClick('doorStep', door.id)}
                      onClick={() => setPreviousDoorId(door.id)}
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
                      <Radio value={door.id} style={{ display: 'none' }} />
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

export default CanvasStep;
