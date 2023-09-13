import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';
import { useProductVariant } from '../../Context/ProductVariantContext';

const SkirtingStep = ({ formData, handleNext }) => {
  const [veneerData, setVeneerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previousSkirtingId, setPreviousSkirtingId] = useState(null); 
  const { productVariantId } = useProductVariant();

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Skirtings {
                skirtings {
                  data {
                    id
                    attributes {
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
            `
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const skirtings = response.data.data.skirtings.data.map(skirting => ({
          ...skirting,
          id: skirting.id,
        }));
        setVeneerData(skirtings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const filteredImgs = veneerData
    .filter(skirting =>
      skirting.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(skirting => ({
      imgSrc: skirting.attributes.image.data.attributes.url,
      title: skirting.attributes.title,
      id: skirting.id,
    }));

  const handleSkirtingClick = async (fieldName, skirtingId) => {
    const updateProductVariantData = {
      updateProductVariantId: productVariantId,
      data: {
        skirting: skirtingId === previousSkirtingId ? null : skirtingId,
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

    setPreviousSkirtingId(skirtingId === previousSkirtingId ? null : skirtingId);

    formData['skirtingStep'] = productVariantId;
  };

  return (
    <Form onFinish={formData} onValuesChange={formData}>
      <div style={{ display: 'flex', gap: '30px' }}>
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>

      <Divider />

      {loading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="skirtingStep">
          <Radio.Group value={formData.skirtingStep}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((skirting) => (
                <div key={skirting.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                      previousSkirtingId === skirting.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={() => handleSkirtingClick('skirtingStep', skirting.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${skirting.imgSrc}`}
                        alt={skirting.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={skirting.title}
                      style={{ paddingTop: '10px' }}
                    />
                    <Radio value={skirting.id} style={{ display: 'none' }} />
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

export default SkirtingStep;