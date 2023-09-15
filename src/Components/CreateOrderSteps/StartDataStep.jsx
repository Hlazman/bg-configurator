import { Form, Button, Card, Radio, message } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';

const StartDataStep = ({ handleNext, orderID }) => {
  const { order } = useOrder();
  const updateOrderId = order?.id;
  const jwtToken = localStorage.getItem('token');
  const orderIdToUse = orderID || updateOrderId;

  const [form] = Form.useForm();
  const [orderData, setOrderData] = useState(null);

  const fetchOrderData = async () => {
    try {
      if (!orderIdToUse) return;

      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($orderId: ID) {
              order(id: $orderId) {
                data {
                  attributes {
                    hidden
                    double_door
                    opening
                    side
                  }
                }
              }
            }
          `,
          variables: {
            orderId: orderIdToUse,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.data.data && response.data.data.order) {
        const orderData = response.data.data.order.data.attributes;
        setOrderData(orderData);
        form.setFieldsValue(orderData); // Устанавливаем начальные значения в форму
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderIdToUse, jwtToken, form]);

  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($data: OrderInput!, $updateOrderId: ID!) {
              updateOrder(data: $data, id: $updateOrderId) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: values,
            updateOrderId: orderIdToUse,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      message.success('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Error updating order');
    }
  };

  return (
    <Card>
      <Form form={form} onFinish={handleFormSubmit}>
      <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label="Double Door"
            name="double_door"
            // initialValue={orderData ? orderData.double_door : null}
            rules={[{ required: true, message: 'Please select Double Door option!' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>Yes</Radio.Button>
              <Radio.Button value={false}>No</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label="Hidden"
            name="hidden"
            // initialValue={orderData?.hidden ?? null} 
            rules={[{ required: true, message: 'Please select Hidden option!' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>Yes</Radio.Button>
              <Radio.Button value={false}>No</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label="Side"
            name="side"
            // initialValue={orderData?.side ?? null} 
            rules={[{ required: true, message: 'Please select Side option!' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="left">Left</Radio.Button>
              <Radio.Button value="right">Right</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label="Opening"
            name="opening"
            // initialValue={orderData?.opening ?? null}
            rules={[{ required: true, message: 'Please select Opening option!' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="inside">Inside</Radio.Button>
              <Radio.Button value="outside">Outside</Radio.Button>
              <Radio.Button value="universal">Universal</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StartDataStep;

