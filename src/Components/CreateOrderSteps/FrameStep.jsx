import { Form, Button, Card, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'

const { Option } = Select;

const FrameStep = ({ setCurrentStepSend, currentStepSend }) => {
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [messageApi, contextHolder] = message.useMessage();
  const { orderId, frameSuborderId } = useOrder()
  const orderIdToUse = orderId;
  const [frames, setFrames] = useState([]);
  const [orderData, setOrderData] = useState({});
  const [form] = Form.useForm();
  const [btnColor, setBtnColor] = useState('#ff0505');

  useEffect(() => {
    axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
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
                  door_suborder {
                    data {
                      attributes {
                        decor {
                          data {
                            id
                          }
                        }
                        sizes {
                          height
                          thickness
                          width
                        }
                      }
                    }
                  }
                  frame_suborder {
                    data {
                      attributes {
                        frame {
                          data {
                            attributes {
                              title
                            }
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          orderId: orderIdToUse
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    ).then(response => {
      const data = response.data?.data?.order?.data?.attributes || {};
      setOrderData(data);

      if (data?.frame_suborder?.data?.attributes?.frame?.data?.id) {
        form.setFieldsValue({
          name: data?.frame_suborder?.data?.attributes?.frame.data.id,
        });
      }
    });
  }, [jwtToken, orderIdToUse]);

  
  useEffect(() => {
    axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
      {
        query: `
          query Frames($pagination: PaginationArg, $filters: FrameFiltersInput) {
            frames(pagination: $pagination, filters: $filters) {
              data {
                attributes {
                  title
                }
                id
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 20
          },
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    ).then(response => {
      const data = response.data?.data?.frames?.data || [];
      setFrames(data);
    });

    if (currentStepSend && currentStepSend.frameSend) {
      setBtnColor('#4BB543');
    }
  }, [jwtToken, orderData]);
  
  const handleFormSubmit = () => {
    const selectedFrameId = form.getFieldValue('name');
    const dataToUpdate = {
      decor: orderData?.door_suborder?.data?.attributes?.decor?.data?.id,
      frame: selectedFrameId,
      side: orderData?.side,
      sizes: {
        height: orderData?.door_suborder?.data?.attributes?.sizes?.height,
        thickness: orderData?.door_suborder?.data?.attributes?.sizes?.thickness,
        width: orderData?.door_suborder?.data?.attributes?.sizes?.width,
      }
    };

    axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
      {
        query: `
          mutation Mutation($updateFrameSuborderId: ID!, $data: FrameSuborderInput!) {
            updateFrameSuborder(id: $updateFrameSuborderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateFrameSuborderId: frameSuborderId,
          data: dataToUpdate
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    ).then(response => {
      messageApi.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            frameSend: true
          };
        });
      }
      setBtnColor('#4BB543');
    }).catch(error => {
      messageApi.error(language.errorQuery);
    });
  };

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC'}}>
      <Form form={form} onFinish={handleFormSubmit}>
        {contextHolder}

        <Form.Item
          label={language.frame}
          name="name"
          style={{ marginTop: '20px' }}
          rules={[{ required: true, message: language.requiredField }]}
        >
          <Select
            placeholder={language.frame}
            allowClear
          >
            {frames.map(frame => (
              <Option key={frame.id} value={frame.id}>{languageMap[selectedLanguage][frame.attributes.title]}</Option>
            ))}
          </Select>
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

export default FrameStep;

