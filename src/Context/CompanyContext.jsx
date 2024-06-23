import React, { createContext, useState, useContext } from 'react';

export const SelectedCompanyContext = createContext();

export const SelectedCompanyProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState(0);

  return (
    <SelectedCompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </SelectedCompanyContext.Provider>
  );
};

export const useSelectedCompany = () => {
  const context = useContext(SelectedCompanyContext);
  if (!context) {
    throw new Error('useSelectedCompany must be used within a SelectedCompanyProvider');
  }
  return context;
};
