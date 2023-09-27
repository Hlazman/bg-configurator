import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const PrimerStep = ({orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm }) => {
  const [primerData, setPrimerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousPrimerTitle, setPreviousPrimerTitle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const jwtToken = localStorage.getItem('token');
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;

  const filteredPrimerData = primerData.filter(primer =>
    primer.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [form] = Form.useForm();
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
              query Primers {
                primers {
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

        const primers = response.data.data.primers.data;
        setPrimerData(primers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousPrimerTitle, 'primer');
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

  return (
    <Form onFinish={onFinish} form={form}>

        <Input
          placeholder={language.search}
          addonBefore={language.searchBy}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: '10px' }}
        />


      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item name="primerRadio" rules={[{ required: true, message: language.requiredField }]}>
          <Radio.Group>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredPrimerData.map(primer => (
                <Radio key={primer.id} value={primer.id}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: 220, 
                      margin: '20px 10px',
                      border:
                        previousPrimerTitle === primer.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => {
                      // checkDecor('primer', primer.attributes.title, decorData, setSelectedDecorId, primer.id);
                      checkDecor('primer', primer.attributes.title, decorData, setSelectedDecorId, primer.id, setDecorData);
                      setPreviousPrimerTitle(primer.attributes.title);
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${primer.attributes.image.data.attributes.url}`}
                        alt={primer.attributes.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta title={primer.attributes.title} style={{ paddingTop: '10px' }} />
                    <Radio value={primer.id} style={{ display: 'none' }} />
                  </Card>
                </Radio>
              ))}
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

export default PrimerStep;
