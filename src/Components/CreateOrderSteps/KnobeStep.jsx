import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const KnobesStep = ({ orderID }) => {
  const [knobesData, setKnobesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [previousKnobeId, setPreviousKnobeId] = useState(null);

  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const knobeSuborder = order.suborders.find(suborder => suborder.name === 'knobeSub');
  const { knobeSuborderId } = useOrder();

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Knobes($pagination: PaginationArg) {
                knobes(pagination: $pagination) {
                  data {
                    id
                    attributes {
                      brand
                      image {
                        data {
                          attributes {
                            url
                          }
                        }
                      }
                      title
                    }
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

        const knobes = response.data.data.knobes.data;
        setKnobesData(knobes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    const storedBrand = localStorage.getItem('selectedBrandKnobe') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const brandOptions = ['ALL', ...new Set(knobesData.map(knob => knob.attributes.brand))];

  const handleBrandChange = value => {
    localStorage.setItem('selectedBrandKnobe', value);
    setSelectedBrand(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgs = knobesData
    .filter(knob =>
      (selectedBrand === 'ALL' || knob.attributes.brand === selectedBrand) &&
      knob.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(knob => ({
      imgSrc: knob.attributes.image.data.attributes.url,
      title: knob.attributes.title,
      id: knob.id,
    }));

    const handleSbmitForm = async () => {    
      const variables = {
        // "updateFrameFittingId": knobeSuborder.data.id,
        "updateFrameFittingId": knobeSuborderId,
        "data": {
          "knobe": previousKnobeId
        }
      };
  
      axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation UpdateFrameFitting($updateFrameFittingId: ID!, $data: FrameFittingInput!) {
              updateFrameFitting(id: $updateFrameFittingId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        console.log('Успешный ответ:', response.data);
      })
      .catch((error) => {
        console.error('Ошибка:', error);
      });
    }
  
  
    useEffect(() => {
      setIsLoading(true);
  
      const variables = {
        // frameFittingId: knobeSuborder.data.id
        frameFittingId: knobeSuborderId
      };
  
      axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query GetFrameFitting($frameFittingId: ID) {
            frameFitting(id: $frameFittingId) {
              data {
                attributes {
                  knobe {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        const knobeId = response?.data?.data?.frameFitting?.data?.attributes?.knobe?.data?.id;
        if (knobeId) {
          setPreviousKnobeId(knobeId);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка:', error);
        setIsLoading(false);
      });
  
    // }, [jwtToken, knobeSuborder]);
    }, [jwtToken, knobeSuborderId]);

  return (
    <Form onFinish={handleSbmitForm} >

<Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>


      <div style={{ display: 'flex', gap: '30px' }}>
        <Select
          value={selectedBrand}
          onChange={handleBrandChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {brandOptions.map((brand, index) => (
            <Select.Option key={index} value={brand}>
              {brand}
            </Select.Option>
          ))}
        </Select>

        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>

      <Divider />

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="knobeStep">
          <Radio.Group>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((knob) => (
                <div key={knob.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                      previousKnobeId === knob.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={() => setPreviousKnobeId(knob.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 120 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${knob.imgSrc}`}
                        alt={knob.title}
                        style={{ width: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={knob.title}
                      style={{ paddingTop: '10px' }}
                    />
                    <Radio value={knob.id} style={{ display: 'none' }} />
                  </Card>
                </div>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}
    </Form>
  );
};

export default KnobesStep;
