import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useTotalOrder } from '../Context/TotalOrderContext';
import { OrderDetailsPage } from './OrderDetailsPage';
import html2pdf from 'html2pdf.js';
import { Button, Divider, Alert, Space, Select, Descriptions, Image, Checkbox } from 'antd';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { useNavigate } from 'react-router-dom';
import { LeftCircleOutlined } from '@ant-design/icons';
import { AuthContext } from '../Context/AuthContext';
import { useSelectedCompany } from '../Context/CompanyContext';
import dayjs from 'dayjs';
import {queryLink, imageLink} from '../api/variables'
import {getCompanyData} from '../api/getCompanyData'

export const TotalOrderDetailsPage = () => {
  const { Option } = Select;
  const [ordersCount, setOrdersCount] = useState([]);
  const [totalOrderData, setTotalOrderData] = useState([]);
  const { totalOrderId } = useTotalOrder();
  const jwtToken = localStorage.getItem('token');
  const presentation = localStorage.getItem('presentation');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [isCreatingTotalPdf, setIsCreatingTotalPdf] = useState(false);
  const { user } = useContext(AuthContext);
  const { selectedCompany } = useSelectedCompany();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);

  const [hideDiscount, setHideDiscount] = useState(false);

  const handleCheckboxChange = (e) => {
    setHideDiscount(e.target.checked); 
  };

  const fetchData = async () => {
    try {
      const response = await axios.post(queryLink, {
        query: `
          query TotalOrder($totalOrderId: ID, $pagination: PaginationArg) {
            totalOrder(id: $totalOrderId) {
              data {
                id
                attributes {
                  totalCost
                  contacts {
                    address
                    city
                    country
                    zipCode
                  }
                  deliveryAt
                  discount
                  installationCost
                  installation
                  basicTotalPrice
                  tax
                  deliveryCost
                  totalCostWithoutTax
                  totalTax
                  orders(pagination: $pagination) {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          totalOrderId: totalOrderId ? totalOrderId : localStorage.getItem('TotalOrderId'),
          pagination: {
            "limit": 100
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });


      const orders = response?.data?.data?.totalOrder?.data?.attributes?.orders?.data;
      const totalOrderData = response?.data?.data?.totalOrder?.data?.attributes;
      setOrdersCount(orders);
      setTotalOrderData(totalOrderData);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  const embedImages = async () => {
    const images = document.querySelectorAll('img');
    const promises = Array.from(images).map(async (img) => {
      const src = img.src;
      const response = await fetch(src);
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      img.src = dataUrl;
    });

    await Promise.all(promises);
  };

  const handlePdfExport = async () => {
    setIsCreatingTotalPdf(true);
    const element = document.getElementById('pdf-content');
    await embedImages();
  
    await html2pdf()
      .from(element)
      .set({
        margin: [5, 0, 5, 0], 
        filename: `${localStorage.getItem('presentation')} Order ${totalOrderId ? totalOrderId : localStorage.getItem('TotalOrderId')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all', after: '#nextpage' }
      })
      .save();
      setIsCreatingTotalPdf(false);
  };

  const [totalCostWithoutTaxConverted, setTotalCostWithoutTaxConverted] = useState('');
  const [totalTaxConverted, seTotalTaxConverted] = useState('');
  // const [noTaxTotalCostConverted, setNoTaxTotalCostConverted] = useState('');
  // const [withTaxTotalCostConverted, setWithTaxTotalCostConverted] = useState('');
  const [totalCostConverted, setTotalCostConverted] = useState('');
  const [basicCostConverted, setBasicCostConverted] = useState('');
  const [installationPriceConverted, setInstallationPriceConverted] = useState('');
  const [deliveryPriceConverted, setDeliveryPriceConverted] = useState('');
  // const [exchangeRates, setExchangeRates] = useState(null);

  // const fetchExchangeRates = async () => {
  //   try {
  //     const response = await fetch(`https://open.er-api.com/v6/latest/${currancyValue}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch exchange rates');
  //     }
  //     const data = await response.json();
  //     setExchangeRates(data.rates);
  //   } catch (error) {
  //     console.error('Error fetching exchange rates:', error);
  //   }
  // };
  
  const convertCurrency = (price, selectedCurrency) => {
    // if (!exchangeRates || !selectedCurrency || !price) {
    //   return null;
    // }
  
    // const euroPrice = price / exchangeRates['EUR'];
    // const convertedPrice = euroPrice * exchangeRates[selectedCurrency];
  
    // return Math.ceil(convertedPrice);

    let convertedPrice;
    
    if (selectedCurrency === 'EUR') {
      convertedPrice = price; 
    } else if (selectedCurrency === 'PLN') {
      convertedPrice = price * 4.3; 
    }

    return Math.ceil(convertedPrice);
  };
  
  const handleCurrencyChange = async (value) => {
    const totalTax = convertCurrency(totalOrderData.totalTax, value);
    const CostWithoutTax = convertCurrency(totalOrderData.totalCostWithoutTax, value);
    // const priceNoTax = convertCurrency(totalOrderData?.totalCost - Math.ceil(totalOrderData?.totalCost / 100 * totalOrderData?.tax), value);
    // const priceWithTax = convertCurrency(Math.ceil(totalOrderData?.totalCost / 100 * totalOrderData?.tax), value);
    const totalPrice = convertCurrency(totalOrderData.totalCost, value);
    const basicPrice = convertCurrency(totalOrderData.basicTotalPrice, value);
    const installationPrice = convertCurrency(totalOrderData.installationCost, value);
    const deliveryPrice = convertCurrency(totalOrderData.deliveryCost, value);
  
    seTotalTaxConverted(totalTax)
    setTotalCostWithoutTaxConverted(CostWithoutTax)
    // setNoTaxTotalCostConverted(priceNoTax)
    // setWithTaxTotalCostConverted(priceWithTax);
    setTotalCostConverted(totalPrice);
    setBasicCostConverted(basicPrice);
    setInstallationPriceConverted(installationPrice)
    setDeliveryPriceConverted(deliveryPrice)
  };

  const [currancyValue, setCurrancyValue] = useState('EUR');
  
  const totalCurrencyChange = (value) => {
    setCurrancyValue(value);
    handleCurrencyChange(value);
  }

  // useEffect(() => {
  //   fetchExchangeRates();
  // }, []);

  
  useEffect(() => {
    fetchData();
    getCompanyData(jwtToken, selectedCompany, setCompanyData);
  }, [totalOrderId, selectedCompany, totalOrderData.totalTax]);

  return (
    <>
      <div style={{display: 'flex', gap: '20px', justifyContent: 'space-between', margin: '20px 50px'}}>
        <Button icon={<LeftCircleOutlined />} type="dashed" onClick={()=> navigate(`/orders`)}> {language.orderList} </Button>
        <Button type="primary" size={'large'} onClick={handlePdfExport}>{language.save} PDF</Button>
      </div>

      <Divider/>
      
      <div style={{width: '900px', margin: '0 auto'}}>
        <Space style={{display: 'flex', marginBottom: '20px', alignItems: 'baseline'}}>
          <p> {language.currency} </p>
          <Select
            style={{width: '100px'}}
            value={currancyValue}
            onChange={totalCurrencyChange}
          >
            <Option value="EUR">EUR €</Option>
            <Option value="PLN">PLN zł</Option>
            {/* <Option value="USD">USD $</Option> */}
            {/* <Option value="UAH">UAH ₴</Option> */}
          </Select>
        </Space>

        <Space style={{display: 'flex', marginBottom: '20px', alignItems: 'baseline'}}>
          <Checkbox onChange={handleCheckboxChange}>
              {language.hideDiscount}
            </Checkbox>
        </Space>
        
        <Alert
          style={{marginBottom: '20px'}}
          description={language.exchangeRate}
          type="warning"
        />
      </div>

      <div id="pdf-content" style={{margin: '0 20px'}}>
        <>
          {
            ordersCount.map((order, index) => (
            <div key={order.id} style={{marginBottom: '20px'}}>
              <OrderDetailsPage
                fromTotalOrder={order.id}
                isCreatingTotalPdf={isCreatingTotalPdf}
                orderName={order.id}
                currancyValue={currancyValue}
                imageIndex={index}
              />
            </div>
            ))
            }
        </>

        {(presentation === 'full' || presentation === 'short') && (
           <>
            <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px', maxWidth: '900px', margin: '0 auto'}}>
              <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
                {language.Order} {language.information}
              </p>

              <Descriptions
                column={4}
                layout="vertical"
                bordered
                size='small'
                >
                  <Descriptions.Item span={2} className='labelBG' label={language.shippingAddress} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {`${totalOrderData?.contacts?.address}, ${totalOrderData?.contacts?.country}, ${totalOrderData?.contacts?.city}, ${totalOrderData?.contacts?.zipCode}`}
                  </Descriptions.Item>

                  <Descriptions.Item span={2} className='labelBG' label={language.deliveryAt} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {dayjs(totalOrderData?.deliveryAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>

                  <Descriptions.Item span={2} className='labelBG' label={`${language.delivery} ${language.cost}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {deliveryPriceConverted ? `${deliveryPriceConverted} ${currancyValue}` : `${totalOrderData?.deliveryCost} ${currancyValue}`}
                  </Descriptions.Item>

                  <Descriptions.Item span={2} className='labelBG' label={`${language.installation} ${language.cost}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {installationPriceConverted ? `${installationPriceConverted} ${currancyValue}` : `${totalOrderData?.installationCost} ${currancyValue}`}
                  </Descriptions.Item>

                  <Descriptions.Item className='labelBG' label={`${language.price} ${language.net}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {/* {noTaxTotalCostConverted ? `${noTaxTotalCostConverted} ${currancyValue}` : `${totalOrderData?.totalCost - Math.ceil(totalOrderData?.totalCost / 100 * totalOrderData?.tax)} ${currancyValue}`} */}
                    {/* {`${totalCostWithoutTaxConverted} ${currancyValue}`} */}
                    {totalCostWithoutTaxConverted ? `${totalCostWithoutTaxConverted} ${currancyValue}` : `${totalOrderData?.totalCostWithoutTax} ${currancyValue}`}
                  </Descriptions.Item>

                  <Descriptions.Item className='labelBG' label={`${language.tax}: ${totalOrderData?.tax}%`} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {/* {withTaxTotalCostConverted ? `${withTaxTotalCostConverted} ${currancyValue}` : `${Math.ceil(totalOrderData?.totalCost / 100 * totalOrderData?.tax)} ${currancyValue}`} */}
                    {totalTaxConverted ? `${totalTaxConverted} ${currancyValue}` : `${totalOrderData?.totalTax} ${currancyValue}`}
                  </Descriptions.Item>

                  {/* <Descriptions.Item className='labelBG' label={`${language.discount} %`} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {totalOrderData?.discount ? totalOrderData?.discount: 0}
                  </Descriptions.Item> */}

                {!hideDiscount && (
                  <Descriptions.Item className='labelBG' label={`${language.discount} %`} labelStyle={{ fontWeight: '600', color: '#000' }}>
                    {totalOrderData?.discount ? totalOrderData?.discount : 0}
                  </Descriptions.Item>
                )}

                  <Descriptions.Item className='labelBG' label={`${language.price} ${language.gross}`} labelStyle={{fontWeight: '600', color:'#000'}}>
                    {totalCostConverted ? `${totalCostConverted} ${currancyValue}` : `${totalOrderData?.totalCost} ${currancyValue}`}
                  </Descriptions.Item>

              </Descriptions>
            </div>
           </>
          )}
        
        {presentation === 'full' && (
          <p style={{margin: '30px 15px 15px', textAlign: 'left' }}> 
          <span style={{color: 'red', fontWeight: 'bold'}}> * </span> {language.colorWarn}
        </p>
        )}

        {presentation === 'factory' && (
          <>
          <div style={{padding: '15px', backgroundColor: '#FFF', borderRadius: '15px', maxWidth: '900px', margin: '0 auto'}}>
            <p style={{fontWeight: '500', padding: '10px', backgroundColor: '#f06d20', color: '#FFF'}}> 
              {language.Order} {language.information}
            </p>

            <Descriptions
              column={1}
              layout="vertical"
              bordered
              size='small'
              >
                <Descriptions.Item className='labelBG' label={language.totalCost} labelStyle={{fontWeight: '600', color:'#000'}}>
                  {basicCostConverted ? `${basicCostConverted} ${currancyValue}` : `${totalOrderData?.basicTotalPrice} ${currancyValue}`}
                </Descriptions.Item>

            </Descriptions>
          </div>
          </>
        )}

        <Divider/>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          {(presentation === 'full' || presentation === 'short') && (
          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '20px', backgroundColor: '#FFF', padding: '15px', borderRadius: '15px'}}>
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
              <Descriptions.Item label={`${language.order} #`} labelStyle={{fontWeight: '600', color:'#f06d20'}}> {`${localStorage.getItem('TotalOrderId')}`}</Descriptions.Item>
            </Descriptions>
          </div>
          )}
        </div>
      </div>
    </>
  );
};
