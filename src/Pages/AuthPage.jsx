import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, Form, Input, Checkbox, Button, Typography, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { AuthContext } from '../Context/AuthContext';
import { Select } from 'antd';

const { Option } = Select;
const { Title } = Typography;

export const AuthPage = ({language, handleLanguageChange}) => {
  const { loginUserWithApi } = useContext(AuthContext);
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values) => {
    const { email, password, remember } = values;
    const loginSuccess = await loginUserWithApi(email, password, remember);
    if (!loginSuccess) {
      openNotification();
    }
  };

  const openNotification = () => {
    api.open({
      message: `${language.loginFailed}`,
      description: `${language.invalid}`,
      duration: 3,
    });
  };

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '30px' }}>
        <Card style={{ width: 400 }}>
          <div style={{ textAlign: 'left' }}>
            <Title level={4} style={{ margin: '20px 0', color: '#343339', textAlign: 'center' }}>{language.signInAcc}</Title>
          </div>

          <Form name="login-form" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: `${language.inputEmail}` },
                { type: 'email', message: `${language.invalidEmail}` },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" type="email" style={{ height: 48 }} />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: `${language.inputPassword}` }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" style={{ height: 48 }} />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 20, textAlign: 'left' }}>
              <Checkbox>{language.remember}</Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 20 }}>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 48 }}>{language.signIn}</Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <NavLink to="/resetpassword"> {language.forgotPass} </NavLink>
            </Form.Item>

            <Select defaultValue={'English'} style={{ width: 120 }} onChange={handleLanguageChange}>
            {[
              { key: "en", label: 'English' },
              { key: "ua", label: 'Українська' },
              { key: "pl", label: 'Polski' },
              { key: "cs", label: 'Čeština' },
              { key: "es", label: 'Español' },
              { key: "de", label: 'Deutsch' },
            ].map((option) => (
              <Option key={option.key} value={option.key}>{option.label}</Option>
            ))}
          </Select>

          </Form>
        </Card>
      </div>
    </>
  );
};
