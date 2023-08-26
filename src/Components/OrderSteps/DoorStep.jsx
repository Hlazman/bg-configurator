import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin } from 'antd';
import axios from 'axios';

const DoorStep = ({ formData, handleCardClick, handleNext }) => {
  const [doorData, setDoorData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true); // New state for loading

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              {
                doors(
                  pagination: { limit: 100 },
                  sort: ["ASC"],
                  publicationState: LIVE
                ){
                  data{
                    id
                    attributes{
                      __typename
                      collection
                      product_properties{
                        id
                        title
                        image{
                          data{
                            id
                            attributes{
                              url
                              name
                              previewUrl
                            }
                          }
                        }
                        description
                      }
                    }
                  }
                }
              }
            `,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const doors = response.data.data.doors.data;
        setDoorData(doors);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false); // Set loading to false after fetching
    };

    const storedCollection = localStorage.getItem('selectedCollection') || 'ALL';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedCollection(storedCollection);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const collectionOptions = ['ALL', ...new Set(doorData.map(door => door.attributes.collection))];

  const handleCollectionChange = value => {
    localStorage.setItem('selectedCollection', value);
    setSelectedCollection(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgS = doorData
    .filter(door =>
      (selectedCollection === 'ALL' || door.attributes.collection === selectedCollection) &&
      door.attributes.product_properties.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(door => door.attributes.product_properties.image.data.attributes.url);

  return (
    <Form onFinish={formData} onValuesChange={formData}>
      <div style={{ display: 'flex', gap: '30px' }}>
        <Select
          value={selectedCollection}
          onChange={handleCollectionChange}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          {collectionOptions.map((collection, index) => (
            <Select.Option key={index} value={collection}>
              {collection}
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
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item name="step1Field">
          <Radio.Group value={formData.step1Field}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgS.map((imgSrc, index) => {
                const door = doorData.find(
                  door =>
                    door.attributes.product_properties.image.data.attributes.url === imgSrc
                );
                return (
                  <div key={index} style={{ width: 220, margin: '20px 10px' }}>
                    <Card
                      className="custom-card"
                      hoverable
                      style={{
                        border:
                          formData.step1Field === `image${index + 1}.webp`
                            ? '7px solid #f06d20'
                            : 'none',
                      }}
                      onClick={() => handleCardClick('step1Field',`image${index + 1}.webp`)}
                    >
                      <div style={{ overflow: 'hidden', height: 220 }}>
                        <img
                          src={`https://api.boki.fortesting.com.ua${imgSrc}`}
                          alt={door.attributes.product_properties.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <Card.Meta
                        title={door.attributes.product_properties.title}
                        style={{ paddingTop: '10px' }}
                      />
                      <Radio value={`image${index + 1}.webp`} style={{ display: 'none' }} />
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

export default DoorStep;
