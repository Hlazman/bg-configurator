import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import {queryLink} from '../api/variables'

export const EditClientPage = () => {
  const jwtToken = localStorage.getItem('token');
  const { clientId } = useParams();
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState([{ id: 0, country: null, city: null, address: null, zipCode: null }]);
  const [loading, setLoading] = useState(false);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  useEffect(() => {
    axios
      .post(
        queryLink,
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
        message.error(language.errorGet);
      });
  }, [clientId, jwtToken, form, language]);

  const onFinish = (values) => {
    setLoading(true);
    const formValues = form.getFieldsValue();

    const data = {
    client_company: formValues.client_company || null,
    client_name: formValues.client_name || null,
    contacts: {
      email: formValues.email || null,
      phone: formValues.phone || null,
      phone_2: formValues.phone_2 || null,
    },
    addresses: formValues.addresses.map((address, index) => ({
      id: addresses[index].id,
      address: address.address || null,
      city: address.city || null,
      country: address.country || null,
      zipCode: address.zipCode || null,
    })),
  };

    axios
      .post(
        queryLink,
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
        message.success(language.successQuery);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        message.error(language.errorQuery);
      });
  };

  return (
    <Spin spinning={loading}>
      <Card style={{ marginTop: '35px' }}>
        <Form form={form} name="editClientForm" onFinish={onFinish}>
          
          <Form.Item 
            name="client_name" 
            rules={[
              {
                required: true,
                message: `${language.requiredField}`,
              },
              {
                min: 2,
                message: `${language.clientNameValid}`,
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder={language.name} addonBefore={language.name} />
          </Form.Item>

          <Form.Item name="client_company">
            <Input placeholder={language.organization} addonBefore={language.organization} />
          </Form.Item>

          {addresses.map((address, index) => (
            <div key={index} style={{ display: 'flex', gap: '30px' }}>

              <Form.Item name={['addresses', index, 'country']} style={{ width: '100%' }}>
                <Input placeholder={language.country} addonBefore={language.country} />
              </Form.Item>

              <Form.Item name={['addresses', index, 'city']} style={{ width: '100%' }}>
                <Input placeholder={language.city} addonBefore={language.city} />
              </Form.Item>

              <Form.Item name={['addresses', index, 'address']} style={{ width: '100%' }}>
                <Input placeholder={language.address} addonBefore={language.address} />
              </Form.Item>

              <Form.Item 
                name={['addresses', index, 'zipCode']}
                style={{ width: '100%' }}
                rules={[
                  {
                    pattern: /^[0-9]+$/,
                    message: `${language.zipCodeNumber}`,
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!getFieldValue(['addresses', index, 'zipCode']) || value.length >= 5) {
                        return Promise.resolve();
                      }
                      return Promise.reject(`${language.zipCodeValid}`);
                    },
                  }),
                ]}
              >
                <Input placeholder={language.zipCode} addonBefore={language.zipCode} />
              </Form.Item>

            </div>
          ))}

          <Form.Item 
            name="phone"
            rules={[
              {
                pattern: /^(\+)?[0-9]+$/,
                message: `${language.phoneValid}`,
              },
            ]}
          >
            <Input placeholder={language.phone} addonBefore={language.phone} />
          </Form.Item>

          <Form.Item 
            name="phone_2"
            rules={[
              {
                pattern: /^(\+)?[0-9]+$/,
                message: `${language.phoneValid}`,
              },
            ]}
          >
            <Input placeholder={language.phone2} addonBefore={language.phone2} />
          </Form.Item>

          <Form.Item name="email">
            <Input placeholder="Email" addonBefore="Email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {language.submit}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};
