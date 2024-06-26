import React, { useState, useEffect, useRef } from 'react';
import {Descriptions} from 'antd';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';


export const OrderDescriptionFactory = ({
  orderData, orderId, frameData, doorData, elementData, lockData, hingeData, knobeData, optionsData, isCreatingPdf, orderName, currancyValue, slidingData
}) => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];  
  const [currency, setCurrency] = useState('EUR');
  const [convertedDoorPrice, setConvertedDoorPrice] = useState(null);
  const [convertedFramePrice, setConvertedFramePrice] = useState(null);
  const [convertedKnobePrice, setConvertedKnobePrice] = useState(null);
  const [convertedLockPrice, setConvertedLockPrice] = useState(null);
  const [convertedHingePrice, setConvertedHingePrice] = useState(null);
  const [convertedOptionPrice, setConvertedOptionPrice] = useState([]);
  const [convertedElementPrice, setConvertedElementPrice] = useState([]);
  const [convertedPriceTotal, setConvertedPriceTotal] = useState('');
  const [exchangeRates, setExchangeRates] = useState(null);

  const [convertedSlidingPrice, setConvertedSlidingPrice] = useState(null);

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
  
    const convertedDoorPrice = convertCurrency(doorData.basicPrice, value);
    const convertedFramePrice = convertCurrency(frameData.basicPrice, value);
    const convertedKnobePrice = convertCurrency(knobeData.basicPrice, value);
    const convertedHingePrice = convertCurrency(hingeData.basicPrice, value);
    const convertedLockPrice = convertCurrency(lockData.basicPrice, value);
    
    const convertedSlidingPrice = convertCurrency(slidingData?.attributes.basicPrice, value);

    const convertedElementPrice = elementData.map((element) => {
      const updatedPrice = convertCurrency(element.basicPrice, value);
      return { ...element, convertedPrice: updatedPrice };
    });

    const convertedOptionPrice = optionsData.map((option) => {
      const updatedPrice = convertCurrency(option.basicPrice, value);
      return { ...option, convertedPrice: updatedPrice };
    });

    const convertedPriceTotal = convertCurrency(orderData.basicTotalCost, value);
  
    setConvertedDoorPrice(convertedDoorPrice);
    setConvertedFramePrice(convertedFramePrice);
    setConvertedKnobePrice(convertedKnobePrice);
    setConvertedHingePrice(convertedHingePrice);
    setConvertedLockPrice(convertedLockPrice);
    setConvertedElementPrice(convertedElementPrice)
    setConvertedOptionPrice(convertedOptionPrice)
    setConvertedPriceTotal(convertedPriceTotal);

    setConvertedSlidingPrice(convertedSlidingPrice);
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

      {/* HEADER */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        <h2> {language.subOrder} # {orderName} </h2>
      {/* DOOR DETAILS */}
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.door}
        </p>
        
        <Descriptions
          column={4}
          layout="vertical"
          bordered
          size={isCreatingPdf ? 'small' : 'default'}
        >
          {doorData && (
          <>
            <Descriptions.Item label={language.collection} labelStyle={{fontWeight: '600', color:'#000'}}>
            {doorData.door?.data?.attributes?.collection}
            </Descriptions.Item>

            <Descriptions.Item label={`${language.product} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {doorData.door?.data?.attributes?.product_properties?.title}
            </Descriptions.Item>

            <Descriptions.Item label={language.doubleDoor} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.double_door ? language.yes : language.no}
            </Descriptions.Item>

            <Descriptions.Item label={language.hidden} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.hidden ? language.yes : language.no}
            </Descriptions.Item>

            <Descriptions.Item label={language.opening} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.opening}
            </Descriptions.Item>

            <Descriptions.Item label={language.side} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.side}
            </Descriptions.Item>

            <Descriptions.Item label={language.height} labelStyle={{fontWeight: '600', color:'#000'}}>
              {`${doorData.sizes.height} mm`}
              </Descriptions.Item>

            <Descriptions.Item label={language.width} labelStyle={{fontWeight: '600', color:'#000'}}>
            {`${doorData.sizes.width} mm`}
            </Descriptions.Item>

            <Descriptions.Item label={language.thickness} labelStyle={{fontWeight: '600', color:'#000'}}>
            {`${doorData.sizes.thickness} mm`}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.decor} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {doorData.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp;
              {doorData.decor?.data?.attributes?.title}

            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.decor} ${language.type}`}labelStyle={{fontWeight: '600', color:'#000'}} >
              {doorData.decor?.data?.attributes?.type}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedDoorPrice ? `${convertedDoorPrice} ${currency}` : `${doorData.basicPrice} ${orderData?.currency}`}
            </Descriptions.Item>
          </>
          )}
        </Descriptions>
      </div>

      {/* FRAME AND FITTING DETAILS */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.frame} / {language.sliding} & {language.fitting} 
        </p>

        <Descriptions
          column={3}
          layout="vertical"
          bordered
          size={isCreatingPdf ? 'small' : 'default'}
          >
  
          {frameData && frameData.frame?.data?.attributes?.title 
            && !frameData.frame?.data?.attributes?.title?.includes('sliding') && (
          <>
            <Descriptions.Item className='labelBG' span={2} label={`${language.frame} ${language.type}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {languageMap[selectedLanguage][frameData.frame?.data?.attributes?.title]} <br/>
              {frameData.threshold ? ` + ${language.threshold}` : ``}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.frame} ${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedFramePrice ? `${convertedFramePrice} ${currency}` : `${frameData.basicPrice} ${orderData?.currency}`}
            </Descriptions.Item>
            </>
          )}

          {slidingData && slidingData?.attributes?.sliding.data?.attributes?.title && (
            <>
              <Descriptions.Item span={3} className='labelBG' label={`${language.sliding} ${language.description}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                {/* {languageMap[selectedLanguage][frameData.frame?.data?.attributes?.title]} */}
                <div style={{textAlign: 'left'}}>
                <span style={{fontWeight: 600}}>{language.title}</span> : {slidingData?.attributes?.sliding.data?.attributes?.title} <br/>
                <span style={{fontWeight: 600}}>{language.description}</span>: {slidingData?.attributes?.sliding.data?.attributes?.description[0]?.children[0]?.text} <br/>
                <span style={{fontWeight: 600}}>{language.articul}</span> : {slidingData?.attributes?.sliding.data?.attributes?.fittingsArticle} <br/>
                </div>
              </Descriptions.Item>

              <Descriptions.Item className='labelBG' label={`${language.sliding} ${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedSlidingPrice ? `${convertedSlidingPrice} ${currency}` : `${slidingData?.attributes.basicPrice} ${orderData?.currency}`}
              </Descriptions.Item>
            </>
          )}

          {lockData && lockData?.lock?.data?.attributes?.title && (
            <>
            <Descriptions.Item className='labelBG' span={2} label={language.lock} labelStyle={{fontWeight: '600', color:'#000'}}>
              {lockData?.lock?.data?.attributes?.title} ({lockData?.lock?.data?.attributes?.brand})
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedLockPrice ? `${convertedLockPrice} ${currency}` : `${lockData.basicPrice} ${orderData?.currency}`} 
            </Descriptions.Item>
            </>
          )}

          {hingeData && hingeData?.hinge?.data?.attributes?.title && (
            <>
            <Descriptions.Item className='labelBG' span={2} label={language.hinges} labelStyle={{fontWeight: '600', color:'#000'}}>
              {hingeData?.hinge?.data?.attributes?.title} ({hingeData?.hinge?.data?.attributes?.brand})
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedHingePrice ? `${convertedHingePrice} ${currency}` : `${hingeData.basicPrice} ${orderData?.currency}`} / {language.amount}: {hingeData?.amount}
            </Descriptions.Item>
          </>
          )}
          </Descriptions>
      </div>

      {/* ELEMENTS */}
       {elementData && elementData.length > 0 && (
        <>
          <div id='nextpage'></div>
          <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
              
            {elementData && elementData.map((element, index) => (
              <React.Fragment key={index}>

              <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
                {`${language.additional} ${language.element} # ${index + 1}`} 
              </p>
              
              <Descriptions
                key={index}
                column={5}
                layout="vertical"
                bordered
                style={{margin: '10px 0'}}
                size={isCreatingPdf ? 'small' : 'default'}
              >
                <Descriptions.Item className='labelBG' label={`${language.element} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {languageMap[selectedLanguage][element.type]}: {languageMap[selectedLanguage][element.element?.data?.attributes?.title]}
                </Descriptions.Item>

                {element?.sizes?.height && (
                  <Descriptions.Item className='labelBG' label={language.height} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${element?.sizes?.height} mm`}
                  </Descriptions.Item>
                )}

                {element?.sizes?.width && (
                  <Descriptions.Item className='labelBG' label={language.width} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${element?.sizes?.width} mm`}
                  </Descriptions.Item>
                )}

                {element?.sizes?.thickness && (
                  <Descriptions.Item className='labelBG' label={language.thickness} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${element?.sizes?.thickness} mm`}
                  </Descriptions.Item>
                )}

                {element?.sizes?.length && (
                  <Descriptions.Item span={3} className='labelBG' label="Lenght" labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${element?.sizes?.length} mm`}
                  </Descriptions.Item>
                )}

                <Descriptions.Item className='labelBG' label={language.amount} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {element?.amount}
                </Descriptions.Item>

                {element.decor?.data?.attributes && (
                  <>
                    <Descriptions.Item className='labelBG' label={`${language.decor}`} span={2} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {element.decor?.data?.attributes?.type} : {element.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp;
                      {element.decor?.data?.attributes?.title}
                    </Descriptions.Item>
                  </>
                )}

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {convertedElementPrice[index] ? `${convertedElementPrice[index].convertedPrice} ${currency}` : `${element.basicPrice} ${orderData?.currency}`}
                </Descriptions.Item>
              </Descriptions>
              </React.Fragment>
              ))}
          </div>
        </>
       )}

      {/* OPTIONS */}
      {optionsData && optionsData.length > 0 && (
        <>
              <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.subOrder} {language.options}
        </p>

        <Descriptions
          column={2}
          layout="vertical"
          bordered
          size={isCreatingPdf ? 'small' : 'default'}
          >
            {optionsData && optionsData.length > 0 && optionsData.map((option, index) => (
              <React.Fragment key={index}>

                <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {languageMap[selectedLanguage][option.title] ? languageMap[selectedLanguage][option.title] : option.title}
                </Descriptions.Item>

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {convertedOptionPrice[index] ? `${convertedOptionPrice[index].convertedPrice} ${currency}` : `${option.basicPrice ? option.basicPrice: option.price} ${orderData?.currency}`}
                </Descriptions.Item>
              </React.Fragment>
            ))}

              {orderData?.horizontal_veneer && (
                <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {orderData?.horizontal_veneer ? language.horizontalVeneer : ''}
                </Descriptions.Item>
              )}

              {orderData?.super_gloss && (
                <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
                   {orderData?.horizontal_veneer ? language.superGloss : ''}
                </Descriptions.Item>
              )}
          </Descriptions>
      </div>
        </>
      )}

      {/* TOTALCOST */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.cost} {language.subOrder} # {orderName} 
        </p>

        <Descriptions
          bordered
          size={isCreatingPdf ? 'small' : 'default'}
          >
            <Descriptions.Item>
              {convertedPriceTotal ? `${convertedPriceTotal} ${currency}` : `${orderData?.basicTotalCost} ${orderData?.currency}`}
            </Descriptions.Item>

          </Descriptions>
    </div>

  </div>
  );
};
