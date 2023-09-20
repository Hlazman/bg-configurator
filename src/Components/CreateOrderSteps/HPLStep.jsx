import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const HPLStep = ({ orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm }) => {
  const [HPLData, setHPLData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const jwtToken = localStorage.getItem('token');
  const [previousHPLTitle, setPreviousHPLTitle] = useState(null);
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
        setHPLData(ceramogranites);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousHPLTitle, 'HPL');
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

  const filteredStoneData = HPLData.filter(stone =>
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
              {filteredStoneData.map(hpl => (
                <div key={hpl.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        previousHPLTitle === hpl.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => {
                      checkDecor('HPL', hpl.attributes.title, decorData, setSelectedDecorId);
                      setPreviousHPLTitle(hpl.attributes.title);
                    }}
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
    </Form>
  );
};

export default HPLStep;
