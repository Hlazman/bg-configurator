import React from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';

const { Title } = Typography;

export const ResetPasswordPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '50px' }}>
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: 'left' }}>
            <Title level={4} style={{ margin: '20px 0', color: '#343339', textAlign: 'center' }}> {language.resetPass} </Title>
          </div>

          <Form name="resetPassword-form" onFinish={onFinish}>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: `${language.inputEmail}` },
                { type: 'email', message: `${language.invalidEmail}` },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" type="email" style={{ height: 48 }} />
            </Form.Item>


            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48 }}>{language.resetPass}</Button>
            </Form.Item>

          </Form>

      </Card>
    </div>
    </>
  );
};