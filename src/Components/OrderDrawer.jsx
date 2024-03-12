import React, { useState } from 'react';
import { Button, Drawer, Space } from 'antd';
import { OrderDetailsPage } from '../Pages/OrderDetailsPage';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';


export const OrderDrawer = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [open, setOpen] = useState(false);
  // const [size, setSize] = useState();
  
  
  
  const showLargeDrawer = () => {
    // setSize('large');
    setOpen(true);
    localStorage.setItem('presentation', 'singleOrder');
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Space>
        <Button type="primary" onClick={showLargeDrawer}>
          {language.orderDetails}
        </Button>
      </Space>
      
      <Drawer
        destroyOnClose={true}
        title={language.orderDetails}
        placement="right"
        // size={size}
        width="870px"
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>{language.cancel}</Button>
            <Button type="primary" onClick={onClose}>{language.ok}</Button>
          </Space>
        }
      >
        <OrderDetailsPage />
      </Drawer>
    </>
  );
};