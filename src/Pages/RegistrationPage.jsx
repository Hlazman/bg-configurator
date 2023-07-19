import React from 'react';
import { Form, Input, Button, Checkbox, Radio, Select, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Option } = Select;

export const RegistrationPage = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <Card style={{ width: '60vw', margin: '30px auto' }}>

      <div>
        <h1>Registration form</h1>

        <Form
          form={form}
          name="registration"
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
            label="Email (login)"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Confirm password"
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

          <Form.Item
            label="Locale"
            name="locale"
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
            label="Phone"
            name="phone"
          >
            <Input type='number' />
          </Form.Item>

          <Form.Item
            style={{ textAlign: 'left'}}
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Radio.Group>
              <Radio value="admin">Admin</Radio>
              <Radio value="manager">Manager</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}>
            {({ getFieldValue }) => {
              return getFieldValue('role') === 'manager' ? (
                <>
                  <Form.Item
                    style={{ textAlign: 'left'}}
                    label="Permissions for Manager"
                    name="permission"
                  >
                    <Checkbox.Group>
                      <Checkbox value="workWithProducts">Working with Products data</Checkbox>
                      <Checkbox value="workWithClientss">Working with Clients data</Checkbox>
                    </Checkbox.Group>
                  </Form.Item>
                </>
              ) : null;
            }}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Register</Button>
          </Form.Item>
        
        </Form>
      </div>
    </Card>

  );
};
