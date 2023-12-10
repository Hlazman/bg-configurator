import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTotalOrder } from '../Context/TotalOrderContext';
import { OrderDetailsPage } from './OrderDetailsPage';
import html2pdf from 'html2pdf.js';
import { Button, Divider, Alert, Space, Select } from 'antd';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { useNavigate } from 'react-router-dom';
import { LeftCircleOutlined } from '@ant-design/icons';

export const TotalOrderDetailsPage = () => {
  const { Option } = Select;
  const [ordersCount, setOrdersCount] = useState([])
  const { totalOrderId } = useTotalOrder();
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [isCreatingTotalPdf, setIsCreatingTotalPdf] = useState(false);
  const navigate = useNavigate();


  const fetchData = async () => {
    try {
      const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query TotalOrder($totalOrderId: ID) {
            totalOrder(id: $totalOrderId) {
              data {
                id
                attributes {
                  orders {
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
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });


      const orders = response?.data?.data?.totalOrder?.data?.attributes?.orders?.data
      setOrdersCount(orders);
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }


  const handlePdfExport = async () => {
    setIsCreatingTotalPdf(true);
    const element = document.getElementById('pdf-content');
  
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


  useEffect(() => {
    fetchData();
  }, [totalOrderId]);


  const [currancyValue, setCurrancyValue] = useState('EUR');
  
  const totalCurrencyChange = (value) => {
    setCurrancyValue(value);
  }

  
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
            <Option value="USD">USD $</Option>
            <Option value="UAH">UAH ₴</Option>
          </Select>
        </Space>
        
        <Alert
          style={{marginBottom: '20px'}}
          description={language.exchangeRate}
          type="warning"
        />
      </div>

      <div id="pdf-content">
        <>
          {
            ordersCount.map(order => (
            <div key={order.id} style={{marginBottom: '20px'}}>
              <OrderDetailsPage 
                fromTotalOrder={order.id}
                isCreatingTotalPdf={isCreatingTotalPdf}
                orderName={order.id}
                currancyValue={currancyValue}
              />
            </div>
            ))
            }
        </>
      </div>
    </>
  );
};
