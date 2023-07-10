import React from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const ResetPasswordPage = () => {
  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '50px' }}>
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: 'left' }}>
            <Title level={4} style={{ margin: '20px 0', color: '#343339', textAlign: 'center' }}>Reset Password</Title>
          </div>

          <Form name="resetPassword-form" onFinish={onFinish}>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" type="email" style={{ height: 48 }} />
            </Form.Item>


            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48 }}>Reset Password</Button>
            </Form.Item>

          </Form>

      </Card>
    </div>
    </>
  );
};