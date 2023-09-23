import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const VeneerStep = ({ orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm }) => {
  const [veneerData, setVeneerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isloading, setIsLoading] = useState(true);  
  const jwtToken = localStorage.getItem('token');
  const [previousVeneerTitle, setPreviousVeneerTitle] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const doorSuborder = order.suborders.find(suborder => suborder.name === 'doorSub');
  const { orderId, dorSuborderId} = useOrder();
  const orderIdToUse = orderId;

  const [form] = Form.useForm();
  const onFinish = async () => {
    sendDecorForm(orderIdToUse, dorSuborderId, selectedDecorId);
  };

  // const categoryOptions = ['ALL', ...new Set(veneerData.map(veneer => veneer.attributes.category))];
  const categoryOptions = [...new Set(veneerData.map(veneer => veneer.attributes.category)), 'ALL'];

  const handleCategoryChange = value => {
    localStorage.setItem('selectedCategory', value);
    setSelectedCategory(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgs = veneerData
    .filter(veneer =>
      (selectedCategory === 'ALL' || veneer.attributes.category === selectedCategory) &&
      (veneer.attributes.main_properties.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       veneer.attributes.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(veneer => ({
      imgSrc: veneer.attributes.main_properties.image.data.attributes.url,
      title: veneer.attributes.main_properties.title,
      description: veneer.attributes.code,
      id: veneer.id,
      productId: veneer.producId, // new
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Veneers($pagination: PaginationArg) {
                veneers(pagination: $pagination) {
                  data {
                    attributes {
                      category
                      code
                      main_properties {
                        title
                        id
                        image {
                          data {
                            attributes {
                              url
                            }
                          }
                        }
                      }
                    }
                    id
                  }
                }
              }
            `,
            variables: {
              pagination: {
                limit: 100
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const veneers = response.data.data.veneers.data.map(veneer => ({
          ...veneer,
          id: veneer.attributes.main_properties.id,
          producId: veneer.id,
        }));
        setVeneerData(veneers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    // const storedCategory = localStorage.getItem('selectedCategory') || 'ALL';
    const storedCategory = localStorage.getItem('selectedCategory') || 'lacquer_1';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedCategory(storedCategory);
    setSearchQuery(storedSearchQuery);

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousVeneerTitle, 'veneer');
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

  return (
    <Form onFinish={onFinish} form={form}> 

      <Input
        placeholder="Search"
        addonBefore="Search by veener name"
        value={searchQuery}
        onChange={e => handleSearchQueryChange(e.target.value)}
        style={{ marginBottom: '10px' }}
      />

      {/* <div style={{ display: 'flex', gap: '30px' }}> */}
      <Form.Item label="Sorting by Category">
        <Select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {categoryOptions.map((category, index) => (
            <Select.Option key={index} value={category}>
              {category}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>

      {/* </div> */}

      {/* <Divider /> */}

      {isloading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="veneerRadio" rules={[{ required: true, message: "Please choose decor" }]}>
          <Radio.Group >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((veneer) => (
                // <div key={veneer.id} style={{ width: 220, margin: '20px 10px' }}>
                <Radio key={veneer.id} value={veneer.id}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: '200px', 
                      margin: '20px 10px',
                      border:
                        previousVeneerTitle === veneer.title
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={async () => {
                      await checkDecor('veneer', veneer.title, decorData, setSelectedDecorId, veneer.productId);
                      await setPreviousVeneerTitle(veneer.title);
                    }}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${veneer.imgSrc}`}
                        alt={veneer.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={veneer.title}
                      description={veneer.description}
                      style={{ paddingTop: '10px' }}
                    />
                    {/* <Radio value={veneer.id} style={{ display: 'none' }} /> */}
                  </Card>
                </Radio>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

    </Form>
  );
};

export default VeneerStep;
