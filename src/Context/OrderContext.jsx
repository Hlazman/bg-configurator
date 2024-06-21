import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
const [orderId, setOrderId] = useState('');
const [dorSuborderId, setDoorSuborderId] = useState('');;
const [frameSuborderId, setFrameSuborderId] = useState('');
const [hingeSuborderId, sethiHgeSuborderId] = useState('');
const [knobeSuborderId, setKnobeSuborderId] = useState('');
const [lockSuborderId, setLockSuborderId] = useState('');
const [slidingSuborderId, setSlidingSuborderId] = useState('');

// Options
const [optionsData, setOptionsData] = useState([]);
const [optionsSuborderData, setOptionsSuborderData] = useState([]);
const [notValidOptions, setNotValidOptions] = useState([]);

// Sliding disabled
const [isSliding, setIsSliding] = useState(true);

  return (
    <OrderContext.Provider value={
      { orderId, setOrderId, 
        dorSuborderId, setDoorSuborderId, 
        frameSuborderId, setFrameSuborderId, 
        hingeSuborderId, sethiHgeSuborderId,
        knobeSuborderId, setKnobeSuborderId,
        lockSuborderId, setLockSuborderId,

        optionsData, setOptionsData,
        optionsSuborderData, setOptionsSuborderData,
        notValidOptions, setNotValidOptions,

        isSliding, setIsSliding,
        slidingSuborderId, setSlidingSuborderId,
      }
      }>
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
