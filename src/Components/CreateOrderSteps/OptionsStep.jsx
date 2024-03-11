import { Form, Button, Card, Radio, message, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'
import {getOptions, getOptionsDataOrder, deleteOption, addOption} from '../../api/options';
import {validateOptions} from '../../api/validationOrder';

const OptionsStep = ({ setCurrentStepSend, currentStepSend }) => {
  // const { orderId } = useOrder();
  const { orderId, optionsData, setOptionsData, optionsSuborderData, setOptionsSuborderData, notValidOptions, setNotValidOptions } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const orderIdToUse = orderId;
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  // const [optionsData, setOptionsData] = useState(null);
  // const [optionsSuborderData, setOptionsSuborderData] = useState(null);
  // const [notValidOptions, setNotValidOptions] = useState([]);

  const [btnColor, setBtnColor] = useState('#ff0505');

  // const fetchOptionsData = async () => {
  //   try {
  //     const optionsResponse = await axios.post(
  //       // 'https://api.boki.fortesting.com.ua/graphql',
  //       queryLink,
  //       {
  //         query: `
  //           query Query($pagination: PaginationArg, $sort: [String]) {
  //             options(pagination: $pagination, sort: $sort) {
  //               data {
  //                 id
  //                 attributes {
  //                   title
  //                   price
  //                   actuality
  //                 }
  //               }
  //             }
  //           }
  //         `,
  //         variables: {
  //           pagination: {
  //             limit: 30
  //           },
  //           sort: "actuality"
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
  
  //     if (optionsResponse.data.data && optionsResponse.data.data.options) {
  //       setOptionsData(optionsResponse.data.data.options.data);
  //     }
  
  //   } catch (error) {
  //     console.error('Error fetching order data:', error);
  //   }
  // };

  // const fetchOrderData = async () => {
  //   try {
  //     if (!orderIdToUse) return;
  
  //     const response = await axios.post(
  //       // 'https://api.boki.fortesting.com.ua/graphql',
  //       queryLink,
  //       {
  //         query: `
  //           query Query($orderId: ID, $pagination: PaginationArg) {
  //             order(id: $orderId) {
  //               data {
  //                 attributes {
  //                   option_suborders(pagination: $pagination) {
  //                     data {
  //                       id
  //                       attributes {
  //                         title
  //                         price
  //                         custom
  //                         option {
  //                           data {
  //                             id
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                   horizontal_veneer
  //                   super_gloss
  //                 }
  //               }
  //             }
  //           }
  //         `,
  //         variables: {
  //           orderId: orderIdToUse,
  //           pagination: {
  //             limit: 20
  //           },
  //           filters: {
  //             custom: false,
  //           }
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );

  //     if (response.data?.data?.order) {
  //       const orderData = response.data.data.order.data.attributes;
  //       const suborderOptionsData = response.data.data.order.data.attributes.option_suborders.data;
  //       const customFalseSuborders = suborderOptionsData.filter(suborder => suborder.attributes.custom === false);
        
  //       setOptionsSuborderData(customFalseSuborders)

  //       form.setFieldsValue(orderData);
  //         customFalseSuborders.forEach(option => {
  //         form.setFieldsValue({
  //           [`option_${option.attributes.option.data.id}`]: true
  //         });
  //       });
  //     }
        
  //   } catch (error) {
  //     console.error('Error fetching order data:', error);
  //   }
  // };

  const handleFormSubmit = async (values) => {
    const data = {'horizontal_veneer': values.horizontal_veneer, 'super_gloss': values.super_gloss,}
    try {
      const response = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
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
      messageApi.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            optionsSend: true
          };
        });
        setBtnColor('#4BB543');
      }
    } catch (error) {
      messageApi.error(language.errorQuery);
    }
    
    getOptions(jwtToken, orderIdToUse, setOptionsData);
    getOptionsDataOrder(orderIdToUse, jwtToken, setOptionsSuborderData, form);
    validateOptions(orderIdToUse, jwtToken, optionsData, optionsSuborderData, setNotValidOptions);
  };

  // const createSubOrder = async (option) => {
  //   try {
  //     const response = await axios.post(
  //       // 'https://api.boki.fortesting.com.ua/graphql',
  //       queryLink,
  //       {
  //         query: `
  //           mutation Mutation($data: OptionSuborderInput!) {
  //             createOptionSuborder(data: $data) {
  //               data {
  //                 id
  //               }
  //             }
  //           }
  //         `,
  //         variables: {
  //           data: {
  //             option: option.id,
  //             title: option.attributes.title,
  //             order: orderIdToUse,
  //           },
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
      
  //     const createdOptionSuborder = response.data.data.createOptionSuborder.data;
      
  //     updateOptionSuborder(createdOptionSuborder, option)
  //     fetchOrderData()
      
  //   } catch (error) {
  //     console.error('Error creating option suborder:', error);
  //   }
  // };

  // const deleteSubOrder = async (optionId) => {
  //   const optionSuborder = optionsSuborderData.find(suborder => suborder.attributes.option.data.id === optionId);

  //   if (optionSuborder) {
  //     try {
  //       await updateOptionSuborder(optionSuborder, null)
  //       const response = await axios.post(
  //         // 'https://api.boki.fortesting.com.ua/graphql',
  //         queryLink,
  //         {
  //           query: `
  //             mutation Mutation($deleteOptionSuborderId: ID!) {
  //               deleteOptionSuborder(id: $deleteOptionSuborderId) {
  //                 data {
  //                   id
  //                 }
  //               }
  //             }
  //           `,
  //           variables: {
  //             deleteOptionSuborderId: optionSuborder.id,
  //           },
  //         }, 
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${jwtToken}`,
  //           },
  //         }
  //       );

  //       fetchOrderData()

  //     } catch (error) {
  //       console.error('Error deleting option suborder:', error);
  //     }
  //   }
  // };

  // const updateOptionSuborder = async (updateOptionSuborderId, option) => {
  //   try {
  //     await axios.post(
  //       // 'https://api.boki.fortesting.com.ua/graphql',
  //       queryLink,
  //       {
  //         query: `
  //           mutation Mutation($updateOptionSuborderId: ID!, $data: OptionSuborderInput!) {
  //             updateOptionSuborder(id: $updateOptionSuborderId, data: $data) {
  //               data {
  //                 id
  //               }
  //             }
  //           }
  //         `,
  //         variables: {
  //           updateOptionSuborderId: updateOptionSuborderId.id,
  //           data: {
  //             title: option ? option.attributes.title : null,
  //           },
  //         },
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${jwtToken}`,
  //         },
  //       }
  //     );
  
  //   } catch (error) {
  //     console.error('Error updating option suborder:', error);
  //   }
  // };
  

  useEffect(()=> {
    // fetchOptionsData();
    // fetchOrderData();

    getOptions(jwtToken, orderIdToUse, setOptionsData);
    getOptionsDataOrder(orderIdToUse, jwtToken, setOptionsSuborderData, form);
    
    if (currentStepSend && currentStepSend.optionsSend) {
      setBtnColor('#4BB543');
    }
  },[jwtToken, orderIdToUse, currentStepSend, form]);


  useEffect(() => {
    if (optionsData && optionsSuborderData && notValidOptions) {
      validateOptions(orderIdToUse, jwtToken, optionsData, optionsSuborderData, setNotValidOptions);
    }
  }, [optionsData, optionsSuborderData])

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC'}}>
      <Form form={form} onFinish={handleFormSubmit}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '20px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.options}`}
        </Button>
      </Affix>

      {notValidOptions.length > 0 && (
        <div style={{border: '2px solid #ed5249', borderRadius: '10px', padding: '0 10px', marginBottom: '10px'}}>
          <h3 style={{color: '#ed5249'}}> {language.errorOptionsPage} </h3>
          {notValidOptions && notValidOptions.map(option => (
            <div key={option.id} style={{ display: 'flex', gap: '30px' }}>
              <Form.Item
                label={languageMap[selectedLanguage][option.attributes.title]}
                name={`option_${option.id}`}
              >
                <Radio.Group
                  buttonStyle="solid"
                  onChange={(e) => {
                    const selectedValue = e.target.value

                    if (selectedValue === true) {
                      // createSubOrder(option);
                      addOption(jwtToken, orderIdToUse, option);
                    } else if (selectedValue === false) {
                      // deleteSubOrder(option.id);
                      deleteOption(jwtToken, optionsSuborderData, option)
                    }
                  }}
                >
                  <Radio.Button value={true}>{language.yes}</Radio.Button>
                  <Radio.Button value={false}>{language.no}</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>
          ))}
        </div>
      )}

        {optionsData && optionsData.map(option => (
          <div key={option.id} style={{ display: 'flex', gap: '30px' }}>
            <Form.Item
              label={languageMap[selectedLanguage][option.attributes.title]}
              name={`option_${option.id}`}
            >
              <Radio.Group
                buttonStyle="solid"
                onChange={(e) => {
                  const selectedValue = e.target.value

                  if (selectedValue === true) {
                    // createSubOrder(option);
                    addOption(jwtToken, orderIdToUse, option);
                  } else if (selectedValue === false) {
                    // deleteSubOrder(option.id);
                    deleteOption(jwtToken, optionsSuborderData, option)
                  }
                }}
              >
                <Radio.Button value={true}>{language.yes}</Radio.Button>
                <Radio.Button value={false}>{language.no}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '30px' }}>
          <Form.Item
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
            label={language.superGloss}
            name="super_gloss"
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

      </Form>
    </Card>
  );
};

export default OptionsStep;

