// import React, { useState, useContext, useEffect } from 'react';
// import { AuthContext } from '../../Context/AuthContext';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';


// const InformationStep = ({ formData }) => {
//   const { user } = useContext(AuthContext);
//   const jwtToken = localStorage.getItem('token');

//   const location = useLocation();
//   const orderId = location.pathname.split('/').pop();
  
//   return (
//     <div>Hello</div>
//   );
// };

// export default InformationStep;

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Select, Radio, DatePicker, Button, message, InputNumber } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const InformationStep = ({ formData }) => {
  const { user } = useContext(AuthContext);
  const jwtToken = localStorage.getItem('token');

  const location = useLocation();
  const orderId = location.pathname.split('/').pop();

  const [clients, setClients] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    // Запрос для получения данных о клиентах
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($pagination: PaginationArg) {
              clients(pagination: $pagination) {
                data {
                  id
                  attributes {
                    client_name
                  }
                }
              }
            }
          `,
          variables: {
            pagination: {
              limit: 100,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        setClients(response.data.data.clients.data);
      })
      .catch((error) => {
        console.error('Ошибка при получении данных о клиентах:', error);
      });
  }, [jwtToken]);

  const onFinish = (values) => {
    // Формирование объекта данных для отправки запроса
    const data = {
      client: values.client,
      comment: values.comment,
      shippingAddress: {
        address: values.address,
        city: values.city,
        country: values.country,
        zipCode: values.zipCode,
      },
      status: values.status,
      deliveryAt: values.deliveryAt ? values.deliveryAt.toISOString() : null,
      discount: values.discount,
      currency: values.currency,
      manager: user.id,
    };

    // Отправка запроса на сервер GraphQL
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateOrderId: ID!, $data: OrderInput!) {
              updateOrder(id: $updateOrderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateOrderId: orderId,
            data,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        // Обработка успешного ответа от сервера
        console.log('Успешный ответ:', response);
        message.success('Заказ успешно обновлен!');
      })
      .catch((error) => {
        // Обработка ошибки при запросе
        console.error('Ошибка при обновлении заказа:', error);
        message.error('Произошла ошибка при обновлении заказа.');
      });
  };

  return (
    <div>
      <Form form={form} onFinish={onFinish} labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
        <Form.Item label="Client" name="client">
          <Select>
            {clients.map((client) => (
              <Option key={client.id} value={client.id}>
                {client.attributes.client_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Comment" name="comment">
          <TextArea />
        </Form.Item>
        <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>
        <Form.Item label="City" name="city">
          <Input />
        </Form.Item>
        <Form.Item label="Country" name="country">
          <Input />
        </Form.Item>
        <Form.Item label="Zip Code" name="zipCode">
          <Input />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Radio.Group>
            <Radio value="Draft">Draft</Radio>
            <Radio value="Active">Active</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Delivery Date" name="deliveryAt">
          <DatePicker showTime />
        </Form.Item>
        <Form.Item label="Discount" name="discount">
          <InputNumber />
        </Form.Item>
        <Form.Item label="Currency" name="currency">
          <Select>
            <Option value="EUR">EUR</Option>
            <Option value="PLN">PLN</Option>
            <Option value="USD">USD</Option>
            <Option value="UAH">UAH</Option>
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default InformationStep;











