import React, { useContext, useState } from 'react';
import { Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { UserOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';

export const CreateClientPage = () => {
  const { user } = useContext(AuthContext);
  const jwtToken = localStorage.getItem('token');

  const [form] = Form.useForm();

  const [addresses, setAddresses] = useState([{ id: null, country: null, city: null, address: null, zipCode: null }]);
  const [loading, setLoading] = useState(false);

  const handleAddAddress = () => {
    setAddresses([...addresses, { id: null, country: null, city: null, address: null, zipCode: null }]);
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = [...addresses];
    updatedAddresses.splice(index, 1);
    setAddresses(updatedAddresses);
  };

  const onFinish = (values) => {
    setLoading(true);
    const data = {
      client_name: values.client_name,
      addresses: addresses.filter((address) => address.id !== null),
      contacts: {
        phone: values.phone,
        email: values.email,
        phone_2: values.phone_2,
      },
      client_company: values.client_company,
      // company: values.company,
      manager: user.id,
      publishedAt: new Date().toISOString(),
    };

    axios
      .post('https://api.boki.fortesting.com.ua/graphql', { query: 'mutation Mutation($data: ClientInput!) { createClient(data: $data) { data { id } } }', variables: { data } }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        setLoading(false);
        form.resetFields();
        setAddresses([{ id: null, country: null, city: null, address: null, zipCode: null }]);
        message.success('Client successfully added to database');
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        message.error('An error occurred while adding a client');
      });
  };

  return (
    <Spin spinning={loading}>
      <Card title="Create Client" style={{ marginTop: '35px' }}>
        <Form
          form={form}
          name="createClientForm"
          onFinish={onFinish}
        >
          <Form.Item
            name="client_name"
            rules={[{ required: true, message: 'Please enter the client name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Client Name" addonBefore="Client name" />
          </Form.Item>

          <Form.Item
            name="client_company"
          >
            <Input placeholder="Orgainzation" addonBefore="Orgainzation"/>
          </Form.Item>

          {addresses.map((address, index) => (
            <Space key={index} style={{alignItems: 'flex-start'}}>
              <Form.Item
                name={['addresses', index, 'country']}
              >
                <Input placeholder="Country" addonBefore="Country" />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'city']}
              >
                <Input placeholder="City" addonBefore="City" />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'address']}
              >
                <Input placeholder="Address" addonBefore="Address" />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'zipCode']}
              >
                <Input placeholder="Zip Code" addonBefore="Zip Code" />
              </Form.Item>
              
              <Button danger
                type="primary" onClick={handleRemoveAddress} icon={<MinusCircleOutlined />}> 
              </Button>

            </Space>
          ))}

          <Form.Item>
            <Button type="primary" onClick={handleAddAddress} icon={<PlusOutlined />}>
              Add Address
            </Button>
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input placeholder="Phone" addonBefore="Phone"/>
          </Form.Item>

          <Form.Item
            name="phone_2"
          >
            <Input placeholder="Phone 2" addonBefore="Phone 2"/>
          </Form.Item>

          <Form.Item
            name="email"
          >
            <Input placeholder="Email" addonBefore="Email"/>
          </Form.Item>

          {/* <Form.Item
            name="company"
          >
            <Input placeholder="Company" />
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add client
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </Spin>
  );
};
