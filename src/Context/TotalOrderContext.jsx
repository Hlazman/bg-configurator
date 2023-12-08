import React, { createContext, useContext, useState } from 'react';

const TotalOrderContext = createContext();

export const TotalOrderProvider = ({ children }) => {
const [totalOrderId, setTotalOrderId] = useState('');


  return (
    <TotalOrderContext.Provider value={{ totalOrderId, setTotalOrderId}}>
      {children}
    </TotalOrderContext.Provider>
  );
};

export const useTotalOrder = () => {
  const context = useContext(TotalOrderContext);
  if (!context) {
    throw new Error('useTotalOrder must be used within an TotalOrderProvider');
  }
  return context;
};
