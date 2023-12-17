import { Form, Button, Card, Radio, message, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import { useTotalOrder } from '../../Context/TotalOrderContext';
import { useSelectedCompany } from '../../Context/CompanyContext';
import {updateTotalOrder} from '../../api/updateTotalOrder'

const StartDataStep = ({ setCurrentStepSend, currentStepSend }) => {
  const { orderId } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const orderIdToUse = orderId;
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [orderData, setOrderData] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { totalOrderId } = useTotalOrder();
  const { selectedCompany } = useSelectedCompany();

  const [btnColor, setBtnColor] = useState('#ff0505');

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

      if (response?.data?.data && response?.data?.data?.order) {
        const orderData = response?.data?.data?.order?.data?.attributes;
        setOrderData(orderData);
        form.setFieldsValue(orderData);
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  useEffect(() => {
    fetchOrderData();

    if (currentStepSend && currentStepSend.startDataSend) {
      setBtnColor('#4BB543');
    }
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
      
      await updateTotalOrder(totalOrderId, jwtToken, selectedCompany);

      messageApi.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            startDataSend: true
          };
        });
      }
      setBtnColor('#4BB543');
    } catch (error) {
      messageApi.error(language.errorQuery);
    }
  };

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC'}}>
      <Form form={form} onFinish={handleFormSubmit}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-50px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
        {`${language.submit} ${language.startData}`}
        </Button>
      </Affix>

      <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label={language.doubleDoor}
            name="double_door"
            rules={[{ required: true, message: language.requiredField }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label={language.hidden}
            name="hidden"
            rules={[{ required: true, message: language.requiredField }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label={language.side}
            name="side"
            rules={[{ required: true, message: language.requiredField }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="left">{language.left}</Radio.Button>
              <Radio.Button value="right">{language.right}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            label={language.opening}
            name="opening"
            rules={[{ required: true, message: language.requiredField }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="inside">{language.inside}</Radio.Button>
              <Radio.Button value="outside">{language.outside}</Radio.Button>
              <Radio.Button value="universal">{language.universal}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>
      </Form>
    </Card>
  );
};

export default StartDataStep;

