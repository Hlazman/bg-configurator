import React, { useRef, useState, useEffect } from 'react';
import { Tabs, Button } from 'antd';
import axios from 'axios';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import DecorElementForm from '../Forms/DecorElementForm';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'

const ElementsStep = ({ setCurrentStepSend, currentStepSend }) => {
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { orderId } = useOrder();
  const orderIdToUse = orderId;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchElementSuborders = async () => {
      try {
        if (!orderIdToUse) return;

        const response = await axios.post(
          // 'https://api.boki.fortesting.com.ua/graphql',
          queryLink,
          {
            query: `
              query Query($orderId: ID) {
                order(id: $orderId) {
                  data {
                    attributes {
                      element_suborders {
                        data {
                          id
                        }
                      }
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

        if (response.data.data && response.data.data.order) {
          const orderData = response.data.data.order.data.attributes.element_suborders.data;
          if (orderData && orderData.length > 0) {
            const newItems = orderData.map((data, index) => {
              const newActiveKey = `${language.element} ${1 + newTabIndex.current++}`;

              return {
                label: newActiveKey,
                elemID: data.id,
                children: (<DecorElementForm elementID={data.id} setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend }/>),
                key: newActiveKey,
              };
            });
            setItems(newItems);
            setActiveKey(newItems[0].key);
          }
          // } else if (orderData.length < 1) {
            // add();
          // }
        } 
      } catch (error) {
        console.error('Error fetching order data:', error);
      }
    };

    fetchElementSuborders();
  }, [orderIdToUse, jwtToken]); 
    

  const createElementSuborder = async () => {
    try {
      const response = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
        {
          query: `
            mutation Mutation($data: ElementSuborderInput!) {
              createElementSuborder(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {
              order: orderIdToUse
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          }
        }
      );
      return response.data.data.createElementSuborder.data.id;
    } catch (error) {
      console.error('Error creating suborder:', error);
      return null;
    }
  };

  const [items, setItems] = useState([]);
  const [activeKey, setActiveKey] = useState(0);
  const newTabIndex = useRef(0);
  

  const getCurrentElementID = () => {
    const currentItem = items.find(item => item.key === activeKey);
    if (currentItem) {
      const currentElementID = currentItem.elemID;
      return currentElementID;
    }
    return null;
  };

  const deleteElementSuborder = async () => {
    const currentElementID = getCurrentElementID();
  
    try {
      // const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
      const response = await axios.post(queryLink, {
        query: `
          mutation DeleteElementSuborder($deleteElementSuborderId: ID!) {
            deleteElementSuborder(id: $deleteElementSuborderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          "deleteElementSuborderId": currentElementID
        }
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });
  
      console.log('Deleted success', response.data);
    } catch (error) {
      console.error('Delete Error', error);
    }
  }

  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);

    setItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        closable: item.key === newActiveKey
      }))
    );
  };

  const add = async () => {
    setIsLoading(true);
    const suborderId = await createElementSuborder();
    // const newActiveKey = `${language.element} ${1 + newTabIndex.current++}`;
    const newActiveKey = `${language.element} ${++newTabIndex.current}`;
    const newPanes = [...items];
    newPanes.push({
      label: newActiveKey,
      elemID: suborderId,
      children: (<DecorElementForm elementID={suborderId} setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend }/>),
      key: newActiveKey,
      closable: false,
    });

    setItems(newPanes);
    onChange(newActiveKey)
    setIsLoading(false)
  };


  const remove = (targetKey) => {
    setIsLoading(true);
    deleteElementSuborder();

    let newActiveKey = activeKey;
    let lastIndex = -1;
    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = items.filter((item) => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setItems(newPanes);
    onChange(newActiveKey)
    setIsLoading(false)
  };

  const onEdit = async (targetKey, action) => {
    if (isLoading) {
      return; 
    }
    setIsLoading(true);

    if (action === 'add') {
      await add();
    } else {
      await remove(targetKey);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* <Button type="primary" onClick={() => add()} icon={<PlusCircleOutlined />}> */}
      <Button type="primary" onClick={add} icon={<PlusCircleOutlined />}>
        {language.addElement}
      </Button>

      <Tabs
        type="editable-card"
        onChange={onChange}
        activeKey={activeKey}
        onEdit={onEdit}
        items={items}
        hideAdd
      />
    </>

  );
};

export default ElementsStep;
