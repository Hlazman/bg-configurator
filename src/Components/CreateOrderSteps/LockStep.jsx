import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const LockStep = ({ orderID }) => {
  const [lockData, setLockData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [previousLockId, setPreviousLockId] = useState(null); 

  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const lockSuborder = order.suborders.find(suborder => suborder.name === 'lockSub');

  const { lockSuborderId } = useOrder();

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Locks($pagination: PaginationArg) {
                locks(pagination: $pagination) {
                  data {
                    id
                    attributes {
                      brand
                      title
                      image {
                        data {
                          attributes {
                            url
                          }
                        }
                      }
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

        const locks = response.data.data.locks.data.map(lock => ({
          ...lock,
          id: lock.id,
        }));
        setLockData(locks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    const storedBrand = localStorage.getItem('selectedBrandLock') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const brandOptions = ['ALL', ...new Set(lockData.map(lock => lock.attributes.brand))];

  const handleBrandChange = value => {
    localStorage.setItem('selectedBrandLock', value);
    setSelectedBrand(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredLocks = lockData
    .filter(lock =>
      (selectedBrand === 'ALL' || lock.attributes.brand === selectedBrand) &&
      (lock.attributes.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(lock => ({
      imgSrc: lock.attributes.image.data.attributes.url,
      title: lock.attributes.title,
      id: lock.id,
    }));

  const handleSbmitForm = async () => {    
    const variables = {
      // "updateFrameFittingId": lockSuborder.data.id,
      "updateFrameFittingId": lockSuborderId,
      "data": {
        "lock": previousLockId
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
      // frameFittingId: lockSuborder.data.id
      frameFittingId: lockSuborderId
    };

    axios.post('https://api.boki.fortesting.com.ua/graphql', {
      query: `
        query GetFrameFitting($frameFittingId: ID) {
          frameFitting(id: $frameFittingId) {
            data {
              attributes {
                lock {
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
      const lockId = response?.data?.data?.frameFitting?.data?.attributes?.lock?.data?.id;
      if (lockId) {
        setPreviousLockId(lockId);
      }
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      setIsLoading(false);
    });

  // }, [jwtToken, lockSuborder]);
  }, [jwtToken, lockSuborderId]);

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
        <Form.Item name="lockStep">
          <Radio.Group >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredLocks.map((lock) => (
                <div key={lock.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                      previousLockId === lock.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={() => setPreviousLockId(lock.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${lock.imgSrc}`}
                        alt={lock.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={lock.title}
                      style={{ paddingTop: '10px' }}
                    />
                    <Radio value={lock.id} style={{ display: 'none' }} />
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

export default LockStep;
