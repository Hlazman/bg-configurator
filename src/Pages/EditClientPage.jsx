import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { UserOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

export const EditClientPage = () => {
  const jwtToken = localStorage.getItem('token');
  const { clientId } = useParams();
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState([{ id: 0, country: null, city: null, address: null, zipCode: null }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Запрос GraphQL для получения данных клиента
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($clientId: ID) {
              client(id: $clientId) {
                data {
                  attributes {
                    client_name
                    client_company
                    addresses {
                      id
                      address
                      city
                      country
                      zipCode
                    }
                    contacts {
                      email
                      phone
                      phone_2
                    }
                  }
                }
              }
            }
          `,
          variables: { clientId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        const clientData = response.data.data.client.data.attributes;
        form.setFieldsValue({
          client_name: clientData.client_name,
          client_company: clientData.client_company,
          phone: clientData.contacts.phone,
          phone_2: clientData.contacts.phone_2,
          email: clientData.contacts.email,
          addresses: clientData.addresses.map((address) => ({
            country: address.country,
            city: address.city,
            address: address.address,
            zipCode: address.zipCode,
          })),
        });
        setAddresses(clientData.addresses);
      })
      .catch((error) => {
        console.error(error);
        message.error('An error occurred while fetching client data');
      });
  }, [clientId, jwtToken, form]);

  const handleAddAddress = () => {
    setAddresses([...addresses, { country: null, city: null, address: null, zipCode: null }]);
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = [...addresses];
    updatedAddresses.splice(index, 1);
    setAddresses(updatedAddresses);
  };

  const onFinish = (values) => {
    setLoading(true);
    const formValues = form.getFieldsValue();

    const data = {
      client_company: formValues.client_company,
      client_name: formValues.client_name,
      contacts: {
        email: formValues.email,
        phone: formValues.phone,
        phone_2: formValues.phone_2,
      },
      addresses: formValues.addresses.map((address, index) => ({
        id: addresses[index].id,
        address: address.address,
        city: address.city,
        country: address.country,
        zipCode: address.zipCode,
      })),
    };

    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation UpdateClient($data: ClientInput!, $updateClientId: ID!) {
              updateClient(data: $data, id: $updateClientId) {
                data {
                  id
                }
              }
            }
          `,
          variables: { data, updateClientId: clientId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        setLoading(false);
        message.success('Client successfully updated');
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        message.error('An error occurred while updating the client');
      });
  };

  return (
    <Spin spinning={loading}>
      <Card style={{ marginTop: '35px' }}>
        <Form form={form} name="editClientForm" onFinish={onFinish}>
          
          <Form.Item 
            name="client_name" 
            // rules={[{ required: true, message: 'Please enter the client name!' }]}
            rules={[
              {
                required: true,
                message: 'Please enter the client name!',
              },
              {
                min: 2,
                message: 'Client name must be at least 2 characters long.',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Client Name" addonBefore="Client name" />
          </Form.Item>

          <Form.Item name="client_company">
            <Input placeholder="Organization" addonBefore="Organization" />
          </Form.Item>

          {addresses.map((address, index) => (
            <Space key={index} style={{ alignItems: 'flex-start' }}>

              <Form.Item name={['addresses', index, 'country']}>
                <Input placeholder="Country" addonBefore="Country" />
              </Form.Item>

              <Form.Item name={['addresses', index, 'city']}>
                <Input placeholder="City" addonBefore="City" />
              </Form.Item>

              <Form.Item name={['addresses', index, 'address']}>
                <Input placeholder="Address" addonBefore="Address" />
              </Form.Item>

              <Form.Item 
                name={['addresses', index, 'zipCode']}
                rules={[
                  {
                    pattern: /^[0-9]+$/,
                    message: 'Zip Code must be a number.',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!getFieldValue(['addresses', index, 'zipCode']) || value.length >= 5) {
                        return Promise.resolve();
                      }
                      return Promise.reject('Zip Code must be at least 5 characters long.');
                    },
                  }),
                ]}
              >
                <Input placeholder="Zip Code" addonBefore="Zip Code" />
              </Form.Item>

              <Button
                danger
                type="primary"
                onClick={() => handleRemoveAddress(index)}
                icon={<MinusCircleOutlined />}
              ></Button>
            </Space>
          ))}

          <Form.Item>
            <Button type="primary" onClick={handleAddAddress} icon={<PlusOutlined />}>
              Add Address
            </Button>
          </Form.Item>

          <Form.Item 
            name="phone"
            rules={[
              {
                pattern: /^(\+)?[0-9]+$/,
                message: 'Phone must start with "+" if present and consist of numbers.',
              },
            ]}
          >
            <Input placeholder="Phone" addonBefore="Phone" />
          </Form.Item>

          <Form.Item 
            name="phone_2"
            rules={[
              {
                pattern: /^(\+)?[0-9]+$/,
                message: 'Phone must start with "+" if present and consist of numbers.',
              },
            ]}
          >
            <Input placeholder="Phone 2" addonBefore="Phone 2" />
          </Form.Item>

          <Form.Item name="email">
            <Input placeholder="Email" addonBefore="Email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};
