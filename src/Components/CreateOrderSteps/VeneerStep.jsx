import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const VeneerStep = ({ formData, handleCardClick, handleNext, orderID }) => {
  const [veneerData, setVeneerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  // const [isLoading, setIsLoading] = useState(true);
  
  const jwtToken = localStorage.getItem('token');

  const [previousVeneerId, setPreviousVeneerId] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const { order } = useOrder();
  const orderId = order.id;
  const orderIdToUse = orderID || orderId;
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');

  // const [form] = Form.useForm();
  
  // useEffect(() => {
  //   const fetchOrderData = async () => {
  //     try {
  //       const response = await axios.post(
  //         'https://api.boki.fortesting.com.ua/graphql',
  //         {
  //           query: `
  //             query Query($orderId: ID) {
  //               order(id: $orderId) {
  //                 data {
  //                   attributes {
  //                     door_suborder {
  //                       data {
  //                         id
  //                         attributes {
  //                           decor {
  //                             data {
  //                               id
  //                               attributes {
  //                                 type
  //                               }
  //                             }
  //                           }
  //                         }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           `,
  //           variables: {
  //             orderId: orderIdToUse,
  //           }
  //         },
  //         {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${jwtToken}`,
  //           },
  //         }
  //       );
  
  //       const decorData = response.data.data.order?.data?.attributes?.door_suborder?.data?.attributes?.decor?.data;
  
  //       if (decorData && decorData.attributes && decorData.attributes.type === "veneer") {
  //         const initialValues = {
  //           decor: decorData.id || null,
  //         };

  //         form.setFieldsValue(initialValues);
  //         setPreviousVeneerId(initialValues.decor);

  //       }
  //     } catch (error) {
  //       console.error('Error fetching door suborder data:', error);
  //     }
  //   };
  
  //   fetchOrderData();
  // }, [orderIdToUse, jwtToken, form]);

  const fetchOrderData = async () => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($orderId: ID) {
              order(id: $orderId) {
                data {
                  attributes {
                    door_suborder {
                      data {
                        id
                        attributes {
                          decor {
                            data {
                              id
                              attributes {
                                type
                                title
                              }
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
            orderId: orderIdToUse,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      
      console.log(response.data)

      const decorData = response.data.data.order?.data?.attributes?.door_suborder?.data?.attributes?.decor?.data;

      if (decorData && decorData.attributes && decorData.attributes.type === "veneer") {
        // const initialValues = {
        //   decor: decorData.id || null,
        // };

        // form.setFieldsValue(initialValues);
        setPreviousVeneerId(decorData.attributes.title);

      }
    } catch (error) {
      console.error('Error fetching door suborder data:', error);
    }
  };


  const fetchDecorData = async () => {
    // setIsLoading(true);
    setLoading(true);
    try {
      const decorResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Decors($pagination: PaginationArg) {
              decors(pagination: $pagination) {
                data {
                  attributes {
                    title
                    type
                  }
                  id
                }
              }
            }
          `,
          variables: {
            pagination: {
              limit: 100
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const decorData = decorResponse.data.data.decors.data;
      setDecorData(decorData);
    } catch (error) {
      console.error('Error fetching decor data:', error);
    }
    setLoading(false);
  };

  const createDecor = async (data) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation CreateDecor($data: DecorInput!) {
              createDecor(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {
              title: data.title,
              type: data.type,
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      return response.data.data.createDecor.data.id;
    } catch (error) {
      console.error('Error creating decor:', error);
      throw error;
    }
  };

  const checkDecor = async (type, title) => {
    const foundDecor = decorData.find(decor =>
      decor.attributes.type === type && decor.attributes.title.toLowerCase() === title.toLowerCase()
    );
  
    if (foundDecor) {
      setSelectedDecorId(foundDecor.id);
      console.log(`Найден декор с типом ${type} и названием ${title}`);
    } else {
      console.log(`Декор с типом ${type} и названием ${title} не найден. Создаем новый...`);
  
      try {
        const newDecorId = await createDecor({ title, type });
        fetchDecorData();
        setSelectedDecorId(newDecorId);
        console.log(`Декор успешно создан с id: ${newDecorId}`);
      } catch (error) {
        console.error('Ошибка при создании декора:', error);
      }
    }
  };

  const onFinish = async (values) => {
    const updateDoorSuborderId = doorSuborder.data.id; // Получаем id субордера

    const data = {
      decor: selectedDecorId,
      // order: order.id,
      order: orderIdToUse,
    };

    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($updateDoorSuborderId: ID!, $data: DoorSuborderInput!) {
              updateDoorSuborder(id: $updateDoorSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateDoorSuborderId: updateDoorSuborderId,
            data: data
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      console.log('Data sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Veneers($pagination: PaginationArg) {
                veneers(pagination: $pagination) {
                  data {
                    attributes {
                      category
                      code
                      main_properties {
                        title
                        id
                        image {
                          data {
                            attributes {
                              url
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
              pagination: {
                limit: 100
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const veneers = response.data.data.veneers.data.map(veneer => ({
          ...veneer,
          id: veneer.attributes.main_properties.id,
        }));
        setVeneerData(veneers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    const storedCategory = localStorage.getItem('selectedCategory') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedCategory(storedCategory);
    setSearchQuery(storedSearchQuery);

    fetchData();
    fetchDecorData();
    fetchOrderData();
  }, [jwtToken]);
  // }, [jwtToken, form]);

  const categoryOptions = ['ALL', ...new Set(veneerData.map(veneer => veneer.attributes.category))];

  const handleCategoryChange = value => {
    localStorage.setItem('selectedCategory', value);
    setSelectedCategory(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgs = veneerData
    .filter(veneer =>
      (selectedCategory === 'ALL' || veneer.attributes.category === selectedCategory) &&
      (veneer.attributes.main_properties.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       veneer.attributes.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(veneer => ({
      imgSrc: veneer.attributes.main_properties.image.data.attributes.url,
      title: veneer.attributes.main_properties.title,
      description: veneer.attributes.code,
      id: veneer.id,
    }));

  return (
    // <Form onFinish={formData} onValuesChange={formData}>
    // <Form onFinish={onFinish} form={form}>
    <Form onFinish={onFinish} > 

<Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

      <div style={{ display: 'flex', gap: '30px' }}>
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {categoryOptions.map((category, index) => (
            <Select.Option key={index} value={category}>
              {category}
            </Select.Option>
          ))}
        </Select>

        {/* <Select style={{ marginBottom: '10px', width: '100%' }} defaultValue="horizontal">
          <Select.Option value="horizontal">Horizontal</Select.Option>
          <Select.Option value="vertical">Vertical</Select.Option>
        </Select> */}

        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>

      <Divider />

      {loading ? (
        <Spin size="large" />
      ) : (
        // <Form.Item name="step2Field">
        <Form.Item name="veenerStep">
          {/* <Radio.Group value={formData.step2Field}> */}
          <Radio.Group value={formData.veneerStep}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((veneer) => (
                <div key={veneer.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        // formData.step2Field === veneer.id
                        // previousVeneerId === veneer.id
                        previousVeneerId === veneer.title
                        // selectedDecorId === veneer.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    // onClick={() => {
                    //   handleCardClick('step2Field', veneer.id);
                    // }}

                    onClick={() => {
                      checkDecor('veneer', veneer.title);
                      // setPreviousVeneerId(veneer.id);
                      setPreviousVeneerId(veneer.title);
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${veneer.imgSrc}`}
                        alt={veneer.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={veneer.title}
                      description={veneer.description}
                      style={{ paddingTop: '10px' }}
                    />
                    <Radio value={veneer.id} style={{ display: 'none' }} />
                  </Card>
                </div>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}

      <Button type="primary" onClick={handleNext}>
        Далее
      </Button>
    </Form>
  );
};

export default VeneerStep;
