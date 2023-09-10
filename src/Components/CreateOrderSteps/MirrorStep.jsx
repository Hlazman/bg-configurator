import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';

const MirrorStep = ({ formData, handleCardClick, handleNext }) => {
  const [mirrorData, setMirrorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Mirrors {
                mirrors {
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
            `,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const mirrors = response.data.data.mirrors.data;
        setMirrorData(mirrors);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [jwtToken]);

  const filteredMirrorData = mirrorData.filter(mirror =>
    mirror.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item name="step2Field">
          <Radio.Group value={formData.step2Field}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredMirrorData.map(mirror => (
                <div key={mirror.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        formData.step2Field === mirror.id ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => handleCardClick('step2Field', mirror.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${mirror.attributes.image.data.attributes.url}`}
                        alt={mirror.attributes.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta title={mirror.attributes.title} style={{ paddingTop: '10px' }} />
                    <Radio value={mirror.id} style={{ display: 'none' }} />
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

export default MirrorStep;
