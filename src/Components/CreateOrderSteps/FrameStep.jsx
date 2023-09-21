import { Form, Button, Card, Spin, Select } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';

const { Option } = Select;

// const FrameStep = ({ orderID }) => {
const FrameStep = () => {
  const jwtToken = localStorage.getItem('token');
  
  // const { order } = useOrder();
  // const updateOrderId = order?.id;
  // const orderIdToUse = orderID || updateOrderId;
  // const frameSuborder = order.suborders.find(suborder => suborder.name === 'frameSub');
  
  const { orderId, frameSuborderId } = useOrder()
    const orderIdToUse = orderId;
  
  // const [isloading, setIsLoading] = useState(false);

  const [frames, setFrames] = useState([]);
  const [orderData, setOrderData] = useState({});

  const [form] = Form.useForm();

  useEffect(() => {
    axios.post(
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
      
      if (orderData?.frame_suborder?.data?.attributes?.frame?.data?.id &&
        orderData?.frame_suborder?.data?.attributes?.frame?.data?.attributes?.title) {
          const frameId = orderData?.frame_suborder?.data?.attributes?.frame?.data?.id;
          if (frames.find(frame => frame.id === frameId)) {
            form.setFieldsValue({ name: frameId });
          }
        }
    });
  
    // query for frames
    axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
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
          filters: {
            hidden: {
              // eq: orderData?.hidden || true
              eq: orderData?.hidden || null
            },
            opening: {
              // eq: orderData?.opening || "inside"
              eq: orderData?.opening || null
            },
          }
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
  // }, [jwtToken, orderData?.hidden, orderData?.opening, orderIdToUse]);
  }, [jwtToken, orderData, orderIdToUse, form]);

  
  const handleFormSubmit = () => {
    const selectedFrameId = form.getFieldValue('name');
    // Подготавливаем данные для отправки
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

    // query update frame
    axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
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
          // updateFrameSuborderId: frameSuborder.data.id,
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
      console.log('Data updated:', response.data);
    }).catch(error => {
      console.error('Error updating data:', error);
    });
  };

  return (
    <Card>
     {/* <Spin spinning={isloading}> */}
      <Form form={form} onFinish={handleFormSubmit}> 

        <div style={{ display: 'flex', gap: '30px', padding: '10px 25px' }}>
          
        <Form.Item
          name="name"
          style={{ width: '100%' }}
          rules={[{ required: true, message: 'Please select an element!' }]}
        >
          <Select
            placeholder="Select an frame"
            allowClear
            // defaultValue={undefined}
          >
            {frames.map(frame => (
              <Option key={frame.id} value={frame.id}>{frame.attributes.title}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>

        </div>
      </Form>

    {/* </Spin> */}
    </Card>
  );
};

export default FrameStep;
