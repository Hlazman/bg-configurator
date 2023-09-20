import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const MirrorStep = ({orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm }) => {
  const [mirrorData, setMirrorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousMirrorTitle, setPreviousMirrorTitle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const jwtToken = localStorage.getItem('token');
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;

  const filteredMirrorData = mirrorData.filter(mirror =>
    mirror.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousMirrorTitle, 'mirror');
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

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
              {filteredMirrorData.map(mirror => (
                <div key={mirror.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        previousMirrorTitle === mirror.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => {
                      checkDecor('mirror', mirror.attributes.title, decorData, setSelectedDecorId);
                      setPreviousMirrorTitle(mirror.attributes.title);
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
    </Form>
  );
};

export default MirrorStep;
