import React, { useEffect, useState } from 'react';
import { Drawer, Badge, Button, List } from 'antd';
import { useErrors } from '../Context/ErrorsOrderContext';
import {getOrderErrors } from '../api/validationOrder';
import { useOrder } from '../Context/OrderContext';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';

const ErrorDrawer = () => {
  const [visible, setVisible] = useState(false);
  const { errors, setErrorArray } = useErrors();
  const jwtToken = localStorage.getItem('token');
  const { orderId } = useOrder();
  const orderIdToUse = orderId;
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleUpdateError = async () => {
    try {
      const newErrors = await getOrderErrors(jwtToken, orderIdToUse);
      setErrorArray(newErrors);
    } catch (error) {
      console.error('Error fetching errors:', error);
    }
  };

  useEffect(() => {
    handleUpdateError();
  }, [])

  useEffect(() => {
    document.addEventListener('updateError', handleUpdateError);
    
    return () => {
      document.removeEventListener('updateError', handleUpdateError);
    };
  }, [jwtToken, orderIdToUse, setErrorArray]);

  return (
    <>
      <Badge count={errors?.length || 'O'}>
        <Button type="primary" danger onClick={showDrawer}>
          {language.err}
        </Button>
      </Badge>
      <Drawer
        title={language.errList}
        placement="right"
        closable={false}
        onClose={onClose}
        open={visible}
        // size={'large'}
      >
        <List
          size="small"
          footer=' '
          dataSource={errors}
          renderItem={(error, index) => (
            <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{display: 'flex', gap: '10px'}}>
                <span style={{ fontWeight: 'bold', marginRight: '8px', color: '#ed5249' }}>
                  {index + 1}.
                </span>
                <span >{languageMap[selectedLanguage][error]}</span>
              </div>

            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};

export default ErrorDrawer;
