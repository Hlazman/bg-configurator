import React from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const SavePasswordPage = () => {
  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '50px' }}>
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: 'left' }}>
            <Title level={4} style={{ margin: '20px 0', color: '#343339', textAlign: 'center' }}>Save new Password</Title>
          </div>

          <Form name="savePassword-form" onFinish={onFinish}>

          <Form.Item
            label="New password"
            name="password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label = "Confirm password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>



            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48 }}>Save Password</Button>
            </Form.Item>

          </Form>

      </Card>
    </div>
    </>
  );
};