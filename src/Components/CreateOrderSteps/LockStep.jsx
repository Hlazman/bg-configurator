import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin, message } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';

const LockStep = ({ orderID }) => {
  const [lockData, setLockData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('Polaris');
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

    // const storedBrand = localStorage.getItem('selectedBrandLock') || 'ALL';
    const storedBrand = localStorage.getItem('selectedBrandLock') || 'Polaris';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  // const brandOptions = ['ALL', ...new Set(lockData.map(lock => lock.attributes.brand))];
  const brandOptions = [...new Set(lockData.map(lock => lock.attributes.brand)), 'ALL',];

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

  const [form] = Form.useForm();
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
      message.success('Lock added successfully!');
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      message.error('Error to add Lock');
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
    <Form onFinish={handleSbmitForm} form={form}>

    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <Input
        placeholder="Search"
        addonBefore="Search by lock name"
        value={searchQuery}
        onChange={e => handleSearchQueryChange(e.target.value)}
        style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
        />
      
      <Form.Item 
        label="Sorting by brands"
        style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
      >
        <Select
          value={selectedBrand}
          onChange={handleBrandChange}
        >
          {brandOptions.map((brand, index) => (
            <Select.Option key={index} value={brand}>
              {brand}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="lockStep" rules={[{ required: true, message: "Please choose Lock" }]}>
          <Radio.Group >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredLocks.map((lock) => (
                <Radio key={lock.id} value={lock.id}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: '220px', 
                      margin: '20px 10px',
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

export default LockStep;
