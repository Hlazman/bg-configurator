import React, { useContext, useState } from 'react';
import { Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { UserOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';

export const CreateClientPage = () => {
  const { user } = useContext(AuthContext);
  const jwtToken = localStorage.getItem('token');
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState([{ id: 0, country: null, city: null, address: null, zipCode: null }]);
  const [loading, setLoading] = useState(false);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const handleAddAddress = () => {
    const newId = addresses.length;
    setAddresses([...addresses, { id: newId, country: null, city: null, address: null, zipCode: null }]);
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = [...addresses];
    updatedAddresses.splice(index, 1);
    setAddresses(updatedAddresses);
  };

  const onFinish = () => {
    setLoading(true);  
    const formValues = form.getFieldsValue();
    
    const data = {
      client_name: formValues.client_name,
      addresses: formValues.addresses,
      contacts: {
        phone: formValues.phone,
        email: formValues.email,
        phone_2: formValues.phone_2,
      },
      client_company: formValues.client_company,
      manager: user.id,
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
        message.success(language.successQuery);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        message.error(language.errorQuery);
      })
      // .finally(() => setAddresses([{ id: null, country: null, city: null, address: null, zipCode: null }]));
  };

  return (
    <Spin spinning={loading}>
      <Card style={{ marginTop: '35px' }}>
        <Form
          form={form}
          name="createClientForm"
          onFinish={onFinish}
        >
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

          <Form.Item
            name="client_company"
          >
            <Input placeholder={language.organization} addonBefore={language.organization}/>
          </Form.Item>

          {addresses.map((address, index) => (
            <Space key={index} style={{alignItems: 'flex-start'}}>
              <Form.Item
                name={['addresses', index, 'country']}
              >
                <Input placeholder={language.country} addonBefore={language.country} />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'city']}
              >
                <Input placeholder={language.city} addonBefore={language.city} />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'address']}
              >
                <Input placeholder={language.address} addonBefore={language.address} />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'zipCode']}
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
              
              <Button danger
                type="primary" onClick={handleRemoveAddress} icon={<MinusCircleOutlined />}> 
              </Button>

            </Space>
          ))}

          <Form.Item>
            <Button type="primary" onClick={handleAddAddress} icon={<PlusOutlined />}>
              {language.addAddress}
            </Button>
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              {
                pattern: /^(\+)?[0-9]+$/,
                message: `${language.phoneValid}`,
              },
            ]}
          >
            <Input placeholder={language.phone} addonBefore={language.phone}/>
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
            <Input placeholder={language.phone2} addonBefore={language.phone2}/>
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
              {language.submit}
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </Spin>
  );
};
