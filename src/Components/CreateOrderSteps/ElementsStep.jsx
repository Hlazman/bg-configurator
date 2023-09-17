import React, { useRef, useState, useEffect } from 'react';
import { Tabs, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import DecorElementForm from '../Forms/DecorElementForm';

const ElementsStep = ({language, orderID}) => {
  const jwtToken = localStorage.getItem('token');
  const { order } = useOrder();
  const orderId = order.id;
  const orderIdToUse = orderID || orderId;
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const [decorDataId, setDecorDataId] = useState(null);

  const [elementID, setElementID] = useState(null);

  useEffect(() => {
    const fetchElementSuborders = async () => {
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
              const newActiveKey = `Element ${1 + newTabIndex.current++}`;

              return {
                // label: newActiveKey,
                label: data.id,
                children: (<DecorElementForm onFinish={onFinish} elementID={data.id}/>),
                key: newActiveKey,
              };
            });
            setItems(newItems);
            setActiveKey(newItems[0].key);
          } else if (orderData.length < 1) {
            add();
          }
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
        'https://api.boki.fortesting.com.ua/graphql',
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

  const onFinish = () => {
  };

  const [items, setItems] = useState([]);
  const [activeKey, setActiveKey] = useState(0);
  const newTabIndex = useRef(0);
  
  // const getSuborderIDFromLabel = (label) => {
  //   const match = label.match(/Element id# (\d+)/);
  //   return match ? match[1] : null;
  // };

  // const getCurrentElementID = () => {
  //   const currentItem = items.find(item => item.key === activeKey);
  //   if (currentItem) {
  //     const label = currentItem.label;
  //     return getSuborderIDFromLabel(label);
  //   }
  //   return null;
  // };

  //     const elID = () => {
  //     const currentElementID = getCurrentElementID();
  //     console.log('Current Element ID:', currentElementID);
  //   };

  //   elID();

  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
  };

  const add = async () => {
    const suborderId = await createElementSuborder();
    const newActiveKey = `Element ${1 + newTabIndex.current++}`;
    const newPanes = [...items];
    newPanes.push({
      // label: newActiveKey,
      // label: suborderId,
      label: `Element id# ${suborderId}`,
      children: (<DecorElementForm onFinish={onFinish} elementID={suborderId}/>),
      key: newActiveKey,
    });
    setItems(newPanes);
    setActiveKey(newActiveKey);
  };


  const remove = (targetKey) => {
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
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else {
      remove(targetKey);
    }
  };

  return (
    <Tabs
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
    />
  );
};

export default ElementsStep;
