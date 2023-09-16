import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState({
    id: null,
    suborders: [],
  });


  const addOrder = (newOrder) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      id: newOrder.id,
    }));
  };

  const addSuborder = (name, id) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      suborders: [...prevOrder.suborders, { name, data: { id } }],
    }));
  };

  return (
    <OrderContext.Provider value={{ order, addOrder, addSuborder}}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
