import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useProductVariant } from '../../Context/ProductVariantContext';

const LockStep = ({ formData, handleNext }) => {
  const [lockData, setLockData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [previousLockId, setPreviousLockId] = useState(null); 
  const { productVariantId } = useProductVariant();

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
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

  const handleLockClick = async (fieldName, lockId) => {
    const updateProductVariantData = {
      updateProductVariantId: productVariantId,
      data: {
        lock: lockId === previousLockId ? null : lockId,
      },
    };

    await axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
      {
        query: `
          mutation UpdateProductVariant($updateProductVariantId: ID!, $data: ProductVariantInput!) {
            updateProductVariant(id: $updateProductVariantId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: updateProductVariantData,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    setPreviousLockId(lockId === previousLockId ? null : lockId);

    formData['lockStep'] = productVariantId;
  };

  return (
    <Form onFinish={formData} onValuesChange={formData}>
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

      {loading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="lockStep">
          <Radio.Group value={formData.lockStep}>
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
                    onClick={() => handleLockClick('lockStep', lock.id)}
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

      <Button type="primary" onClick={handleNext}>
        Далее
      </Button>
    </Form>
  );
};

export default LockStep;
