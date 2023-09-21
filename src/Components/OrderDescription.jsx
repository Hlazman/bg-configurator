import React, { useState, useContext, useEffect } from 'react';
import {Descriptions, Card, Image} from 'antd';
import dayjs from 'dayjs';
import { AuthContext } from '../Context/AuthContext';
import logo from '../logo.svg';
import bg from '../bg.svg';

export const OrderDescription = (
  {orderData, orderId, frameData, doorData, elementData, lockData, hingeData, knobeData}
  ) => {
  const { user } = useContext(AuthContext);

    if (!orderData) {
    return null;
  }

  return (
    <>
      <div 
        style={
          {display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '20px', textAlign: 'left'}
        }
      >
      <Image
          width={100}
          src={`${logo}`}
          preview={false}
        />

        <div>
          <p> Company</p>
          <p> Manager: {`${user.username}`}</p>
        </div>
      </div>
<>
      {/* Descriptions Order */}
      <Descriptions
        title={`Order ${orderId} Details`} 
        column={4} 
        layout="vertical"
        bordered
      >
        <Descriptions.Item label="Double door">
          {orderData?.double_door ? 'Yes' : 'No'}
        </Descriptions.Item>

        <Descriptions.Item label="Discount">
          {orderData?.discount}
        </Descriptions.Item>

        <Descriptions.Item label="Delivery At">
          {dayjs(orderData?.deliveryAt).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>

        <Descriptions.Item label="Currency">
          {orderData?.currency}
        </Descriptions.Item>

        <Descriptions.Item label="Hidden">
          {orderData?.hidden ? 'Yes' : 'No'}
        </Descriptions.Item>

        <Descriptions.Item label="Opening">
          {orderData?.opening}
        </Descriptions.Item>

        <Descriptions.Item label="Shipping Address">
          {`${orderData?.shippingAddress?.address} ${orderData?.shippingAddress?.country} ${orderData?.shippingAddress?.city} ${orderData?.shippingAddress?.zipCode}`}
        </Descriptions.Item>

        <Descriptions.Item label="Side">
          {orderData?.side}
        </Descriptions.Item>

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
      <Descriptions
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
          </>
        )}
      </Descriptions>

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
    </>
   </>

  );
};
