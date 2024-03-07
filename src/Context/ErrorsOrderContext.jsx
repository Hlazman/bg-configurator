import React, { createContext, useState, useContext } from 'react';

const ErrorsOrderContext = createContext();

const ErrorsProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const setErrorArray = (errorArray) => {
    setErrors(errorArray);
  };

  return (
    <ErrorsOrderContext.Provider value={{ errors, setErrorArray }}>
      {children}
    </ErrorsOrderContext.Provider>
  );
};

const useErrors = () => useContext(ErrorsOrderContext);

export { ErrorsProvider, useErrors };

