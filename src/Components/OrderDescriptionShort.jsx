import React, { useState, useEffect, useRef } from 'react';
import {Descriptions} from 'antd';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';


export const OrderDescriptionShort = ({
  orderData, orderId, frameData, doorData, elementData, lockData, hingeData, knobeData, optionsData, 
  isCreatingPdf, orderName, currancyValue, imageIndex
}) => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  
  const [currency, setCurrency] = useState('EUR');
  const [convertedPriceTotal, setConvertedPriceTotal] = useState('');
  const [exchangeRates, setExchangeRates] = useState(null);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };
  
  const convertCurrency = (price, selectedCurrency) => {
    if (!exchangeRates || !selectedCurrency || !price) {
      return null;
    }
  
    const euroPrice = price / exchangeRates['EUR'];
    const convertedPrice = euroPrice * exchangeRates[selectedCurrency];
  
    return Math.ceil(convertedPrice);
  };
  
  const handleCurrencyChange = async (value) => {
    setCurrency(value);

    const convertedPriceTotal = convertCurrency(orderData.price, value);
    setConvertedPriceTotal(convertedPriceTotal);
  };

  const prevCurrencyValue = useRef(currancyValue);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (prevCurrencyValue.current !== currancyValue) {
      handleCurrencyChange(currancyValue);
      prevCurrencyValue.current = currancyValue;
    }
  }, [currancyValue]);

    if (!orderData) {
    return null;
  }

  return (
    <div style={{maxWidth: isCreatingPdf ? 'auto' : '900px', margin: '0 auto'}}>
      <div style={{padding: '5px', backgroundColor: '#FFF'}}>
        {imageIndex === 0 && (
          <Descriptions
            column={4}
            layout="vertical"
            bordered
            size={isCreatingPdf ? 'small' : 'default'}
          >
          {doorData && (
          <>
            <Descriptions.Item 
              span={4} 
              style={{ width: isCreatingPdf ? '55%' : '60%'}} 
              className='labelNone'
            >
            <div>
              <img 
                src={`https://api.boki.fortesting.com.ua${doorData.door?.data?.attributes?.product_properties?.image?.data?.attributes?.url}`} 
                alt="Product"
                style={{width: '100%'}}
                  />
            </div>
          </Descriptions.Item>
          </>
          )}
      </Descriptions>
        )}

        <Descriptions
          column={4}
          layout="vertical"
          bordered
          size={isCreatingPdf ? 'small' : 'default'}
          style={{ marginTop: '20px'}} 
        >
          {doorData && (
          <>
            <Descriptions.Item label={'№'} labelStyle={{fontWeight: '600', color:'#000'}}>
              {++imageIndex}
            </Descriptions.Item>

            <Descriptions.Item label={language.order} labelStyle={{fontWeight: '600', color:'#000'}}>
              <h4> {language.order} # {orderName} </h4>
            </Descriptions.Item>

            <Descriptions.Item label={`${language.product} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {doorData.door?.data?.attributes?.product_properties?.title}
            </Descriptions.Item>

            <Descriptions.Item label={`${language.cost}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedPriceTotal ? `${convertedPriceTotal} ${currency}` : `${orderData?.totalCost} ${orderData?.currency}`}
            </Descriptions.Item>
          </>
          )}
        </Descriptions>
      </div>
  </div>
  );
};
