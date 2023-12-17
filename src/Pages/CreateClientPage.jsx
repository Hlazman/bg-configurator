import React, { useContext, useState } from 'react';
import { Form, Input, Button, Card, Spin, message } from 'antd';
import { UserOutlined} from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { useSelectedCompany } from '../Context/CompanyContext';

export const CreateClientPage = () => {
  const { user } = useContext(AuthContext);
  const jwtToken = localStorage.getItem('token');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { selectedCompany } = useSelectedCompany();

  const onFinish = () => {
    setLoading(true);  
    const formValues = form.getFieldsValue();
    
    const data = {
      client_name: formValues.client_name,
      company: selectedCompany,
      addresses: [{
        country: formValues.country,
        city: formValues.city,
        address: formValues.address,
        zipCode: formValues.zipCode,
      }],
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

          <div style={{ display: 'flex', gap: '30px' }}>
            <Form.Item
              name='country'
              style={{ width: '100%' }}
            >
              <Input placeholder={language.country} addonBefore={language.country} />
            </Form.Item>

            <Form.Item
              name='city'
              style={{ width: '100%' }}
            >
              <Input placeholder={language.city} addonBefore={language.city} />
            </Form.Item>

            <Form.Item
              name='address'
              style={{ width: '100%' }}
            >
              <Input placeholder={language.address} addonBefore={language.address} />
            </Form.Item>

            <Form.Item
              name='zipCode'
              style={{ width: '100%' }}
              rules={[
                {
                  pattern: /^[0-9]+$/,
                  message: `${language.zipCodeNumber}`,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!getFieldValue('zipCode') || value.length >= 5) {
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

          <Form.Item>
            <Button style={{backgroundColor: '#1677ff', color: 'white' }} type="primary" htmlType="submit">
              {language.submit}
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </Spin>
  );
};
