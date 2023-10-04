import React, { useState, useContext, useEffect } from 'react';
import {Descriptions, Image, Divider, Card} from 'antd';
import dayjs from 'dayjs';
import { AuthContext } from '../Context/AuthContext';
import logo from '../logo.svg';
import bg from '../bg.svg';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';


export const OrderDescription = (
  {orderData, orderId, frameData, doorData, elementData, lockData, hingeData, knobeData, isCreatingPdf}
  ) => {
  const { user } = useContext(AuthContext);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  // useEffect(() => {
  //   if (elementData && elementData.length > 0) {
  //     for(let i = 0; i < elementData.length; i++) {
  //       console.log(elementData[i]?.decor?.data?.attributes?.paint.data?.attributes?.color_range)
  //     }
  //   }

  // }, [elementData])

    if (!orderData) {
    return null;
  }

  return (
    <div style={{maxWidth: isCreatingPdf ? 'auto' : '900px', margin: '0 auto'}}>
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
              {doorData.price} 100$
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
              {frameData.frame?.data?.attributes?.type}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.frame} ${language.price}`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {frameData.price}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
              {lockData?.title}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
              {hingeData?.title}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.title} labelStyle={{fontWeight: '600', color:'#000'}}>
              {knobeData?.title}
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
              {lockData?.price} 100$ 
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.hinges})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {hingeData?.price} 100$
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={`${language.price} (${language.knobe})`} labelStyle={{fontWeight: '600', color:'#000'}}>
              {knobeData?.price} 100$
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
            {/* <h1 style={{fontSize: '25px', textAlign: 'center', fontWeight: '500', margin: '20px 0'}}> {language.additional} {language.elements} </h1> */}
              
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
                // size={isCreatingPdf ? 'small' : 'default'}
                size='middle'
                // title={`${language.additional} ${language.element} # ${index + 1}`}
              >
                <Descriptions.Item className='labelBG' label={`${language.element} ${language.title}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {element.element?.data?.attributes?.title}
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

                {/* <Descriptions.Item className='labelBG' label={language.height} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {`${element?.sizes?.height} mm`}
                </Descriptions.Item> */}

                {/* <Descriptions.Item className='labelBG' label={language.width} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {`${element?.sizes?.width} mm`}
                </Descriptions.Item> */}

                {/* <Descriptions.Item className='labelBG' label={language.thickness} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {`${element?.sizes?.thickness} mm`}
                </Descriptions.Item> */}

                {/* NEW */}
                {element?.sizes?.length && (
                  <Descriptions.Item span={3} className='labelBG' label="Lenght" labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${element?.sizes?.length} mm`}
                  </Descriptions.Item>
                )}
                {/* NEW */}

                <Descriptions.Item className='labelBG' label={language.amount} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {element?.amount}
                </Descriptions.Item>

                  {/* NEW */}
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
                {/* NEW */}

                <Descriptions.Item className='labelBG' label={language.price} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {element?.price} 100$
                </Descriptions.Item>
              </Descriptions>
              </React.Fragment>
              ))}
          </div>
        </>
       )}

      {/* OPTIONS */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        
        <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
          {language.Order} {language.options}
        </p>

        <Descriptions
          column={4}
          layout="vertical"
          bordered
          size='default'
          >
            <Descriptions.Item className='labelBG' label={'horizontal_veneer'} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.horizontal_veneer ? language.yes : language.no}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={'super_gloss'} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.super_gloss ? language.yes : language.no}
            </Descriptions.Item>


          </Descriptions>
      </div>

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

            <Descriptions.Item className='labelBG' label={language.discount} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.discount}
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.tax} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.tax} 20
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.totalCost} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.totalCost} 100$
            </Descriptions.Item>

            <Descriptions.Item className='labelBG' label={language.currency} labelStyle={{fontWeight: '600', color:'#000'}}>
              {orderData?.currency}
            </Descriptions.Item>

          </Descriptions>
    </div>

    <p style={{margin: '30px 15px 15px', textAlign: 'left' }}> 
      <span style={{color: 'red', fontWeight: 'bold'}}> * </span> {language.colorWarn}
    </p>
  </div>
  );
};
