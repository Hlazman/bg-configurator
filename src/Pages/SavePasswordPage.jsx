import React from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const SavePasswordPage = ({language}) => {
  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '50px' }}>
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: 'left' }}>
            <Title level={4} style={{ margin: '20px 0', color: '#343339', textAlign: 'center' }}>{language.savePass}</Title>
          </div>

          <Form name="savePassword-form" onFinish={onFinish}>

          <Form.Item
            label={language.newPass}
            name="password"
            rules={[{ required: true, message: `${language.enterPass}` }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label = {language.confirmPass}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: `${language.confirmPassMes}` },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(`${language.passMatch}`));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48 }}>{language.savePass}</Button>
            </Form.Item>

          </Form>

      </Card>
    </div>
    </>
  );
};