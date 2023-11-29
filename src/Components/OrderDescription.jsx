import React, { useState, useContext, useEffect } from 'react';
import {Descriptions, Image, Divider, Card, Select, Space, Alert} from 'antd';
import dayjs from 'dayjs';
import { AuthContext } from '../Context/AuthContext';
import logo from '../logo.svg';
import bg from '../bg.svg';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';


export const OrderDescription = (
  {orderData, orderId, frameData, doorData, elementData, lockData, hingeData, knobeData, optionsData, isCreatingPdf}
  ) => {
  const { user } = useContext(AuthContext);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const { Option } = Select;
  
  const [currency, setCurrency] = useState('EUR');
  const [convertedDoorPrice, setConvertedDoorPrice] = useState(null);
  const [convertedFramePrice, setConvertedFramePrice] = useState(null);
  const [convertedKnobePrice, setConvertedKnobePrice] = useState(null);
  const [convertedLockPrice, setConvertedLockPrice] = useState(null);
  const [convertedHingePrice, setConvertedHingePrice] = useState(null);
  const [convertedOptionPrice, setConvertedOptionPrice] = useState([]);
  const [convertedElementPrice, setConvertedElementPrice] = useState([]);
  const [convertedPriceNOTax, setConvertedPriceNOTax] = useState('');
  const [convertedPriceWithTax, setConvertedPriceWithTax] = useState('');
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
  
  useEffect(() => {
    fetchExchangeRates();
  }, []);
  
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
  
    const convertedDoorPrice = convertCurrency(doorData.price, value);
    const convertedFramePrice = convertCurrency(frameData.price, value);
    const convertedKnobePrice = convertCurrency(knobeData.price, value);
    const convertedHingePrice = convertCurrency(hingeData.price, value);
    const convertedLockPrice = convertCurrency(lockData.price, value);
    
    const convertedElementPrice = elementData.map((element) => {
      const updatedPrice = convertCurrency(element.price, value);
      return { ...element, convertedPrice: updatedPrice };
    });

    const convertedOptionPrice = optionsData.map((option) => {
      const updatedPrice = convertCurrency(option.price, value);
      return { ...option, convertedPrice: updatedPrice };
    });

    const convertedPriceNOTax = convertCurrency(orderData?.totalCost - Math.ceil(orderData?.totalCost / 100 * orderData?.tax), value);
    const convertedPriceWithTax = convertCurrency(Math.ceil(orderData?.totalCost / 100 * orderData?.tax), value);
    const convertedPriceTotal = convertCurrency(orderData.totalCost, value);
  
    setConvertedDoorPrice(convertedDoorPrice);
    setConvertedFramePrice(convertedFramePrice);
    setConvertedKnobePrice(convertedKnobePrice);
    setConvertedHingePrice(convertedHingePrice);
    setConvertedLockPrice(convertedLockPrice);
    setConvertedElementPrice(convertedElementPrice)
    setConvertedOptionPrice(convertedOptionPrice)
    setConvertedPriceNOTax(convertedPriceNOTax)
    setConvertedPriceWithTax(convertedPriceWithTax);
    setConvertedPriceTotal(convertedPriceTotal);
  };

    if (!orderData) {
    return null;
  }

  return (
    
    <div style={{maxWidth: isCreatingPdf ? 'auto' : '900px', margin: '0 auto'}}>

    <Space style={{display: isCreatingPdf ? 'none' : 'flex', marginBottom: '20px', alignItems: 'baseline'}}>
      <p> {language.currency} </p>
      <Select
        defaultValue={currency}
        onChange={handleCurrencyChange}
      >
        <Option value="EUR">EUR €</Option>
        <Option value="PLN">PLN zł</Option>
        <Option value="USD">USD $</Option>
        <Option value="UAH">UAH ₴</Option>
      </Select>
    </Space>
    {/* <p style={{display: isCreatingPdf ? 'none' : 'flex'}}> {language.exchangeRate} </p> */}

    <Alert
      style={{display: isCreatingPdf ? 'none' : 'block', marginBottom: '10px'}}
      // message="Warning"
      // showIcon
      description={language.exchangeRate}
      type="warning"
    />

      {/* HEADER */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px'}}>
          <Image width={100} src={`${logo}`} preview={false}/>

          <Descriptions
            column={3}
            layout="vertical"
            bordered
            size='small'
            style={{width: '50%'}}
          >
          <Descriptions.Item label={language.company}> Boki Group Poland</Descriptions.Item>
          <Descriptions.Item label={language.manager}> {`${user.username}`}</Descriptions.Item>
          <Descriptions.Item label={`${language.order} #`} labelStyle={{fontWeight: '600', color:'#f06d20'}}> {`${orderId}`}</Descriptions.Item>
          </Descriptions>
        </div>

        <Divider style={{padding: '0', margin: '0'}}/>

      {/* DOOR DETAILS */}
        {/* <h1 style={{fontSize: '25px', textAlign: 'center', fontWeight: '500', margin: '20px 0'}}> {language.door} </h1> */}
        
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
            <Descriptions.Item 
              span={2} 
              // style={{ width: isCreatingPdf ? '55%' : '50%'}} 
              style={{ width: isCreatingPdf ? '55%' : '60%'}} 
              label={`${language.product} ${language.image}`}
              labelStyle={{fontWeight: '600', color:'#000'}}
              className='labelBG'
            >
              <div style={{height: '400px', textAlign: 'center'}}>
                <img 
                  src={`https://api.boki.fortesting.com.ua${doorData.door?.data?.attributes?.product_properties?.image?.data?.attributes?.url}`} 
                  alt="Product"
                  style={{height: '100%'}}
                />
              </div>
            </Descriptions.Item>

            <Descriptions.Item 
              className='labelBG'
              span={2} 
              // style={{ width: isCreatingPdf ? '45%' : '50%'}} 
              style={{ width: isCreatingPdf ? '45%' : '40%'}} 
              label={language.data}
              labelStyle={{fontWeight: '600', color:'#000'}}
            >
              <Descriptions
                column={1}
                layout="horizontal"
                bordered
                size={isCreatingPdf ? 'small' : 'default'}
              >
                <Descriptions.Item label={language.collection}>
                {doorData.door?.data?.attributes?.collection}
                </Descriptions.Item>

                <Descriptions.Item label={`${language.product} ${language.title}`}>
                  {doorData.door?.data?.attributes?.product_properties?.title}
                </Descriptions.Item>

                <Descriptions.Item label={language.doubleDoor}>
                  {orderData?.double_door ? language.yes : language.no}
                </Descriptions.Item>

                <Descriptions.Item label={language.hidden}>
                  {orderData?.hidden ? language.yes : language.no}
                </Descriptions.Item>

                <Descriptions.Item label={language.opening}>
                  {orderData?.opening}
                </Descriptions.Item>

                <Descriptions.Item label={language.side}>
                  {orderData?.side}
                </Descriptions.Item>

                <Descriptions.Item label={language.height}>
                  {`${doorData.sizes.height} mm`}
                  </Descriptions.Item>

                <Descriptions.Item label={language.width}>
                {`${doorData.sizes.width} mm`}
                </Descriptions.Item>

                <Descriptions.Item label={language.thickness}>
                {`${doorData.sizes.thickness} mm`}
                </Descriptions.Item>

              </Descriptions>
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' span={2} label={`${language.decor} ${language.image}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              <img 
                src={`https://api.boki.fortesting.com.ua${doorData?.decor?.img}`} 
                alt="Decor"
                height={240}
                width={'100%'}
                style={{ display: 'block', textAlign: 'center' }}
              />
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.decor} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {doorData.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp;
              {doorData.decor?.data?.attributes?.title}

            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.decor} ${language.type}`}labelStyle={{fontWeight: '600', color:'#000'}} >
              {doorData.decor?.data?.attributes?.type}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {doorData.price} {orderData?.currency} */}
              {convertedDoorPrice ? `${convertedDoorPrice} ${currency}` : `${doorData.price} ${orderData?.currency}`}
            </Descriptions.Item>
          </>
          )}
        </Descriptions>
      </div>

      {/* <div id='nextpage'></div> */}
      {/* FRAME AND FITTING DETAILS */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        {/* <h1 style={{fontSize: '25px', textAlign: 'center', fontWeight: '500', margin: '20px 0'}}> {language.frame} & {language.fitting} </h1> */}
        
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.frame} & {language.fitting} 
        </p>

        <Descriptions
          column={3}
          layout="vertical"
          bordered
          size='default'
          >
          {frameData && lockData && hingeData && knobeData && (
          <>
            {/* <Descriptions.Item label="Frame Title" labelStyle={{fontWeight: '600', color:'#f06d20'}}>
              {frameData.frame?.data?.attributes?.title}
            </Descriptions.Item> */}

            <Descriptions.Item className='labelBG' span={2} label={`${language.frame} ${language.type}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {frameData.frame?.data?.attributes?.type} */}
              {/* {languageMap[selectedLanguage][frameData.frame?.data?.attributes?.type]} */}
              {languageMap[selectedLanguage][frameData.frame?.data?.attributes?.title]}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.frame} ${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {frameData.price} {orderData?.currency}  */}
              {convertedFramePrice ? `${convertedFramePrice} ${currency}` : `${frameData.price} ${orderData?.currency}`}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {lockData?.title} */}
              {lockData?.lock?.data?.attributes?.title}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {hingeData?.title} */}
              {hingeData?.hinge?.data?.attributes?.title}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {knobeData?.title} */}
              {knobeData?.knobe?.data?.attributes?.title} / {languageMap[selectedLanguage][knobeData.knobe_variant]}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.image} (${language.lock})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              <img
                src={`https://api.boki.fortesting.com.ua${lockData?.lock?.data?.attributes?.image?.data?.attributes?.url}`}
                alt="Lock"
                height={200}
                style={{ display: 'block', margin: '0 auto' }}
              />
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.image} (${language.hinges})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              <img
                src={`https://api.boki.fortesting.com.ua${hingeData?.hinge?.data?.attributes?.image?.data?.attributes?.url}`}
                alt="hinge"
                height={200}
                style={{ display: 'block', margin: '0 auto' }}
              />
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.image} (${language.knobe})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              <img
                src={`https://api.boki.fortesting.com.ua${knobeData?.knobe?.data?.attributes?.image?.data?.attributes?.url}`}
                alt="knobe"
                height={isCreatingPdf ? '80px' : '100px'}
                style={{ display: 'block', margin: '0 auto' }}
              />
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.brand} labelStyle={{fontWeight: '600', color:'#000'}}>
              {lockData?.lock?.data?.attributes?.brand}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.brand} labelStyle={{fontWeight: '600', color:'#000'}}>
              {hingeData?.hinge?.data?.attributes?.brand}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.brand} labelStyle={{fontWeight: '600', color:'#000'}}>
              {knobeData?.knobe?.data?.attributes?.brand}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.lock})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {lockData?.price} {orderData?.currency}  */}
              {convertedLockPrice ? `${convertedLockPrice} ${currency}` : `${lockData.price} ${orderData?.currency}`} 
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.hinges}) / ${language.amount}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {hingeData?.price} {orderData?.currency} / {language.amount}: {hingeData?.amount} */}
              {convertedHingePrice ? `${convertedHingePrice} ${currency}` : `${hingeData.price} ${orderData?.currency}`} / {language.amount}: {hingeData?.amount}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.knobe})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {knobeData?.price} {orderData?.currency} */}
              {convertedKnobePrice ? `${convertedKnobePrice} ${currency}` : `${knobeData.price} ${orderData?.currency}`}
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
                size='middle'
              >
                <Descriptions.Item className='labelBG' label={`${language.element} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {/* {element.element?.data?.attributes?.title} */}
                  {languageMap[selectedLanguage][element.element?.data?.attributes?.title]}
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
                      <Descriptions.Item className='labelBG' span={2} label={`${language.decor} ${language.image}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                      <img 
                        src={`https://api.boki.fortesting.com.ua${element?.decor?.img}`}  
                        alt="Decor"
                        // height={240}
                        height={200}
                        width={'100%'}
                        style={{ display: 'block', textAlign: 'center' }}
                      />
                    </Descriptions.Item>

                    <Descriptions.Item className='labelBG' label={`${language.decor} ${language.title}`} span={2} labelStyle={{fontWeight: '600', color:'#000'}}>
                      {element.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp;
                      {element.decor?.data?.attributes?.title}
                    </Descriptions.Item>

                    <Descriptions.Item className='labelBG' label={`${language.decor} ${language.type}`} labelStyle={{fontWeight: '600', color:'#000'}} >
                      {element.decor?.data?.attributes?.type}
                    </Descriptions.Item>
                  </>
                )}

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {/* {element?.price} {orderData?.currency} */}
                  {convertedElementPrice[index] ? `${convertedElementPrice[index].convertedPrice} ${currency}` : `${element.price} ${orderData?.currency}`}
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
          {language.Order} {language.options}
        </p>

        <Descriptions
          column={2}
          layout="vertical"
          bordered
          size='default'
          >
            {optionsData && optionsData.length > 0 && optionsData.map((option, index) => (
              <React.Fragment key={index}>

                <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {/* {option.title} */}
                  {languageMap[selectedLanguage][option.title]}
                </Descriptions.Item>

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {/* {option.price} {orderData?.currency} */}
                  {convertedOptionPrice[index] ? `${convertedOptionPrice[index].convertedPrice} ${currency}` : `${option.price} ${orderData?.currency}`}
                </Descriptions.Item>
              </React.Fragment>
            ))}

              {orderData?.horizontal_veneer && (
                <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {/* {orderData?.horizontal_veneer ? language.yes : language.no} */}
                  {orderData?.horizontal_veneer ? 'horizontal_veneer' : ''}
                </Descriptions.Item>
              )}

              {orderData?.super_gloss && (
                <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {/* {orderData?.super_gloss ? language.yes : language.no} */}
                  {orderData?.super_gloss ? 'super_gloss' : ''}
                </Descriptions.Item>
              )}

          </Descriptions>
      </div>
        </>
      )}

      {/* ORDER INFORMATION */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        {/* <h1 style={{fontSize: '25px', textAlign: 'center', fontWeight: '500', margin: '20px 0'}}> {language.Order} {language.information} </h1> */}
        
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.Order} {language.information}
        </p>

        <Descriptions
          column={4}
          layout="vertical"
          bordered
          size='default'
          >
            <Descriptions.Item span={2} className='labelBG' label={language.shippingAddress} labelStyle={{fontWeight: '600', color:'#000'}}>
              {`${orderData?.shippingAddress?.address} ${orderData?.shippingAddress?.country} ${orderData?.shippingAddress?.city} ${orderData?.shippingAddress?.zipCode}`}
            </Descriptions.Item>

            <Descriptions.Item span={2} className='labelBG' label={language.deliveryAt} labelStyle={{fontWeight: '600', color:'#000'}}>
              {dayjs(orderData?.deliveryAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {orderData?.totalCost - Math.ceil(orderData?.totalCost / 100 * orderData?.tax)} */}
              {convertedPriceNOTax ? `${convertedPriceNOTax} ${currency}` : `${orderData?.totalCost - Math.ceil(orderData?.totalCost / 100 * orderData?.tax)} ${orderData?.currency}`}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.tax} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {orderData?.tax} <br/> */}
              {/* {Math.ceil(orderData?.totalCost / 100 * orderData?.tax)} */}
              {convertedPriceWithTax ? `${convertedPriceWithTax} ${currency}` : `${Math.ceil(orderData?.totalCost / 100 * orderData?.tax)} ${orderData?.currency}`}
            </Descriptions.Item>

            {/* <Descriptions.Item className='labelBG' label={language.currency} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.currency}
            </Descriptions.Item> */}

            <Descriptions.Item className='labelBG' label={`${language.discount} %`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.discount ? orderData?.discount: 0}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.totalCost} labelStyle={{fontWeight: '600', color:'#000'}}>
              {/* {orderData?.totalCost} */}
              {convertedPriceTotal ? `${convertedPriceTotal} ${currency}` : `${orderData?.totalCost} ${orderData?.currency}`}
            </Descriptions.Item>

          </Descriptions>
    </div>

    <p style={{margin: '30px 15px 15px', textAlign: 'left' }}> 
      <span style={{color: 'red', fontWeight: 'bold'}}> * </span> {language.colorWarn}
    </p>
  </div>
  );
};
