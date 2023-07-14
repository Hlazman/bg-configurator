import React from 'react';
import { Form, Input, Button, Select, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;

export const CreateClientPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <Card style={{ width: '60vw', margin: '30px auto' }}>
      <div>
        <h1>Client Registration form</h1>

        <Form
          form={form}
          name="clientRegistration"
          layout="horizontal"
          initialValues={{
            locale: 'en',
          }}
          onFinish={onFinish}
        >
          <Form.Item
            label="First name"
            name="firstName"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input addonBefore="First name" />
          </Form.Item>

          <Form.Item
            label="Last name"
            name="lastName"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Organization"
            name="organization"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
             { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input type='number' />
          </Form.Item>

          <Form.Item
            label="Comments"
            name="comments"
          >
            <Input.TextArea size="large" />
          </Form.Item>

          <Form.Item
            label="Locale"
            name="locale"
            rules={[{ required: true, message: 'Please select a locale' }]}
          >
            <Select style={{ textAlign: 'left' }}>
              <Option value="en">English</Option>
              <Option value="uk">Українська</Option>
              <Option value="pl">Polski</Option>
              <Option value="cs">Čeština</Option>
              <Option value="es">Español</Option>
              <Option value="de">Deutsch</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Zip Code"
            name="zipCode"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Register</Button>
          </Form.Item>
        
        </Form>
      </div>
    </Card>
  );
};
