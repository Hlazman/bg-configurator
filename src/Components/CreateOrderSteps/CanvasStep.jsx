import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, Radio, Select, Divider, Spin, Space } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const CanvasStep = ({ formData, handleNext, orderID }) => {
  const { order } = useOrder();
  const { addSuborder } = useOrder();
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const orderId = order.id;
  const orderIdToUse = orderID || orderId;
  const jwtToken = localStorage.getItem('token');

  const [doorData, setDoorData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [selectedCollection, setSelectedCollection] = useState('Loft');
  const [isLoading, setIsLoading] = useState(true);
  const [previousDoorId, setPreviousDoorId] = useState(null);

  const [form] = Form.useForm();
  // const [doorSuborderData, setDoorSuborderData] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Query($orderId: ID) {
                order(id: $orderId) {
                  data {
                    attributes {
                      door_suborder {
                        data {
                          id
                          attributes {
                            door {
                              data {
                                id
                              }
                            }
                            sizes {
                              height
                              thickness
                              width
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
              orderId: orderIdToUse,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
  
        const doorSuborder = response.data.data.order?.data?.attributes?.door_suborder;
  
        if (doorSuborder && doorSuborder.data && doorSuborder.data.attributes) {
          const { door, sizes } = doorSuborder.data.attributes;
          const initialValues = {
            door: door?.data?.id || null,
            height: sizes?.height || null,
            thickness: sizes?.thickness || null,
            width: sizes?.width || null,
          };
  
          form.setFieldsValue(initialValues);
          setPreviousDoorId(initialValues.door)
        }
      } catch (error) {
        console.error('Error fetching door suborder data:', error);
      }
    };
  
    fetchOrderData();
  }, [orderID, jwtToken, form]);

  const onFinish = async (values) => {
    const { width, height, thickness } = values; // Извлекаем значения из формы
    const updateDoorSuborderId = doorSuborder.data.id; // Получаем id субордера

    const data = {
      // decor: null,
      door: previousDoorId.toString(),
      order: orderIdToUse,
      sizes: {
        height: height,
        thickness: thickness,
        width: width
      }
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
      style={{ padding: '0 25px'}}
      // initialValues={doorSuborderData}
    >
      <Divider/>

      <Space direction="hirizontal" size="large">
      <Form.Item
       name="width"
       rules={[
        {
          required: true,
          message: 'Please enter the width!',
        },
      ]}
       >
          <InputNumber addonBefore="Width" addonAfter="mm"/>
        </Form.Item>
        
        <Form.Item
         name="height"
         rules={[
          {
            required: true,
            message: 'Please enter the height!',
          },
        ]}
        >
          <InputNumber addonBefore="Height" addonAfter="mm"/>
        </Form.Item>

        <Form.Item 
          name="thickness" 
          rules={[
            {
              required: true,
              message: 'Please enter the thickness!',
            },
          ]}
        >
          <InputNumber addonBefore="Thickness" addonAfter="mm"/>
        </Form.Item>
        
      </Space>

      <Divider />
      
      <Space.Compact direction="horizontal" size="large">
      {/* <Form.Item label="Sorting by Models"> */}
      <Form.Item>
          <Select
              value={selectedCollection}
              onChange={handleCollectionChange}
            >
              {collectionOptions.map((collection, index) => (
                <Select.Option key={index} value={collection}>
                  {collection}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        
        <Form.Item style={{width: '100%'}}>
          <Input
            addonBefore="Search by door name"
            placeholder="Search"
            value={searchQuery}
            onChange={e => handleSearchQueryChange(e.target.value)}   
          />
        </Form.Item>
        </Space.Compact>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item 
          name="doorStep"
        >
          <Radio.Group 
            // value={formData.doorStep}>
            value={form.door}>
            
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

      {/* <Button type="primary" onClick={handleNext}>
        Далее
      </Button> */}

          <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
    </Form>
  );
};

export default CanvasStep;
