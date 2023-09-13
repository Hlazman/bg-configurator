import React, { useRef, useState } from 'react';
import { Tabs, Form, Input, Button } from 'antd';
import GroupDecorStep from './GroupDecorStep';


const ElementsStep = ({formData, handleCardClick, handleNext, language}) => {
  const [form] = Form.useForm();
  const onFinish = () => {
  };
  
  const initialItems = [
    {
      label: "Element 1",
      children: (
        <Form form={form} onFinish={onFinish} > 
          <div style={{ display: 'flex', gap: '30px', padding: '10px 25px' }}>
            
            <Form.Item name="name" style={{ width: '100%' }} >
              <Input addonBefore="Name"/>
            </Form.Item>

            <Form.Item name="width" style={{ width: '100%' }} >
              <Input addonBefore="Width" addonAfter="mm"/>
            </Form.Item>
            
            <Form.Item name="height" style={{ width: '100%' }} >
              <Input addonBefore="Height" addonAfter="mm"/>
            </Form.Item>
            
            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>

          </div>

        <div style={{padding: '0 25px' }}>
          <GroupDecorStep
              formData={formData}
              handleCardClick={handleCardClick}
              handleNext={handleNext}
              language={language}
            />
        </div>

        </Form>
      ),
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
      label: `Element new`,
      children: (
        <Form form={form} onFinish={onFinish} > 
          <div style={{ display: 'flex', gap: '30px', padding: '10px 25px' }}>
            
            <Form.Item name="name" style={{ width: '100%' }} >
              <Input addonBefore="Name"/>
            </Form.Item>

            <Form.Item name="width" style={{ width: '100%' }} >
              <Input addonBefore="Width"/>
            </Form.Item>
            
            <Form.Item name="height" style={{ width: '100%' }} >
              <Input addonBefore="Height"/>
            </Form.Item>
            
            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>

          </div>

        <div style={{padding: '0 25px' }}>
          <GroupDecorStep
              formData={formData}
              handleCardClick={handleCardClick}
              handleNext={handleNext}
              language={language}
            />
        </div>

        </Form>
      ),
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
      // tabPosition="left"
    />
  );
};

export default ElementsStep;
