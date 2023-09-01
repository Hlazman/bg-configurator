import React, { createContext, useContext, useState } from 'react';

const ProductVariantContext = createContext();

export function useProductVariant() {
  return useContext(ProductVariantContext);
}

export function ProductVariantProvider({ children }) {
  const [productVariantId, setProductVariantId] = useState(null);

  const updateProductVariantId = (newId) => {
    setProductVariantId(newId);
  };

  return (
    <ProductVariantContext.Provider value={{ productVariantId, updateProductVariantId }}>
      {children}
    </ProductVariantContext.Provider>
  );
}
