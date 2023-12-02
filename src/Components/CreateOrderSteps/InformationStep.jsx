import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import axios from 'axios';
import { Form, Input, Select, Radio, DatePicker, Button, message, InputNumber, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import dayjs from 'dayjs';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const { Option } = Select;
const { TextArea } = Input;

const InformationStep = ({ setCurrentStepSend }) => {
  const dateFormat = 'YYYY-MM-DD HH:mm';
  const { user } = useContext(AuthContext);
  const { orderId } = useOrder();

  const jwtToken = localStorage.getItem('token');
  const locale = localStorage.getItem('selectedLanguage') || 'en'
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  
  const [clients, setClients] = useState([]);
  const [form] = Form.useForm();

  const handleClientChange = (clientId) => {
    const selectedClientData = clients.find((client) => client.id === clientId);
  
    if (selectedClientData?.attributes?.addresses?.length > 0) {
      const { address, city, country, zipCode } = selectedClientData.attributes.addresses[0];
      form.setFieldsValue({
        address: address || '',
        city: city || '',
        country: country || '',
        zipCode: zipCode || '',
      });
    } else {
      form.setFieldsValue({
        address: '',
        city: '',
        country: '',
        zipCode: '',
      });
    }
  };

  useEffect(() => {
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($pagination: PaginationArg) {
              clients(pagination: $pagination) {
                data {
                  id
                  attributes {
                    client_name
                    addresses {
                      id
                      address
                      city
                      country
                      zipCode
                    }
                  }
                }
              }
            }
          `,
          variables: {
            pagination: {
              limit: 100,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        setClients(response.data.data.clients.data);
      })
      .catch((error) => {
        console.error('Error while getting customer data:', error);
      });
  }, [jwtToken]);

  const onFinish = (values) => {
    const data = {
      client: values.client || null,
      comment: values.comment || null,
      shippingAddress: {
        address: values.address || null,
        city: values.city || null,
        country: values.country || null,
        zipCode: values.zipCode || null,
      },
      status: values.status,
      deliveryAt: values.deliveryAt ? values.deliveryAt.toISOString() : null,
      discount: values.discount || null,
      currency: values.currency,
      manager: user.id,
    };

    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateOrderId: ID!, $data: OrderInput!) {
              updateOrder(id: $updateOrderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateOrderId: orderId,
            data,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        message.success(language.successQuery);
        if (setCurrentStepSend) {
          setCurrentStepSend(prevState => {
            return {
              ...prevState,
              informationSend: true
            };
          });
        }
      }).then(() => {
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('selectedLanguage', locale);
      })
      .catch((error) => {
        message.error(language.errorQuery);
      });
  };

  useEffect(() => {
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Order($orderId: ID) {
              order(id: $orderId) {
                data {
                  id
                  attributes {
                    client {
                      data {
                        id
                      }
                    }
                    deliveryAt
                    currency
                    discount
                    status
                    comment
                    shippingAddress {
                      address
                      city
                      country
                      zipCode
                    }
                  }
                }
              }
            }
          `,
          variables: {
            orderId: orderId
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        const orderData = response?.data?.data?.order?.data?.attributes;
        const deliveryAtFormated = orderData?.deliveryAt ? dayjs(orderData?.deliveryAt, dateFormat) : null;

        if (orderData) {
          form.setFieldsValue({
            address: orderData?.shippingAddress?.address || '',
            city: orderData?.shippingAddress?.city || '',
            country: orderData?.shippingAddress?.country || '',
            zipCode: orderData?.shippingAddress?.zipCode || '',
            deliveryAt: deliveryAtFormated,
            discount: orderData?.discount || '',
            status: orderData?.status || 'Draft',
            comment: orderData?.comment || '',
            currency: orderData?.currency || 'EUR',
            client: orderData?.client ? orderData?.client?.data?.id : '',
          });
        }
      })
      .catch((error) => {
        console.error('Error while fetching order data:', error);
      });
  }, [jwtToken, orderId, form]);

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC', marginTop: '20px'}}>
      <Form form={form} onFinish={onFinish} initialValues={{ currency: 'EUR' }} >

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item label={language.deliveryAt} name="deliveryAt" style={{ width: '100%' }}>
            <DatePicker
              format={dateFormat}
              showTime 
              addonBefore={language.deliveryAt} />
          </Form.Item>

          <Form.Item 
            name="discount" 
            style={{ width: '100%' }}
          >
            <InputNumber addonBefore={language.discount}/>
          </Form.Item>

          <Form.Item label={language.currency} name="currency" style={{ width: '100%' }}>
            <Select disabled>
              <Option value="EUR">EUR €</Option>
              <Option value="PLN">PLN zł</Option>
              <Option value="USD">USD $</Option>
              <Option value="UAH">UAH ₴</Option>
            </Select>
          </Form.Item>

          <Form.Item label={language.client} name="client" style={{ width: '100%' }}>
            <Select onChange={handleClientChange}>
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.attributes.client_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item name="address" style={{ width: '100%' }} >
            <Input addonBefore={language.address}/>
          </Form.Item>

          <Form.Item name="city" style={{ width: '100%' }} >
            <Input addonBefore={language.city}/>
          </Form.Item>
          
          <Form.Item name="country" style={{ width: '100%' }} >
            <Input addonBefore={language.country}/>
          </Form.Item>
          
          <Form.Item 
            name="zipCode" 
            style={{ width: '100%' }}
            rules={[
              {
                pattern: /^[0-9]+$/,
                message: language.zipCodeNumber,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue('zipCode') || value.length >= 5) {
                    return Promise.resolve();
                  }
                  return Promise.reject(language.zipCodeValid);
                },
              }),
            ]}
          >
            <Input addonBefore={language.zipCode}/>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
        <Form.Item label={language.status} name="status">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="Draft">Draft</Radio.Button>
              <Radio.Button value="Active">Active</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        <Form.Item label={language.comment} name="comment">
          <TextArea />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button style={{backgroundColor: '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
            {`${language.submit} ${language.frame}`}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InformationStep;
