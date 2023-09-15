import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const MirrorStep = ({ formData, handleCardClick, handleNext, orderID }) => {
  const [mirrorData, setMirrorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const jwtToken = localStorage.getItem('token');

  const [previousMirrorId, setPreviousMirrorId] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const { order } = useOrder();
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');

  const orderId = order.id;
  const orderIdToUse = orderID || orderId;

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
                          decor {
                            data {
                              id
                              attributes {
                                type
                                title
                              }
                            }
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
      
      console.log(response.data)

      const decorData = response.data.data.order?.data?.attributes?.door_suborder?.data?.attributes?.decor?.data;

      if (decorData && decorData.attributes && decorData.attributes.type === "mirror") {
        // const initialValues = {
        //   decor: decorData.id || null,
        // };

        // form.setFieldsValue(initialValues);
        setPreviousMirrorId(decorData.attributes.title);

      }
    } catch (error) {
      console.error('Error fetching door suborder data:', error);
    }
  };


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
      setIsLoading(true);
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Mirrors {
                mirrors {
                  data {
                    id
                    attributes {
                      image {
                        data {
                          attributes {
                            url
                          }
                        }
                      }
                      title
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

        const mirrors = response.data.data.mirrors.data;
        setMirrorData(mirrors);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    fetchDecorData();
    fetchOrderData();
  }, [jwtToken]);

  const filteredMirrorData = mirrorData.filter(mirror =>
    mirror.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // <Form onFinish={formData} onValuesChange={formData}>
    <Form onFinish={onFinish}>

<Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

      <div style={{ display: 'flex', gap: '30px' }}>
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>
      <Divider />

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item name="step2Field">
          <Radio.Group value={formData.step2Field}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredMirrorData.map(mirror => (
                <div key={mirror.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        // formData.step2Field === mirror.id ? '7px solid #f06d20' : 'none',
                        // previousMirrorId === mirror.id ? '7px solid #f06d20' : 'none',
                        previousMirrorId === mirror.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    // onClick={() => handleCardClick('step2Field', mirror.id)}
                    onClick={() => {
                      checkDecor('mirror', mirror.attributes.title);
                      // setPreviousMirrorId(mirror.id);
                      setPreviousMirrorId(mirror.attributes.title);
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${mirror.attributes.image.data.attributes.url}`}
                        alt={mirror.attributes.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta title={mirror.attributes.title} style={{ paddingTop: '10px' }} />
                    <Radio value={mirror.id} style={{ display: 'none' }} />
                  </Card>
                </div>
              ))}
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

export default MirrorStep;
