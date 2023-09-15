import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const HPLStep = ({ formData, handleCardClick, handleNext, orderID }) => {
  const [stoneData, setStoneData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const jwtToken = localStorage.getItem('token');

  const [previousHPLId, setPreviousHPLId] = useState(null);
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

      if (decorData && decorData.attributes && decorData.attributes.type === "HPL") {
        // const initialValues = {
        //   decor: decorData.id || null,
        // };

        // form.setFieldsValue(initialValues);
        setPreviousHPLId(decorData.attributes.title);

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
    const updateDoorSuborderId = doorSuborder.data.id; 

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
            query Query {
              hplPanels {
                data {
                  id
                  attributes {
                    brand
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

        const ceramogranites = response.data.data.hplPanels.data;
        setStoneData(ceramogranites);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    fetchDecorData();
    fetchOrderData();
  }, [jwtToken]);

  const filteredStoneData = stoneData.filter(stone =>
    stone.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredStoneData.map(hpl => (
                <div key={hpl.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        // formData.step2Field === stone.id ? '7px solid #f06d20' : 'none',
                        // previousHPLId === hpl.id ? '7px solid #f06d20' : 'none',
                        previousHPLId === hpl.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => {
                      checkDecor('HPL', hpl.attributes.title);
                      // setPreviousHPLId(hpl.id);
                      setPreviousHPLId(hpl.attributes.title);
                    }}
                    // onClick={() => checkDecor('ceramogranite', stone.attributes.title)}
                    // onClick={() => handleCardClick('step2Field', stone.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${hpl.attributes.image.data.attributes.url}`}
                        alt={hpl.attributes.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta title={hpl.attributes.title} style={{ paddingTop: '10px' }} />
                    <Radio value={hpl.id} style={{ display: 'none' }} />
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

export default HPLStep;
