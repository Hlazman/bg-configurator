import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useProductVariant } from '../../Context/ProductVariantContext';

const HingeStep = ({ formData, handleNext }) => {
  const [hingeData, setHingeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [previousHingeId, setPreviousHingeId] = useState(null); 
  const { productVariantId } = useProductVariant();

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    const storedBrand = localStorage.getItem('selectedBrandHinge') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

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

    const handleHingeClick = async (fieldName, hingeId) => {
      console.log(productVariantId)
      const updateProductVariantData = {
        updateProductVariantId: productVariantId, // Используем productVariantId
        data: {
          // hinge: hingeId,
          hinge: hingeId === previousHingeId ? null : hingeId,
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
  
      setPreviousHingeId(hingeId === previousHingeId ? null : hingeId);
  
      formData[fieldName] = productVariantId;
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
        <Form.Item name="hingesStep">
          <Radio.Group value={formData.hingesStep}>
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
                    onClick={() => handleHingeClick('hingesStep', hinge.id)}
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

      <Button type="primary" onClick={handleNext}>
        Далее
      </Button>
    </Form>
  );
};

export default HingeStep;
