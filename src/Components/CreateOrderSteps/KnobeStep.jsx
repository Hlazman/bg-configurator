import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';
import { useProductVariant } from '../../Context/ProductVariantContext';

const KnobesStep = ({ formData, handleNext }) => {
  const [knobesData, setKnobesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [previousKnobId, setPreviousKnobId] = useState(null);
  const { productVariantId } = useProductVariant();

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
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

  const handleKnobClick = async (fieldName, knobId) => {
    const updateProductVariantData = {
      updateProductVariantId: productVariantId,
      data: {
        knobe: knobId === previousKnobId ? null : knobId,
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

    setPreviousKnobId(knobId === previousKnobId ? null : knobId);

    formData['knobeStep'] = productVariantId;
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
        <Form.Item name="knobeStep">
          <Radio.Group value={formData.knobeStep}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((knob) => (
                <div key={knob.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                      previousKnobId === knob.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={() => handleKnobClick('knobeStep', knob.id)}
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

      <Button type="primary" onClick={handleNext}>
        Далее
      </Button>
    </Form>
  );
};

export default KnobesStep;
