import { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, message, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const { TextArea } = Input;

const InformationStep = ({ setCurrentStepSend, currentStepSend }) => {
  const { orderId } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [btnColor, setBtnColor] = useState('#ff0505');

  const onFinish = (values) => {
    const data = {
      comment: values.comment || null,
    };

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
        messageApi.success(language.successQuery);
        if (setCurrentStepSend) {
          setCurrentStepSend(prevState => {
            return {
              ...prevState,
              informationSend: true
            };
          });
          setBtnColor('#4BB543');
        }
      }).catch((error) => {
        messageApi.error(language.errorQuery);
      });
  };

  useEffect(() => {
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Order($orderId: ID) {
              order(id: $orderId) {
                data {
                  id
                  attributes {
                    comment
                  }
                }
              }
            }
          `,
          variables: {
            orderId: orderId
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
        const orderData = response?.data?.data?.order?.data?.attributes;

        if (orderData) {
          form.setFieldsValue({
            comment: orderData?.comment || '',
          });
        }
      })
      .catch((error) => {
        console.error('Error while fetching order data:', error);
      });

      if (currentStepSend && currentStepSend.informationSend) {
        setBtnColor('#4BB543');
      }
  }, [jwtToken, orderId, form]);

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC', marginTop: '20px'}}>
      {contextHolder}
      <Form form={form} onFinish={onFinish} initialValues={{ currency: 'EUR' }} >

        <Form.Item label={language.comment} name="comment">
          <TextArea rows={8}/>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>

          <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
            {`${language.submit} ${language.frame}`}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InformationStep;
