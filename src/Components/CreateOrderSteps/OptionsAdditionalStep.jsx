import { Form, Button, Card, message, Affix, Input, InputNumber, Space, Modal } from 'antd';
import { SendOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState, useContext } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import { AuthContext } from '../../Context/AuthContext';

const OptionsAdditionalStep = ({ setCurrentStepSend }) => {
  const { user } = useContext(AuthContext);
  const { orderId } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const orderIdToUse = orderId;
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const [optionsSuborderData, setOptionsSuborderData] = useState(null);

  const [items, setItems] = useState([]);
  // const [removeItem, seRemoveItem] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);


  // const handleRemoveItem = (index) => {
  //   if (items[index]) {
  //     const suborderId = items[index].id.toString();
  //     deleteSubOrder(suborderId, items[index]);
  //   }
  // };

  const handleRemoveItem = async (index) => {
    if (items[index]) {
      setDeleteItem(items[index]);
      setModalVisible(true);
    }
  };
  
  const handleDeleteConfirmed = (name) => {
    if (deleteItem) {
      const suborderId = deleteItem.id.toString();
      deleteSubOrder(suborderId, deleteItem);
      setModalVisible(false);
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
                          custom
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
            pagination: {
              limit: 20
            },
            filters: {
              custom: true,
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
        const suborderOptionsData = response.data.data.order.data.attributes.option_suborders.data;
        const customtrueSuborders = suborderOptionsData.filter(suborder => suborder.attributes.custom === true);

        if (optionsSuborderData && optionsSuborderData.length > 0) {
          const initialItems = optionsSuborderData.map((suborder, index) => ({
            id: suborder.id,
            title: suborder.attributes.title,
            price: suborder.attributes.price,
          }));
          setItems(initialItems);
        }
    
        setOptionsSuborderData(customtrueSuborders);
        setTrigger(true)
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const formItems = values.items;
      const serverItemIds = optionsSuborderData.map(item => item.id);
  
      for (const formItem of formItems) {
        if (serverItemIds.includes(formItem.id)) {
          await updateOptionSuborder(formItem, formItem, false);
        } else {
          await createSubOrder(formItem);
        }
      }
  
      messageApi.success(language.successQuery);
  
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => ({
          ...prevState,
          optionsAdditionalSend: true
        }));
      }
    } catch (error) {
      messageApi.error(language.errorQuery);
    }
  };
  
  const createSubOrder = async (item) => {
    try {
      const { title, price } = item;
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
              title: String(title),
              price: Number(price),
              basicPrice: Number(price),
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
  
      const createdOptionSuborder = response.data.data.createOptionSuborder.data;
      await updateOptionSuborder(createdOptionSuborder, item, false);
    } catch (error) {
      console.error('Error creating option suborder:', error);
    }
  };

  const deleteSubOrder = async (optionId, option) => {
    const optionSuborder = optionsSuborderData.find(suborder => suborder.id === optionId);

    if (optionSuborder) {
      try {
        await updateOptionSuborder(optionSuborder, option, true)
        await axios.post(
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

        messageApi.success(language.successQuery);

      } catch (error) {
        console.error('Error deleting option suborder:', error);
      }
    }
  };

  const updateOptionSuborder = async (updateOptionSuborderId, option, remove) => {
    try {
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
              custom: true,
              title: option.title,
              price: remove ? 0 :Number(option.price),
              basicPrice: remove ? 0 :Number(option.price),
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
  
    } catch (error) {
      console.error('Error updating option suborder:', error);
    }
  };
  
  useEffect(()=> {
    fetchOrderData()
    console.log('go')
  },[trigger]);


   useEffect(() => {
    form.setFieldsValue({
      items: items.map((item, index) => ({
        ...item,
        key: index,
      })),
    });
  }, [items, form]);


  return (
    <Card style={{ background: '#F8F8F8', borderColor: '#DCDCDC' }}>
      <Form form={form} name="dynamic_form_nest_item" onFinish={handleFormSubmit}>
      {contextHolder}

        <Affix style={{ position: 'absolute', top: '20px', right: '20px'}} offsetTop={20}>
          <Button style={{backgroundColor: '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
            {`${language.submit} ${language.options}`}
          </Button>
        </Affix>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Space
                  key={key}
                  style={{
                    display: 'flex',
                    marginBottom: 8,
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'title']}
                    label="Title"
                    rules={[
                      {
                        required: true,
                        message: 'Please input title!',
                      },
                    ]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'price']}
                    label="Price"
                    rules={[
                      {
                        required: true,
                        message: 'Please input price!',
                      },
                    ]}
                  >
                    <InputNumber placeholder="Price" />
                  </Form.Item>
                  <Button 
                    danger 
                    onClick={() => {
                      handleRemoveItem(key);
                      if (fields.length !== items.length ) {
                        remove(name);
                      }
                    }} icon={<MinusCircleOutlined />} />

                  <Modal
                    title={`${language.removeData} ${user.username}?`}
                    open={modalVisible}
                    // onOk={handleDeleteConfirmed}
                    onOk={() => {
                      handleDeleteConfirmed();
                      // remove(key)
                    }}
                    // onCancel={() => setModalVisible(false)}
                    onCancel={() => {
                      setModalVisible(false);
                    }}
                  >
                    <p>{language.undone}</p>
                  </Modal>

                </Space>
              ))}
              <Form.Item>
                <Button type="primary" onClick={() => add()} icon={<PlusCircleOutlined />}>
                  {language.addOption}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Card>
  );
};

export default OptionsAdditionalStep;

