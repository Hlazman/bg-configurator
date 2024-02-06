import React, { useState, useContext, useEffect } from 'react';
import {Descriptions, Image, Select, Space, Alert, Divider} from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { AuthContext } from '../Context/AuthContext';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import {imageLink} from '../api/variables'

export const OrderDescription = (
  {orderData, orderId, frameData, doorData, elementData, lockData, hingeData, knobeData, optionsData, companyData}
  ) => {
  const { user } = useContext(AuthContext);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const standartRAL = ['1013', '1015', '7045', '7047', '9001', '9002', '9003', '9010', '9016', '9018'];

  const { Option } = Select;
  
  const [currency, setCurrency] = useState('EUR');
  const [convertedDoorPrice, setConvertedDoorPrice] = useState(null);
  const [convertedFramePrice, setConvertedFramePrice] = useState(null);
  const [convertedKnobePrice, setConvertedKnobePrice] = useState(null);
  const [convertedLockPrice, setConvertedLockPrice] = useState(null);
  const [convertedHingePrice, setConvertedHingePrice] = useState(null);
  const [convertedOptionPrice, setConvertedOptionPrice] = useState([]);
  const [convertedElementPrice, setConvertedElementPrice] = useState([]);
  // const [convertedPriceNOTax, setConvertedPriceNOTax] = useState('');
  // const [convertedPriceWithTax, setConvertedPriceWithTax] = useState('');
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
  
  useEffect(() => {
  console.log(knobeData)
  });

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
    const convertedKnobePrice = convertCurrency(knobeData?.price, value);
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

    // const convertedPriceNOTax = convertCurrency(orderData?.totalCost - Math.ceil(orderData?.totalCost / 100 * orderData?.tax), value);
    // const convertedPriceWithTax = convertCurrency(Math.ceil(orderData?.totalCost / 100 * orderData?.tax), value);
    const convertedPriceTotal = convertCurrency(orderData.totalCost, value);
  
    setConvertedDoorPrice(convertedDoorPrice);
    setConvertedFramePrice(convertedFramePrice);
    setConvertedKnobePrice(convertedKnobePrice);
    setConvertedHingePrice(convertedHingePrice);
    setConvertedLockPrice(convertedLockPrice);
    setConvertedElementPrice(convertedElementPrice)
    setConvertedOptionPrice(convertedOptionPrice)
    // setConvertedPriceNOTax(convertedPriceNOTax)
    // setConvertedPriceWithTax(convertedPriceWithTax);
    setConvertedPriceTotal(convertedPriceTotal);
  };

    if (!orderData) {
    return null;
  }

  return (
    <div style={{maxWidth: '900px', margin: '0 auto'}}>

    <Space style={{display: 'flex', marginBottom: '20px', alignItems: 'baseline'}}>
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

    <Alert
      style={{display: 'block', marginBottom: '10px'}}
      description={language.exchangeRate}
      type="warning"
    />

      {/* HEADER */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>

      {/* DOOR DETAILS */}
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.door}
        </p>
        
        <Descriptions
          column={4}
          layout="vertical"
          bordered
          size={'default'}
        >
          {doorData && (
          <>
            <Descriptions.Item 
              span={2} 
              style={{ width: '60%'}} 
              label={`${language.product} ${language.image}`}
              labelStyle={{fontWeight: '600', color:'#000'}}
              className='labelBG'
            >
              <div style={{height: '400px', textAlign: 'center'}}>
                {
                  doorData.door?.data?.attributes?.product_properties?.image?.data?.attributes?.url
                  ? <img 
                  src={`${imageLink}${doorData.door?.data?.attributes?.product_properties?.image?.data?.attributes?.url}`} 
                  alt="Product"
                  style={{height: '100%'}}
                    />
                  : <PictureOutlined style={{fontSize: '150px'}}/>
                }
              </div>
            </Descriptions.Item>

            <Descriptions.Item 
              className='labelBG'
              span={2} 
              style={{ width: '40%'}} 
              label={language.data}
              labelStyle={{fontWeight: '600', color:'#000'}}
            >
              <Descriptions
                column={1}
                layout="horizontal"
                bordered
                size={'default'}
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

            <Descriptions.Item className='labelBG' label={`${language.decor} ${language.image}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {
                doorData?.decor?.img
                ? <img 
                    src={`${imageLink}${doorData?.decor?.img}`} 
                    alt="Decor"
                    height={200}
                  />
                : <PictureOutlined style={{fontSize: '150px'}}/>
              }
            </Descriptions.Item>

            <Descriptions.Item span={2} className='labelBG' label={`${language.decor} ${language.descr}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {doorData.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp;
              {doorData.decor?.data?.attributes?.title}
              <br/>
              {
                doorData.decor?.data?.attributes?.paint?.data?.attributes?.color_range !== 'RAL' 
                ? ''
                : standartRAL.includes(doorData.decor?.data?.attributes?.title) 
                  ? '' 
                  : `${language.cost} + 10%`
              }
              <br/>
              {/* {doorData.decor?.data?.attributes?.type} */}
              {languageMap[selectedLanguage][doorData.decor?.data?.attributes?.type]}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedDoorPrice ? `${convertedDoorPrice} ${currency}` : `${doorData.price} ${orderData?.currency}`}
            </Descriptions.Item>
          </>
          )}
        </Descriptions>
      </div>

      {/* FRAME AND FITTING DETAILS */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.frame} & {language.fitting} 
        </p>

        <Descriptions
          column={3}
          layout="vertical"
          bordered
          size='default'
          >
          {frameData && lockData && hingeData && (
          <>
            <Descriptions.Item className='labelBG' span={2} label={`${language.frame} ${language.type}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {languageMap[selectedLanguage][frameData.frame?.data?.attributes?.title]}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.frame} ${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedFramePrice ? `${convertedFramePrice} ${currency}` : `${frameData.price} ${orderData?.currency}`}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.lock} labelStyle={{fontWeight: '600', color:'#000'}}>
              {language.title} : {lockData?.lock?.data?.attributes?.title}
              <br/>
              {language.brand} : {lockData?.lock?.data?.attributes?.brand}
              <Divider/>
              {
                lockData?.lock?.data?.attributes?.image?.data?.attributes?.url
                ? <img
                    src={`${imageLink}${lockData?.lock?.data?.attributes?.image?.data?.attributes?.url}`}
                    alt="Lock"
                    height={150}
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                : <PictureOutlined style={{fontSize: '150px'}}/>
                
              }

            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.hinges} labelStyle={{fontWeight: '600', color:'#000'}}>
              {language.title} : {hingeData?.hinge?.data?.attributes?.title}
              <br/>
              {language.brand} : {hingeData?.hinge?.data?.attributes?.brand}
              <Divider/>
              {
                hingeData?.hinge?.data?.attributes?.image?.data?.attributes?.url
                ? <img
                    src={`${imageLink}${hingeData?.hinge?.data?.attributes?.image?.data?.attributes?.url}`}
                    alt="hinge"
                    height={150}
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                : <PictureOutlined style={{fontSize: '150px'}}/>
              }

            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.knobe} labelStyle={{fontWeight: '600', color:'#000'}}>
              {language.title} : {
                  knobeData?.knobe?.data?.attributes?.title
                  ? `${knobeData?.knobe?.data?.attributes?.title} / ${languageMap[selectedLanguage][knobeData.knobe_variant]}`
                  : '-'
                  }
                  <br/>
                  {language.brand} :{
                    knobeData?.knobe?.data?.attributes?.brand
                    ? knobeData?.knobe?.data?.attributes?.brand
                    : '-'
                  }
                  <Divider/>
                  {
                    knobeData?.knobe?.data?.attributes?.image?.data?.attributes?.url
                    ? <img
                        src={`${imageLink}${knobeData?.knobe?.data?.attributes?.image?.data?.attributes?.url}`}
                        alt="knobe"
                        height={'100px'}
                        style={{ display: 'block', margin: '25px auto'}}
                      />
                    :  '-'
                  }
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.lock})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedLockPrice ? `${convertedLockPrice} ${currency}` : `${lockData.price} ${orderData?.currency}`} 
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.hinges})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedHingePrice ? `${convertedHingePrice} ${currency}` : `${hingeData.price} ${orderData?.currency}`} / {language.amount}: {hingeData?.amount}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.knobe})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {
                convertedKnobePrice !== null
                  ? `${convertedKnobePrice} ${currency}` 
                  : knobeData?.price !== null
                    ? `${knobeData?.price} ${orderData?.currency}`
                    : '-'
                }
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
                  <Descriptions.Item span={3} className='labelBG' label={language.len} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${element?.sizes?.length} mm`}
                  </Descriptions.Item>
                )}

                <Descriptions.Item className='labelBG' label={language.amount} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {element?.amount}
                </Descriptions.Item>

                {element.decor?.data?.attributes && (
                  <>
                      <Descriptions.Item className='labelBG' span={2} label={`${language.decor} ${language.image}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                        {
                          element?.decor?.img
                          ? <img 
                              src={`${imageLink}${element?.decor?.img}`}
                              alt="Decor"
                              height={100}
                            />
                          : <PictureOutlined style={{fontSize: '150px'}}/>
                        }
                    </Descriptions.Item>

                    <Descriptions.Item className='labelBG' label={`${language.decor}`} span={3} labelStyle={{fontWeight: '600', color:'#000'}}>
                      {/* {element.decor?.data?.attributes?.type} : {element.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp; */}
                      {languageMap[selectedLanguage][element.decor?.data?.attributes?.type]} : {element.decor?.data?.attributes?.paint.data?.attributes?.color_range} &nbsp;
                      {element.decor?.data?.attributes?.title}
                    </Descriptions.Item>
                  </>
                )}

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {
                    languageMap[selectedLanguage][element.type] === language.anotherSideColor 
                    ? '+25%' 
                    : convertedElementPrice[index] ? `${convertedElementPrice[index].convertedPrice} ${currency}` : `${element.price} ${orderData?.currency}`
                  }
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
                  {languageMap[selectedLanguage][option.title] ? languageMap[selectedLanguage][option.title] : option.title}
                </Descriptions.Item>

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {convertedOptionPrice[index] ? `${convertedOptionPrice[index].convertedPrice} ${currency}` : `${option.price} ${orderData?.currency}`}
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

      {/* ORDER INFORMATION */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.Order} {language.totalCost}
        </p>

        <Descriptions
          column={4}
          layout="vertical"
          bordered
          size='default'
          >
            {/* <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedPriceNOTax ? `${convertedPriceNOTax} ${currency}` : `${orderData?.totalCost - Math.ceil(orderData?.totalCost / 100 * orderData?.tax)} ${orderData?.currency}`}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.tax} labelStyle={{fontWeight: '600', color:'#000'}}>
              {convertedPriceWithTax ? `${convertedPriceWithTax} ${currency}` : `${Math.ceil(orderData?.totalCost / 100 * orderData?.tax)} ${orderData?.currency}`}
            </Descriptions.Item> */}

            {/* <Descriptions.Item className='labelBG' label={`${language.discount} %`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.discount ? orderData?.discount: 0}
            </Descriptions.Item> */}

            {/* <Descriptions.Item className='labelBG' label={language.totalCost} labelStyle={{fontWeight: '600', color:'#000'}}> */}
            <Descriptions.Item className='labelNone'>
              {convertedPriceTotal ? `${convertedPriceTotal} ${currency}` : `${orderData?.totalCost} ${orderData?.currency}`}
            </Descriptions.Item>

          </Descriptions>
      </div>

    <p style={{margin: '30px 15px 15px', textAlign: 'left' }}> 
      <span style={{color: 'red', fontWeight: 'bold'}}> * </span> {language.colorWarn}
    </p>

    <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', backgroundColor: '#FFF', padding: '20px'}}>
      <Image width={100} src={imageLink + companyData?.logo?.data?.attributes?.url} preview={false}/>

      <Descriptions
        column={4}
        layout="vertical"
        bordered
        size='small'
        style={{width: '75%'}}
      >
        <Descriptions.Item label={language.company}> {companyData?.name} </Descriptions.Item>
        <Descriptions.Item label={language.manager}> {`${user.username}`}</Descriptions.Item>
        <Descriptions.Item label={language.contacts}>
          <div>{companyData?.contacts?.phone}</div>
          <div>{companyData?.contacts?.phone_2}</div>
          <div>{companyData?.contacts?.email}</div>
          <div><a href={companyData?.contacts?.website}>{companyData?.contacts?.website}</a></div>
        </Descriptions.Item>
        <Descriptions.Item label={`${language.order} #`} labelStyle={{fontWeight: '600', color:'#f06d20'}}> {`${orderId}`}</Descriptions.Item>
      </Descriptions>
    </div>

  </div>
  );
};
