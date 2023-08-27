import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';

const PaintStep = ({ formData, handleCardClick, handleNext }) => {
  const [paintData, setPaintData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorGroup, setSelectedColorGroup] = useState('ALL');
  const [selectedColorRange, setSelectedColorRange] = useState('RAL');
  const [isLoading, setIsLoading] = useState(true); // New state for loading indicator

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Data($pagination: PaginationArg) {
                paints(pagination: $pagination) {
                  data {
                    id
                    attributes {
                      color_code
                      color_group
                      color_range
                      main_properties {
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
              }
            `,
            variables: {
              pagination: {
                limit: 300,
              },
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const paints = response.data.data.paints.data;
        setPaintData(paints);
        setIsLoading(false); // Data is fetched, loading is complete
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const storedColorGroup = localStorage.getItem('selectedColorGroup') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedColorGroup(storedColorGroup);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const colorGroupOptions = ['ALL', ...new Set(paintData.map(paint => paint.attributes.color_group))];
  const colorRangeOptions = [...new Set(paintData.map(paint => paint.attributes.color_range))];

  const handleColorGroupChange = value => {
    localStorage.setItem('selectedColorGroup', value);
    setSelectedColorGroup(value);
    setSearchQuery('');
  };

  const handleColorRangeChange = value => {
    setSelectedColorRange(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImages = paintData
    .filter(paint =>
      (selectedColorGroup === 'ALL' || paint.attributes.color_group === selectedColorGroup) &&
      paint.attributes.color_range === selectedColorRange &&
      paint.attributes.color_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(paint => paint.attributes.main_properties.image.data.attributes.url);

  return (
    <Form onFinish={formData} onValuesChange={formData}>
      <div style={{ display: 'flex', gap: '30px' }}>
        <Select
          value={selectedColorGroup}
          onChange={handleColorGroupChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {colorGroupOptions.map((colorGroup, index) => (
            <Select.Option key={index} value={colorGroup}>
              {colorGroup}
            </Select.Option>
          ))}
        </Select>

        <Select
          value={selectedColorRange}
          onChange={handleColorRangeChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {colorRangeOptions.map((colorRange, index) => (
            <Select.Option key={index} value={colorRange}>
              {colorRange}
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

      {isLoading ? ( // Display Spin component while loading
        <Spin size="large" />
      ) : (
        <Form.Item name="step2Field">
          <Radio.Group value={formData.step2Field}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImages.map((imgSrc) => {
                const paint = paintData.find(
                  paint =>
                    paint.attributes.main_properties.image.data.attributes.url === imgSrc
                );
                return (
                  <div key={paint.id} style={{ width: 220, margin: '20px 10px' }}>
                    <Card
                      className="custom-card"
                      hoverable
                      style={{
                        border:
                          formData.step2Field === paint.id
                            ? '7px solid #f06d20'
                            : 'none',
                      }}
                      onClick={() => handleCardClick('step2Field', paint.id)}
                    >
                      <div style={{ overflow: 'hidden', height: 120 }}>
                        <img
                          src={`https://api.boki.fortesting.com.ua${imgSrc}`}
                          alt={paint.attributes.color_code}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <Card.Meta
                        title={paint.attributes.color_code}
                        style={{ paddingTop: '10px' }}
                      />
                      <Radio value={paint.id} style={{ display: 'none' }} />
                    </Card>
                  </div>
                );
              })}
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

export default PaintStep;
