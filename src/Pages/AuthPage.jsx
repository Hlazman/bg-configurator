import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card, Form, Input, Checkbox, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const AuthPage = () => {
  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '30px' }}>
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: 'left' }}>
            <Title level={4} style={{ margin: '20px 0', color: '#343339', textAlign: 'center' }}>Sign in to your account</Title>
          </div>

          <Form name="login-form" onFinish={onFinish}>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" type="email" style={{ height: 48 }} />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" style={{ height: 48 }} />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 20, textAlign: 'left'}}>
              <Checkbox >Remember me</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48 }}>Sign in</Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <NavLink to="/resetpassword"> Forgot password? </NavLink>
            </Form.Item>

          </Form>

      </Card>
    </div>
    </>
  );
};

