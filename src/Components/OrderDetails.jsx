import React, { useState } from 'react';
import { Button, Drawer, Space } from 'antd';

export const OrderDetails = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  
  const showLargeDrawer = () => {
    setSize('large');
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Space>
        <Button type="primary" onClick={showLargeDrawer}>
          Order Details
        </Button>
      </Space>
      
      <Drawer
        title="Order details"
        placement="right"
        size={size}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onClose}>
              OK
            </Button>
          </Space>
        }
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};