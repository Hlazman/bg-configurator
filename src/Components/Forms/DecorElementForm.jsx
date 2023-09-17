import React, { useState, useEffect } from 'react';
import { Form, Button, Select, InputNumber, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import GroupDecorElementStep from '../CreateOrderSteps/GroupDecorElementStep';

const { Option } = Select;

const DecorElementForm = ({ orderID, elementID, language}) => {
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
          query Query($elementSuborderId: ID) {
            elementSuborder(id: $elementSuborderId) {
              data {
                id
                attributes {
                  amount
                  element {
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
          }
        `,
        variables: {
          elementSuborderId: elementID || "null",
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
      const elementSuborderData = response.data.data.elementSuborder.data;
      if (elementSuborderData) {
        form.setFieldsValue({
          name: elementSuborderData?.attributes?.element?.data?.id,
          width: elementSuborderData?.attributes?.sizes?.width,
          height: elementSuborderData?.attributes?.sizes?.height,
          thickness: elementSuborderData?.attributes?.sizes?.thickness,
          amount: elementSuborderData?.attributes?.amount,
        });
      }
      
    })
    .catch(error => {
      console.error('Error fetching element suborder data:', error);
    });
  }, [jwtToken, elementID, form]);

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
      setElementOptions(response.data.data.elements.data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching elements data:', error);
      setIsLoading(false);
    });
  }, [jwtToken, form]);

  const handleFormSubmit = values => {
    const { name, width, height, thickness, amount } = values;
    const selectedElement = elementOptions.find(option => option.id === name);

    if (elementID) {
      const data = {
        amount,
        element: selectedElement.id,
        sizes: {
          height,
          thickness,
          width,
        }
      };
  
      axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
              updateElementSuborder(id: $updateElementSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateElementSuborderId: elementID,
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
      .then(response => {
        console.log('Data updated successfully:', response);
      })
      .catch(error => {
        console.error('Error updating data:', error);
      });
    }
  };

// NEED TO DO ONCE AND NOTE REWRITE
  // useEffect(() => {
  //   if (doorSuborder) {
  //     axios.post(
  //       'https://api.boki.fortesting.com.ua/graphql',
  //       {
  //         query: `
  //           query Query($doorSuborderId: ID) {
  //             doorSuborder(id: $doorSuborderId) {
  //               data {
  //                 attributes {
  //                   decor {
  //                     data {
  //                       id
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         `,
  //         variables: {
  //           doorSuborderId: doorSuborder.data.id,
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     )
  //     .then(response => {
  //       const decorDataId = response.data.data.doorSuborder.data.attributes.decor.data;
        
  //       if (decorDataId && decorDataId.id) {
  //         axios.post(
  //           'https://api.boki.fortesting.com.ua/graphql',
  //           {
  //             query: `
  //               mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
  //                 updateElementSuborder(id: $updateElementSuborderId, data: $data) {
  //                   data {
  //                     id
  //                   }
  //                 }
  //               }
  //             `,
  //             variables: {
  //               updateElementSuborderId: elementID.toString(),
  //               data: {
  //                 decor: decorDataId.id,
  //               },
  //             },
  //           },
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //               Authorization: `Bearer ${jwtToken}`,
  //             },
  //           }
  //         )
  //         .then(response => {
  //           console.log('Update successful:', response);
  //           console.log('decorDataId', decorDataId)
  //         })
  //         .catch(error => {
  //           console.error('Error updating element suborder:', error);
  //         });
  //       } else {
  //           console.log('No decor data found');
  //         }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching decor data:', error);
  //     });
  //   }
  // }, [jwtToken, doorSuborder, elementID]);


  return (
    <Spin spinning={isloading}>
      <Form form={form} onFinish={handleFormSubmit} > 
        
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
            <InputNumber addonBefore="Width"/>
          </Form.Item>
          
          <Form.Item name="height" style={{ width: '100%' }} >
            <InputNumber addonBefore="Height"/>
          </Form.Item>

          <Form.Item name="thickness" style={{ width: '100%' }} >
            <InputNumber addonBefore="Thickness" addonAfter="mm"/>
          </Form.Item>

          <Form.Item name="amount" style={{ width: '100%' }} >
            <InputNumber addonBefore="Amount" addonAfter="count"/>
          </Form.Item>

        </div>
      </Form>
      
      <div style={{padding: '0 25px' }}>
        <GroupDecorElementStep
          elementID={elementID}
          language={language}
        />
        </div>
    </Spin>

  );
};

export default DecorElementForm;
