import React from 'react';
import { Collapse, Image, Divider } from 'antd';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import clients_1 from '../Instructions/clients_1.png';
import clients_2 from '../Instructions/clients_2.png';
import createClient from '../Instructions/createClient.png';
import orders_1 from '../Instructions/orders_1.png';
import orders_2 from '../Instructions/orders_2.png';
import decor_1 from '../Instructions/decor_1.png';
import decor_2 from '../Instructions/decor_2_paint.png';
import decor_3 from '../Instructions/decor_3.png';
import door_1 from '../Instructions/door_1.png';
import door_2 from '../Instructions/door_2.png';
import elements_1 from '../Instructions/elements_1.png';
import elements_2 from '../Instructions/elements_2_individual.png';
import elements_3 from '../Instructions/elements_3_individual.png';
import elements_4 from '../Instructions/elements_4_delete.png';
import fittings from '../Instructions/fittings.png';
import frame from '../Instructions/frame.png';
import information from '../Instructions/information.png';
import options_1 from '../Instructions/options_1.png';
import options_2 from '../Instructions/options_2.png';
import startData from '../Instructions/startData.png';
import createOrderHeader from '../Instructions/createOrderHeader.png'; 
import createOrderDetails from '../Instructions/createOrderDetails.png'; 
import createColor from '../Instructions/createColor.png'; 


export const FilesPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  return (
    <Collapse
      style={{marginTop: '30px', textAlign: 'left'}} 
      // items={items} 
      items={[
        {
          key: '1',
          label: `${language.createOrder}: ${language.orderDetails}, ${language.createColor}`,
          children: (
            <>
            <Image.PreviewGroup>
              <Image className='imgInPreview' alt='screenshot' src={createOrderHeader} />
              <Image className='imgInPreview' alt='screenshot' src={createOrderDetails} />
              <Image className='imgInPreview' alt='screenshot' src={createColor} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '2',
          label: `${language.createOrder}: ${language.startData}`,
          children: (
            <>
            <Image.PreviewGroup >
            <Image className='imgInPreview' alt='screenshot' src={startData} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '3',
          label: `${language.createOrder}: ${language.door}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={door_1} />
              <Image className='imgInPreview' alt='screenshot' src={door_2} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '4',
          label: `${language.createOrder}: ${language.decor}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={decor_1} />
              <Image className='imgInPreview' alt='screenshot' src={decor_2} />
              <Image className='imgInPreview' alt='screenshot' src={decor_3} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '5',
          label: `${language.createOrder}: ${language.frame}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={frame} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '6',
          label: `${language.createOrder}: ${language.elements}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={elements_1} />
              <Image className='imgInPreview' alt='screenshot' src={elements_2} />
              <Image className='imgInPreview' alt='screenshot' src={elements_3} />
              <Image className='imgInPreview' alt='screenshot' src={elements_4} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '7',
          label: `${language.createOrder}: ${language.fitting}`,
          children: (
            <>
            <Image.PreviewGroup >
            <Image className='imgInPreview' alt='screenshot' src={fittings} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '8',
          label: `${language.createOrder}: ${language.options}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={options_1} />
              <Image className='imgInPreview' alt='screenshot' src={options_2} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '9',
          label: `${language.createOrder}: ${language.information}`,
          children: (
            <>
            <Image.PreviewGroup >
            <Image className='imgInPreview' alt='screenshot' src={information} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '10',
          label: `${language.createClient}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={createClient} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '11',
          label: `${language.orders}`,
          children: (
            <>
            <Image.PreviewGroup >
              <Image className='imgInPreview' alt='screenshot' src={orders_1} />
              <Image className='imgInPreview' alt='screenshot' src={orders_2} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
        {
          key: '12',
          label: `${language.clients}`,
          children: (
            <>
            <Image.PreviewGroup >
            <Image className='imgInPreview' alt='screenshot' src={clients_1} />
            <Image className='imgInPreview' alt='screenshot' src={clients_2} />
            </Image.PreviewGroup>
            <Divider />
            <p>{language.headerText}</p>
            </>
          )
        },
      ]} 
    />
  )
};