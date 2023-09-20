import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const HingeStep = ({ orderID }) => {
  const [hingeData, setHingeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [previousHingeId, setPreviousHingeId] = useState(null); 

  const [selectedHingeId, setSelectedHingeId] = useState(null);

  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const hingeSuborder = order.suborders.find(suborder => suborder.name === 'hingeSub');
  const { hingeSuborderId } = useOrder();

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Hinges($pagination: PaginationArg) {
                hinges(pagination: $pagination) {
                  data {
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

        const hinges = response.data.data.hinges.data.map(hinge => ({
          ...hinge,
          id: hinge.id,
        }));
        setHingeData(hinges);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    const storedBrand = localStorage.getItem('selectedBrandHinge') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken, hingeSuborderId]);

  const brandOptions = ['ALL', ...new Set(hingeData.map(hinge => hinge.attributes.brand))];

  const handleBrandChange = value => {
    localStorage.setItem('selectedBrandHinge', value);
    setSelectedBrand(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgs = hingeData
    .filter(hinge =>
      (selectedBrand === 'ALL' || hinge.attributes.brand === selectedBrand) &&
      hinge.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(hinge => ({
      imgSrc: hinge.attributes.image.data.attributes.url,
      title: hinge.attributes.title,
      brand: hinge.attributes.brand,
      id: hinge.id,
    }));

    const handleSbmitForm = async () => {    
      const variables = {
        // "updateFrameFittingId": hingeSuborder.data.id,
        "updateFrameFittingId": hingeSuborderId,
        "data": {
          "hinge": previousHingeId
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
        // frameFittingId: hingeSuborder.data.id
        frameFittingId: hingeSuborderId
      };
  
      axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query GetFrameFitting($frameFittingId: ID) {
            frameFitting(id: $frameFittingId) {
              data {
                attributes {
                  hinge {
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
        const hingeId = response?.data?.data?.frameFitting?.data?.attributes?.hinge?.data?.id;
        if (hingeId) {
          setPreviousHingeId(hingeId);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка:', error);
        setIsLoading(false);
      });
  
    // }, [jwtToken, hingeSuborder]);
    }, [jwtToken, hingeSuborderId]);

  return (
    <Form onFinish={handleSbmitForm}>

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
        <Form.Item name="hingesStep">
          <Radio.Group >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((hinge) => (
                <div key={hinge.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        previousHingeId === hinge.id
                          ? '7px solid #f06d20'
                          : 'none',
                    }}
                    onClick={() => setPreviousHingeId(hinge.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${hinge.imgSrc}`}
                        alt={hinge.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={hinge.title}
                      description={hinge.brand}
                      style={{ paddingTop: '10px' }}
                    />
                    <Radio value={hinge.id} style={{ display: 'none' }} />
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

export default HingeStep;
