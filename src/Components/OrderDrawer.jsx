import React, { useState } from 'react';
import { Button, Drawer, Space } from 'antd';
import { OrderDetailsPage } from '../Pages/OrderDetailsPage';

export const OrderDrawer = () => {
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
        destroyOnClose={true}
        title="Order details"
        placement="right"
        size={size}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onClose}>OK</Button>
          </Space>
        }
      >
        <OrderDetailsPage />
      </Drawer>
    </>
  );
};