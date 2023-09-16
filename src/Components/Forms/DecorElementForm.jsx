import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const { Option } = Select;

const DecorElementForm = ({onFinish, orderID}) => {
  const [elementOptions, setElementOptions] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');

  const { order } = useOrder();
  const orderId = order.id;
  const orderIdToUse = orderID || orderId;
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const [decorDataId, setDecorDataId] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
      {
        query: `
          query Query($doorSuborderId: ID) {
            doorSuborder(id: $doorSuborderId) {
              data {
                attributes {
                  decor {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          doorSuborderId: doorSuborder.data.id,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then(response => {
      setDecorDataId(response.data.data.doorSuborder.data.attributes.decor.data);
    })
    .catch(error => {
      console.error('Error fetching decor data:', error);
    });
  }, [jwtToken, doorSuborder.data.id]);

  useEffect(() => {
    axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
      {
        query: `
          query Query($pagination: PaginationArg) {
            elements(pagination: $pagination) {
              data {
                id
                attributes {
                  title
                }
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 10
          }
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then(response => {
      console.log('Данные элементов:', response.data.data.elements.data);
      
      setElementOptions(response.data.data.elements.data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching elements data:', error);
      setIsLoading(false);
    });
  }, [jwtToken, form]);

  return (
    <Spin spinning={isloading}>
      <Form form={form} onFinish={onFinish} > 
        
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>

        <div style={{ display: 'flex', gap: '30px', padding: '10px 25px' }}>
          
        <Form.Item
          name="name"
          style={{ width: '100%' }}
          rules={[{ required: true, message: 'Please select an element!' }]}
        >
          <Select
            placeholder="Select an element"
            allowClear
            defaultValue={undefined}
          >
            {elementOptions.map(option => (
              <Option key={option.id} value={option.id}>{option.attributes.title}</Option>
            ))}
          </Select>
        </Form.Item>

          <Form.Item name="width" style={{ width: '100%' }} >
            <Input addonBefore="Width"/>
          </Form.Item>
          
          <Form.Item name="height" style={{ width: '100%' }} >
            <Input addonBefore="Height"/>
          </Form.Item>

          <Form.Item name="thickness" style={{ width: '100%' }} >
            <Input addonBefore="Thickness" addonAfter="mm"/>
          </Form.Item>

          <Form.Item name="amount" style={{ width: '100%' }} >
            <InputNumber addonBefore="Amount" addonAfter="count"/>
          </Form.Item>

        </div>

        {/* <div style={{padding: '0 25px' }}>
          <GroupDecorElementStep
            language={language}
          />
        </div> */}

      </Form>
    </Spin>
  );
};


export default DecorElementForm;