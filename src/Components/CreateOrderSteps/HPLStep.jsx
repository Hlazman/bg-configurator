import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Spin, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const HPLStep = ({ fetchOrderData, fetchDecorData, checkDecor, sendDecorForm, currentStepSend }) => {
  const [HPLData, setHPLData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const jwtToken = localStorage.getItem('token');
  const [previousHPLTitle, setPreviousHPLTitle] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;
  const [btnColor, setBtnColor] = useState('#ff0505');

  const [form] = Form.useForm();
  
  const onFinish = async () => {
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

        const hpls = response.data.data.hplPanels.data;
        setHPLData(hpls);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousHPLTitle, 'HPL');

    if (currentStepSend && currentStepSend.decorSend) {
      setBtnColor('#4BB543');
    }
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

  const filteredHplData = HPLData.filter(hpl =>
    hpl.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Form onFinish={onFinish} form={form}>

      <Affix style={{ position: 'absolute', top: '-50px', right: '20px'}} offsetTop={60}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.decor}`}
        </Button>
      </Affix>

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
        <Form.Item name="HPLRadio" rules={[{ required: true, message: language.requiredField }]}>
          <Radio.Group>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredHplData.map(hpl => (
                <Radio key={hpl.id} value={hpl.id}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: 220, 
                      margin: '20px 10px',
                      border:
                        previousHPLTitle === hpl.attributes.title ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => {
                      checkDecor('HPL', hpl.attributes.title, decorData, setSelectedDecorId, hpl.id, setDecorData);
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
                  </Card>
                </Radio>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}
    </Form>
  );
};

export default HPLStep;
