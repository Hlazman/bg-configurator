import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const StoneStep = ({ orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm }) => {
  const [stoneData, setStoneData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const jwtToken = localStorage.getItem('token');
  const [previousStoneTitle, setPreviousStoneTitle] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;
  
  const onFinish = async () => {
    // sendDecorForm(orderIdToUse, doorSuborder, selectedDecorId);
    sendDecorForm(orderIdToUse, dorSuborderId, selectedDecorId);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Ceramogranites {
                ceramogranites {
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

        const ceramogranites = response.data.data.ceramogranites.data;
        setStoneData(ceramogranites);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousStoneTitle, 'ceramogranite');
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

  const filteredStoneData = stoneData.filter(stone =>
    stone.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
        <Form.Item>
          <Radio.Group>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredStoneData.map(stone => (
                <div key={stone.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        previousStoneTitle === stone.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => {
                      checkDecor('ceramogranite', stone.attributes.title, decorData, setSelectedDecorId);
                      setPreviousStoneTitle(stone.attributes.title);
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${stone.attributes.image.data.attributes.url}`}
                        alt={stone.attributes.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta title={stone.attributes.title} style={{ paddingTop: '10px' }} />
                    <Radio value={stone.id} style={{ display: 'none' }} />
                  </Card>
                </div>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}
    </Form>
  );
};

export default StoneStep;
