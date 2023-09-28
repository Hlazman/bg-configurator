import React, { useState, useContext, useEffect } from 'react';
import {Descriptions, Image, Divider} from 'antd';
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

    if (!orderData) {
    return null;
  }

  return (
    <>
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
          <Descriptions.Item label="Company"> Boki Group Poland</Descriptions.Item>
          <Descriptions.Item label="Manager"> {`${user.username}`}</Descriptions.Item>
          <Descriptions.Item label="Order #" labelStyle={{fontWeight: '600', color:'#f06d20'}}> {`${orderId}`}</Descriptions.Item>
          </Descriptions>
        </div>

        <Divider style={{padding: '0', margin: '0'}}/>
      </div>

      {/* DOOR DETAILS */}
      <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px'}}>
        <h1 style={{fontSize: '25px', textAlign: 'center', fontWeight: '500', margin: '0 0 20px 0'}}> Door </h1>
        <Descriptions
          // title='Door'
          column={4}
          layout="vertical"
          bordered
          // style={{marginTop: '25px', textAlign: 'center'}}
          size={isCreatingPdf ? 'small' : 'default'}
        >
          {doorData && (
          <>
            <Descriptions.Item 
              span={2} 
              style={{ width: isCreatingPdf ? '55%' : '50%'}} 
              label="Product Image"
              labelStyle={{fontWeight: '600', color:'#f06d20'}}
            >
              <img 
                src={`https://api.boki.fortesting.com.ua${doorData.door?.data?.attributes?.product_properties?.image?.data?.attributes?.url}`} 
                alt="Product"
                width={'100%'}
                />
            </Descriptions.Item>

            <Descriptions.Item 
              span={2} 
              style={{ width: isCreatingPdf ? '45%' : '50%'}} 
              label="Data"
              labelStyle={{fontWeight: '600', color:'#f06d20'}}
            >
              <Descriptions
                column={1}
                layout="horizontal"
                bordered
                size={isCreatingPdf ? 'small' : 'default'}
              >
                <Descriptions.Item label="Collection">
                {doorData.door?.data?.attributes?.collection}
                </Descriptions.Item>

                <Descriptions.Item label="Product Title">
                  {doorData.door?.data?.attributes?.product_properties?.title}
                </Descriptions.Item>

                <Descriptions.Item label="Double door">
                  {orderData?.double_door ? 'Yes' : 'No'}
                </Descriptions.Item>

                <Descriptions.Item label="Hidden">
                  {orderData?.hidden ? 'Yes' : 'No'}
                </Descriptions.Item>

                <Descriptions.Item label="Opening">
                  {orderData?.opening}
                </Descriptions.Item>

                <Descriptions.Item label="Side">
                  {orderData?.side}
                </Descriptions.Item>

                <Descriptions.Item label="Height">
                  {`${doorData.sizes.height} mm`}
                  </Descriptions.Item>

                <Descriptions.Item label="Width">
                {`${doorData.sizes.width} mm`}
                </Descriptions.Item>

                <Descriptions.Item label="Thickness">
                {`${doorData.sizes.thickness} mm`}
                </Descriptions.Item>

              </Descriptions>
            </Descriptions.Item>

            <Descriptions.Item span={2} label="Decor Image" labelStyle={{fontWeight: '600', color:'#f06d20'}}>
              <img 
                src={`https://api.boki.fortesting.com.ua${doorData?.decor?.img}`} 
                alt="Decor"
                height={240}
                width={'100%'}
                style={{ display: 'block', textAlign: 'center' }}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Decor Title" labelStyle={{fontWeight: '600', color:'#f06d20'}}>
              {doorData.decor?.data?.attributes?.title}
            </Descriptions.Item>

            <Descriptions.Item label="Decor Type"labelStyle={{fontWeight: '600', color:'#f06d20'}} >
              {doorData.decor?.data?.attributes?.type}
            </Descriptions.Item>

            <Descriptions.Item label="Price" labelStyle={{fontWeight: '600', color:'#f06d20'}}>
              {doorData.price}  100$
            </Descriptions.Item>
          </>
          )}
        </Descriptions>
      </div>


  <div style={{marginTop: '400px'}}> LINE</div>





  {/* <> */}
  {/* Descriptions Order */}
  <Descriptions
  title={`Order ${orderId} Details`} 
  column={4} 
  layout="vertical"
  bordered
  >
  {/* <Descriptions.Item label="Double door">
  {orderData?.double_door ? 'Yes' : 'No'}
  </Descriptions.Item> */}

  <Descriptions.Item label="Discount">
  {orderData?.discount}
  </Descriptions.Item>

  <Descriptions.Item label="Delivery At">
  {dayjs(orderData?.deliveryAt).format('YYYY-MM-DD HH:mm:ss')}
  </Descriptions.Item>

  <Descriptions.Item label="Currency">
  {orderData?.currency}
  </Descriptions.Item>

  {/* <Descriptions.Item label="Hidden">
  {orderData?.hidden ? 'Yes' : 'No'}
  </Descriptions.Item> */}

  {/* <Descriptions.Item label="Opening">
  {orderData?.opening}
  </Descriptions.Item> */}

  <Descriptions.Item label="Shipping Address">
  {`${orderData?.shippingAddress?.address} ${orderData?.shippingAddress?.country} ${orderData?.shippingAddress?.city} ${orderData?.shippingAddress?.zipCode}`}
  </Descriptions.Item>

  {/* <Descriptions.Item label="Side">
  {orderData?.side}
  </Descriptions.Item> */}

  <Descriptions.Item label="Tax">
  {orderData?.tax}
  </Descriptions.Item>

  <Descriptions.Item label="Total Cost">
  {orderData?.totalCost}
  </Descriptions.Item>

  </Descriptions>

  {/* Descriptions frameSuborder */}
  <Descriptions
  title='Frame'
  column={4}
  layout="vertical"
  bordered
  style={{marginTop: '30px'}}
  >
  {frameData && (
  <>
    <Descriptions.Item label="Frame Title">
      {frameData.frame?.data?.attributes?.title}
    </Descriptions.Item>
    <Descriptions.Item label="Frame Type">
      {frameData.frame?.data?.attributes?.type}
    </Descriptions.Item>
    <Descriptions.Item label="Frame Price">
      {frameData.price}
    </Descriptions.Item>
  </>
  )}
  </Descriptions>

  {/* Descriptions doorSuborder */}
  {/* <Descriptions
  title='Door'
  column={4}
  layout="vertical"
  bordered
  style={{marginTop: '30px'}}
  >
  {doorData && (
  <>
    <Descriptions.Item label="Price">
      {doorData.price}
    </Descriptions.Item>
    <Descriptions.Item label="Sizes">
      {`Height: ${doorData.sizes.height}, Thickness: ${doorData.sizes.thickness}, Width: ${doorData.sizes.width}`}
    </Descriptions.Item>
    <Descriptions.Item label="Collection">
      {doorData.door?.data?.attributes?.collection}
    </Descriptions.Item>
    <Descriptions.Item label="Product Title">
      {doorData.door?.data?.attributes?.product_properties?.title}
    </Descriptions.Item>
    <Descriptions.Item label="Product Image">
    <img 
      src={`https://api.boki.fortesting.com.ua${doorData.door?.data?.attributes?.product_properties?.image?.data?.attributes?.url}`} 
      alt="Product"
      height={100}
      />
    </Descriptions.Item>

    <Descriptions.Item label="Decor Title">
      {doorData.decor?.data?.attributes?.title}
    </Descriptions.Item>
    <Descriptions.Item label="Decor Type">
      {doorData.decor?.data?.attributes?.type}
    </Descriptions.Item>

    <Descriptions.Item label="Decor Image">
      <img 
        src={`https://api.boki.fortesting.com.ua${doorData?.decor?.img}`} 
        alt="Decor"
        height={100}
      />
    </Descriptions.Item>
  </>
  )}
  </Descriptions> */}

  {/* Descriptions elementSuborders */}
  {elementData && elementData.map((element, index) => (
  <Descriptions
  key={index}
  title={`Element ${index + 1}`}
  column={4}
  layout="vertical"
  bordered
  style={{marginTop: '30px'}}
  >
  <>
    <Descriptions.Item label="Amount">
      {element?.amount}
    </Descriptions.Item>
    <Descriptions.Item label="Price">
      {element?.price}
    </Descriptions.Item>
    <Descriptions.Item label="Sizes">
      {`Height: ${element?.sizes?.height}, Thickness: ${element?.sizes?.thickness}, Width: ${element?.sizes?.width}`}
    </Descriptions.Item>
    <Descriptions.Item label="Element Title">
      {element.element?.data?.attributes?.title}
    </Descriptions.Item>
    <Descriptions.Item label="Decor Title">
      {element.decor?.data?.attributes?.title}
    </Descriptions.Item>
    <Descriptions.Item label="Decor Type">
      {element.decor?.data?.attributes?.type}
    </Descriptions.Item>


    <Descriptions.Item label="Decor Image">
      <img 
        src={`https://api.boki.fortesting.com.ua${element?.decor?.img}`} 
        alt="Decor"
        height={100}
      />
    </Descriptions.Item>

  </>
  </Descriptions>
  ))}

  {/* Descriptions Lock */}
  <Descriptions
  title='Lock'
  column={4}
  layout="vertical"
  bordered
  style={{marginTop: '30px'}}
  >
  {lockData && (
  <>
  <Descriptions.Item label="Title">
    {lockData?.title}
  </Descriptions.Item>
  <Descriptions.Item label="Price">
    {lockData?.price}
  </Descriptions.Item>
  <Descriptions.Item label="Brand">
    {lockData?.lock?.data?.attributes?.brand}
  </Descriptions.Item>
  <Descriptions.Item label="Image">
    <img
      src={`https://api.boki.fortesting.com.ua${lockData?.lock?.data?.attributes?.image?.data?.attributes?.url}`}
      alt="Lock"
      height={100}
    />
  </Descriptions.Item>
  </>
  )}
  </Descriptions>

  {/* Descriptions Hinge */}
  <Descriptions
  title='Hinge'
  column={4}
  layout="vertical"
  bordered
  style={{marginTop: '30px'}}
  >
  {hingeData && (
  <>
  <Descriptions.Item label="Title">
    {hingeData?.title}
  </Descriptions.Item>
  <Descriptions.Item label="Price">
    {hingeData?.price}
  </Descriptions.Item>
  <Descriptions.Item label="Brand">
    {hingeData?.hinge?.data?.attributes?.brand}
  </Descriptions.Item>
  <Descriptions.Item label="Image">
    <img
      src={`https://api.boki.fortesting.com.ua${hingeData?.hinge?.data?.attributes?.image?.data?.attributes?.url}`}
      alt="hinge"
      height={100}
    />
  </Descriptions.Item>
  </>
  )}
  </Descriptions>


  {/* Descriptions Knobe */}
  <Descriptions
  title='Knobe'
  column={4}
  layout="vertical"
  bordered
  style={{marginTop: '30px'}}
  >
  {knobeData && (
  <>
  <Descriptions.Item label="Title">
    {knobeData?.title}
  </Descriptions.Item>
  <Descriptions.Item label="Price">
    {knobeData?.price}
  </Descriptions.Item>
  <Descriptions.Item label="Brand">
    {knobeData?.knobe?.data?.attributes?.brand}
  </Descriptions.Item>
  <Descriptions.Item label="Image">
    <img
      src={`https://api.boki.fortesting.com.ua${knobeData?.knobe?.data?.attributes?.image?.data?.attributes?.url}`}
      alt="knobe"
      height={100}
    />
  </Descriptions.Item>
  </>
  )}
  </Descriptions>
  {/* </> */}

      {/* </div> */}
  
    </>


  );
};
