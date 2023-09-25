import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Select, Radio, DatePicker, Button, message, InputNumber, Card } from 'antd';
import { useOrder } from '../../Context/OrderContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const InformationStep = ({ setCurrentStepSend }) => {
  const dateFormat = 'YYYY-MM-DD HH:mm';
  const { user } = useContext(AuthContext);
  const { orderId } = useOrder();

  const jwtToken = localStorage.getItem('token');
  const locale = localStorage.getItem('selectedLanguage') || 'en'
  const navigate = useNavigate()
  
  const [clients, setClients] = useState([]);
  const [form] = Form.useForm();

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
        message.success('The order has been successfully created!');
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            informationSend: true
          };
        });
      }).then(() => {
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('selectedLanguage', locale);
      })
      // .then(()=> navigate('/'))
      .catch((error) => {
        message.error('An error has occurred!');
      });
  };

  useEffect(() => {
    // Fetch order data when component mounts
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
          <Form.Item name="address" style={{ width: '100%' }} >
            <Input addonBefore="Address"/>
          </Form.Item>

          <Form.Item name="city" style={{ width: '100%' }} >
            <Input addonBefore="City"/>
          </Form.Item>
          
          <Form.Item name="country" style={{ width: '100%' }} >
            <Input addonBefore="Country"/>
          </Form.Item>
          
          <Form.Item 
            name="zipCode" 
            style={{ width: '100%' }}
            rules={[
              {
                pattern: /^[0-9]+$/,
                message: 'Zip Code must be a number.',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue('zipCode') || value.length >= 5) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Zip Code must be at least 5 characters long.');
                },
              }),
            ]}
          >
            <Input addonBefore="Zip Code"/>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item label="Delivery Date" name="deliveryAt" style={{ width: '100%' }}>
            {/* <DatePicker showTime addonBefore="deliveryAt" /> */}
            <DatePicker
              format={dateFormat}
              showTime 
              addonBefore="deliveryAt" />
          </Form.Item>

          <Form.Item 
            name="discount" 
            style={{ width: '100%' }}
          >
            <InputNumber addonBefore="Discount"/>
          </Form.Item>

          <Form.Item label="Currency" name="currency" style={{ width: '100%' }}>
            <Select>
              <Option value="EUR">EUR €</Option>
              <Option value="PLN">PLN zł</Option>
              <Option value="USD">USD $</Option>
              <Option value="UAH">UAH ₴</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Client" name="client" style={{ width: '100%' }}>
            <Select >
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.attributes.client_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
        <Form.Item label="Status" name="status">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="Draft">Draft</Radio.Button>
              <Radio.Button value="Active">Active</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        <Form.Item label="Comment" name="comment">
          <TextArea />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InformationStep;
