import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Select, Radio, DatePicker, Button, message, InputNumber, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useTotalOrder } from '../Context/TotalOrderContext';
import dayjs from 'dayjs';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { useNavigate, useParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const EditTotalOrderPage = () => {
  const dateFormat = 'YYYY-MM-DD HH:mm';
  const { totalOrderId, setTotalOrderId } = useTotalOrder();
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [clients, setClients] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { totalorderId: urltotalOrderId } = useParams();
  const navigate = useNavigate();


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

  const handleUpdateTotalOrder = async (data) => {
    await axios.post('https://api.boki.fortesting.com.ua/graphql',
      {
        query: `
          mutation Mutation($updateTotalOrderId: ID!, $data: TotalOrderInput!) {
            updateTotalOrder(id: $updateTotalOrderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateTotalOrderId: totalOrderId,
          data,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    ).then(() => {
      messageApi.success(language.successQuery);
    })
    .catch((error) => {
      messageApi.error(language.errorQuery);
    });
  };

  const fetchTotalOrderData = async () => {
    await axios
    .post(
      'https://api.boki.fortesting.com.ua/graphql',
      {
        query: `
          query TotalOrder($totalOrderId: ID) {
            totalOrder(id: $totalOrderId) {
              data {
                id
                attributes {
                  client {
                    data {
                      id
                    }
                  }
                  deliveryAt
                  discount
                  deliveryCost
                  tax
                  title
                  status
                  installation
                  comment
                  contacts {
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
          totalOrderId: totalOrderId
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
      const totalOrderData = response?.data?.data?.totalOrder?.data?.attributes;
      const deliveryAtFormated = totalOrderData?.deliveryAt ? dayjs(totalOrderData?.deliveryAt, dateFormat) : null;

      if (totalOrderData) {
        form.setFieldsValue({
          title: totalOrderData?.title || '',
          address: totalOrderData?.contacts?.address || '',
          city: totalOrderData?.contacts?.city || '',
          country: totalOrderData?.contacts?.country || '',
          zipCode: totalOrderData?.contacts?.zipCode || '',
          deliveryAt: deliveryAtFormated,
          discount: totalOrderData?.discount || '',
          status: totalOrderData?.status || 'Draft',
          installation: totalOrderData?.installation,
          comment: totalOrderData?.comment || '',
          currency: totalOrderData?.currency || 'EUR',
          client: totalOrderData?.client ? totalOrderData?.client?.data?.id : '',
          tax: totalOrderData?.tax || null,
          deliveryCost: totalOrderData?.deliveryCost || null,
        });
      }

      navigate(`/edittotalorder/${totalOrderId}`);
    })
    .catch((error) => {
      console.error('Error while fetching order data:', error);
    });
  };

  const onFinish = async (values) => {
    const data = {
      title: values.title || null,
      client: values.client || null,
      comment: values.comment || null,
      contacts: {
        address: values.address || null,
        city: values.city || null,
        country: values.country || null,
        zipCode: values.zipCode || null,
      },
      status: values.status,
      installation: values.installation,
      deliveryAt: values.deliveryAt ? values.deliveryAt.toISOString() : null,
      discount: values.discount || null,
      tax: values.tax || null,
      deliveryCost: values.deliveryCost || null,
    };

    await handleUpdateTotalOrder(data);
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

  
  useEffect(() => {
    if (!totalOrderId) {
      setTotalOrderId(urltotalOrderId);
    } else {
      fetchTotalOrderData();
    }
  }, [jwtToken, totalOrderId, urltotalOrderId, form]);

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC', marginTop: '20px'}}>
      {contextHolder}
      <Form form={form} onFinish={onFinish} initialValues={{ currency: 'EUR' }} >

        <div style={{ display: 'flex', gap: '30px' }}>
        <Form.Item name="title" style={{ width: '100%' }}>
            <Input addonBefore={language.title}/>
          </Form.Item>

          <Form.Item 
            name="discount" 
            style={{ width: '100%' }}
          >
            <InputNumber addonBefore={language.discount} addonAfter={'%'}/>
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

          <Form.Item label={language.deliveryAt} name="deliveryAt" style={{ width: '100%' }}>
            <DatePicker
              format={dateFormat}
              showTime 
              addonBefore={language.deliveryAt} />
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
        <Form.Item name="deliveryCost">
            <InputNumber addonBefore={language.deliveryCost} addonAfter={'€'}/>
          </Form.Item>

          <Form.Item name="tax">
            <InputNumber addonBefore={language.tax} addonAfter={'%'}/>
          </Form.Item>

          <Form.Item label={language.installation} name="installation">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>

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
            {`${language.submit} ${language.order}`}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditTotalOrderPage;
