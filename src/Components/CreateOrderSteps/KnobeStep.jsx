import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Divider, Spin, message } from 'antd';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const KnobesStep = ({ setCurrentStepSend }) => {
  const [knobesData, setKnobesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('Airone');
  const [isLoading, setIsLoading] = useState(true);
  const [previousKnobeId, setPreviousKnobeId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  
  // const { order } = useOrder();
  // const orderId = order.id;
  // const orderIdToUse = orderID || orderId;
  // const knobeSuborder = order.suborders.find(suborder => suborder.name === 'knobeSub');
  const { knobeSuborderId } = useOrder();

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
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    // const storedBrand = localStorage.getItem('selectedBrandKnobe') || 'ALL';
    const storedBrand = localStorage.getItem('selectedBrandKnobe') || 'Airone';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();
  }, [jwtToken]);

  const brandOptions = [...new Set(knobesData.map(knob => knob.attributes.brand)), 'ALL'];

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

    const [form] = Form.useForm();

    const handleSbmitForm = async () => {
      const variables = {
        // "updateFrameFittingId": knobeSuborder.data.id,
        "updateFrameFittingId": knobeSuborderId,
        "data": {
          "knobe": previousKnobeId
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
        message.success(language.successQuery);
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            fittingKnobeSend: true
          };
        });
      })
      .catch((error) => {
        console.error('Ошибка:', error);
        message.error(language.errorQuery);
      });
    }
  
  
    useEffect(() => {
      setIsLoading(true);
  
      const variables = {
        // frameFittingId: knobeSuborder.data.id
        frameFittingId: knobeSuborderId
      };
  
      axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query GetFrameFitting($frameFittingId: ID) {
            frameFitting(id: $frameFittingId) {
              data {
                attributes {
                  knobe {
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
        const knobeId = response?.data?.data?.frameFitting?.data?.attributes?.knobe?.data?.id;
        if (knobeId) {
          setPreviousKnobeId(knobeId);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка:', error);
        setIsLoading(false);
      });
  
    // }, [jwtToken, knobeSuborder]);
    }, [jwtToken, knobeSuborderId]);

  return (
    <Form onFinish={handleSbmitForm} form={form}>

      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        <Input
          placeholder={language.search}
          addonBefore={language.searchBY}
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
        />

      <Form.Item 
        label={language.sorting}
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
        <Form.Item name="knobeStep" rules={[{ required: true, message: language.requiredField }]}>
          <Radio.Group>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((knob) => (
                <Radio key={knob.id} value={knob.id}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: '220px', 
                      margin: '20px 10px',
                      border:
                      previousKnobeId === knob.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={() => setPreviousKnobeId(knob.id)}
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
                  </Card>
                </Radio>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" htmlType="submit">
        {language.submit}
        </Button>
      </Form.Item>

    </Form>
  );
};

export default KnobesStep;
