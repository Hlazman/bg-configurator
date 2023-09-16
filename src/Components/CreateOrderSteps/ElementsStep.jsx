import React, { useRef, useState, useEffect } from 'react';
// import { Tabs, Form, Input, Button, Select, InputNumber, Spin } from 'antd';
import { Tabs, Spin } from 'antd';
import GroupDecorElementStep from './GroupDecorElementStep';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import DecorElementForm from '../Forms/DecorElementForm';


// const { Option } = Select;

const ElementsStep = ({language, orderID}) => {
  const jwtToken = localStorage.getItem('token');
  const { order } = useOrder();
  const orderId = order.id;
  const orderIdToUse = orderID || orderId;
  const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const [decorDataId, setDecorDataId] = useState(null);
  // const [isloading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   axios.post(
  //     'https://api.boki.fortesting.com.ua/graphql',
  //     {
  //       query: `
  //         query Query($doorSuborderId: ID) {
  //           doorSuborder(id: $doorSuborderId) {
  //             data {
  //               attributes {
  //                 decor {
  //                   data {
  //                     id
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       `,
  //       variables: {
  //         doorSuborderId: doorSuborder.data.id,
  //       },
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${jwtToken}`,
  //       },
  //     }
  //   )
  //   .then(response => {
  //     setDecorDataId(response.data.data.doorSuborder.data.attributes.decor.data);
  //   })
  //   .catch(error => {
  //     console.error('Error fetching decor data:', error);
  //   });
  // }, [jwtToken, doorSuborder.data.id]);


  const onFinish = () => {
  };
  
  const initialItems = [
    {
      label: "Element 1",
      children: (<DecorElementForm onFinish={onFinish}/>),
      key: '1',
    },
  ];

  const [activeKey, setActiveKey] = useState(initialItems[0].key);
  const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);

  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
  };

  const add = () => {
    const newActiveKey = `Element${newTabIndex.current++}`;
    const newPanes = [...items];
    newPanes.push({
      label: newActiveKey,
      children: (<DecorElementForm onFinish={onFinish}/>),
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
    // <Spin spinning={isloading}>
    <Tabs
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
    />
  // </Spin>
  );
};

export default ElementsStep;
