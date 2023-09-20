// import React, { createContext, useContext, useState } from 'react';

// const OrderContext = createContext();

// export const OrderProvider = ({ children }) => {
//   const [order, setOrder] = useState({
//     id: null,
//     suborders: [],
//   });

// const [editOrderId, setEditOrderId] = useState('');

//   const addOrder = (newOrder) => {
//     setOrder(prevOrder => ({
//       ...prevOrder,
//       id: newOrder.id,
//     }));
//   };

//   const addSuborder = (name, id) => {
//     setOrder(prevOrder => ({
//       ...prevOrder,
//       suborders: [...prevOrder.suborders, { name, data: { id } }],
//     }));
//   };


//   return (
//     // <OrderContext.Provider value={{ order, addOrder, addSuborder}}>
//     <OrderContext.Provider value={{ order, addOrder, addSuborder, editOrderId, setEditOrderId}}>
//       {children}
//     </OrderContext.Provider>
//   );
// };

// export const useOrder = () => {
//   const context = useContext(OrderContext);
//   if (!context) {
//     throw new Error('useOrder must be used within an OrderProvider');
//   }
//   return context;
// };


import React, { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  
  // const [order, setOrder] = useState('');
  const [orderId, setOrderId] = useState('');

const [dorSuborderId, setDoorSuborderId] = useState('');;

const [frameSuborderId, setFrameSuborderId] = useState('');

const [hingeSuborderId, sethiHgeSuborderId] = useState('');

const [knobeSuborderId, setKnobeSuborderId] = useState('');

const [lockSuborderId, setLockSuborderId] = useState('');


  return (
    // <OrderContext.Provider value={{ order, addOrder, addSuborder}}>
    <OrderContext.Provider value={
      { orderId, setOrderId, 
        dorSuborderId, setDoorSuborderId, 
        frameSuborderId, setFrameSuborderId, 
        hingeSuborderId, sethiHgeSuborderId,
        knobeSuborderId, setKnobeSuborderId,
        lockSuborderId, setLockSuborderId,
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
