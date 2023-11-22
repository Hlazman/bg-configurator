import { Form, Button, Card, Radio, message } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const OptionsStep = ({ setCurrentStepSend }) => {
  const { orderId } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const orderIdToUse = orderId;

  const [form] = Form.useForm();
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const [optionsData, setOptionsData] = useState(null);
  const [optionsSuborderData, setOptionsSuborderData] = useState(null);

  const fetchOptionsData = async () => {
    try {
      const optionsResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($pagination: PaginationArg) {
              options(pagination: $pagination) {
                data {
                  id
                  attributes {
                    title
                    price
                  }
                }
              }
            }
          `,
          variables: {
            pagination: {
              limit: 30
            }
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      if (optionsResponse.data.data && optionsResponse.data.data.options) {
        setOptionsData(optionsResponse.data.data.options.data);
      }

      // console.log('fetchOptionsData', optionsData)
  
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  const fetchOrderData = async () => {
    try {
      if (!orderIdToUse) return;
  
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($orderId: ID, $pagination: PaginationArg) {
              order(id: $orderId) {
                data {
                  attributes {
                    option_suborders(pagination: $pagination) {
                      data {
                        id
                        attributes {
                          title
                          price
                          option {
                            data {
                              id
                            }
                          }
                        }
                      }
                    }
                    horizontal_veneer
                    super_gloss
                  }
                }
              }
            }
          `,
          variables: {
            orderId: orderIdToUse,
            pagination: {
              limit: 20
            }
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.data?.data?.order) {
        const orderData = response.data.data.order.data.attributes;
        const suborderOptionsData = response.data.data.order.data.attributes.option_suborders.data;
        
        setOptionsSuborderData(suborderOptionsData)
        form.setFieldsValue(orderData);

        suborderOptionsData.forEach(option => {
          form.setFieldsValue({
            [`option_${option.attributes.option.data.id}`]: true
          });
        });

        // optionsData.forEach(option => {
        //   const fieldName = `option_${option.id}`;
        //   const isSelected = suborderOptionsData.some(suborder => suborder.attributes.option.data.id === option.id);
        //   form.setFieldsValue({
        //     [fieldName]: isSelected
        //   });
        // });

        // console.log('fetchOrderData', optionsSuborderData)
      }
        
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  // useEffect(() => {
  //   fetchOptionsData()
  //   fetchOrderData();
  // }, [orderIdToUse, jwtToken, form, createSubOrder, deleteSubOrder]);

  
  const handleFormSubmit = async (values) => {
    const data = {'horizontal_veneer': values.horizontal_veneer, 'super_gloss': values.super_gloss,}
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
            data: data,
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
      message.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            optionsSend: true
          };
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      message.error(language.errorQuery);
    }
  };

  const createSubOrder = async (option) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($data: OptionSuborderInput!) {
              createOptionSuborder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {
              option: option.id,
              title: option.attributes.title,
              // price: option.attributes.price,
              order: orderIdToUse,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      // console.log('Create Option Suborder', response)
      
      const createdOptionSuborder = response.data.data.createOptionSuborder.data;
      updateOptionSuborder(createdOptionSuborder, option)
      fetchOrderData()
      
    } catch (error) {
      console.error('Error creating option suborder:', error);
    }
  };

  const deleteSubOrder = async (optionId) => {
    const optionSuborder = optionsSuborderData.find(suborder => suborder.attributes.option.data.id === optionId);

    if (optionSuborder) {
      try {
        await updateOptionSuborder(optionSuborder, null)
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              mutation Mutation($deleteOptionSuborderId: ID!) {
                deleteOptionSuborder(id: $deleteOptionSuborderId) {
                  data {
                    id
                  }
                }
              }
            `,
            variables: {
              deleteOptionSuborderId: optionSuborder.id,
            },
          }, 
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        // const deletedID = response.data.data.deleteOptionSuborder.data;
        // console.log('Delete Option Suborder', response)
        fetchOrderData()
      } catch (error) {
        console.error('Error deleting option suborder:', error);
      }
    }
  };

  const updateOptionSuborder = async (updateOptionSuborderId, option) => {
    try {
      // const response = await axios.post(
      await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateOptionSuborderId: ID!, $data: OptionSuborderInput!) {
              updateOptionSuborder(id: $updateOptionSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateOptionSuborderId: updateOptionSuborderId.id,
            data: {
              // price: option.attributes.price,
              price: option ? option.attributes.price : 0,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      // console.log('Update Option Suborder:', response.data);
    } catch (error) {
      console.error('Error updating option suborder:', error);
    }
  };
  

  useEffect(()=> {
    fetchOptionsData()
    fetchOrderData()
  },[]);

  // const [temp, setTemp] = useState(false)

  // useEffect(() => {
  //   fetchOptionsData()
  //   // fetchOrderData();
  // }, [orderIdToUse, jwtToken, form]);
  // // }, [orderIdToUse, jwtToken, form, temp]);

  
  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC'}}>
      <Form form={form} onFinish={handleFormSubmit}>
      <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            // label="Horizontal veneer"
            label={language.horizontalVeneer}
            name="horizontal_veneer"
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
            // label="Super gloss"
            label={language.superGloss}
            name="super_gloss"
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        {optionsData && optionsData.map(option => (
          <div key={option.id} style={{ display: 'flex', gap: '30px' }}>
            <Form.Item
              // label={option.attributes.title}
              label={languageMap[selectedLanguage][option.attributes.title]}
              name={`option_${option.id}`}
            >
              <Radio.Group
                buttonStyle="solid"
                // defaultValue={false}
                onChange={(e) => {
                  const selectedValue = e.target.value

                  if (selectedValue === true) {
                    // setTemp(true)
                    createSubOrder(option);
                  } else if (selectedValue === false) {
                    // setTemp(false)
                    deleteSubOrder(option.id);
                  }
                }}
              >
                <Radio.Button value={true}>{language.yes}</Radio.Button>
                <Radio.Button value={false}>{language.no}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>
        ))}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {language.submit}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OptionsStep;

