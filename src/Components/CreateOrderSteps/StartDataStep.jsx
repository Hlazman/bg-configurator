import { Form, Button, Card, Radio, message } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const StartDataStep = ({ formData, handleNext }) => {
  const { order } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const updateOrderId = order.id;

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
            updateOrderId: updateOrderId,
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
      console.log('Order updated:', response.data);
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Error updating order');
    }
  };

  return (
    <Card>
      <Form onFinish={handleFormSubmit}>
        <div style={{ display: 'flex', gap: '30px' }}>
        <Form.Item
          label="Double Door"
          name="double_door"
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
          rules={[{ required: true, message: 'Please select Hidden option!' }]}
        >
          <Radio.Group>
            <Radio.Button value={true}>Yes</Radio.Button>
            <Radio.Button value={false}>No</Radio.Button>
          </Radio.Group>
        </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
        <Form.Item
          label="Side"
          name="side"
          rules={[{ required: true, message: 'Please select Side option!' }]}
        >
          <Radio.Group>
            <Radio.Button value="left">Left</Radio.Button>
            <Radio.Button value="right">Right</Radio.Button>
          </Radio.Group>
        </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
        <Form.Item
          label="Opening"
          name="opening"
          rules={[{ required: true, message: 'Please select Opening option!' }]}
        >
          <Radio.Group>
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
