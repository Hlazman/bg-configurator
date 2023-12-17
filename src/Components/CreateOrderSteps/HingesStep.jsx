import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, message, Affix, InputNumber } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const HingeStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [hingeData, setHingeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Anselmi');
  const [isLoading, setIsLoading] = useState(true);
  const [previousHingeId, setPreviousHingeId] = useState(null); 
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [hingeAmount, setHingeAmount] = useState(1)
  const { hingeSuborderId } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const [btnColor, setBtnColor] = useState('#ff0505');

  const handleHingeAmount = (value) => {
    setHingeAmount(value)
  }

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
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    const storedBrand = localStorage.getItem('selectedBrandHinge') || 'Anselmi';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();

    if (currentStepSend && currentStepSend.fittingHingeSend) {
      setBtnColor('#4BB543');
    }
  }, [jwtToken, hingeSuborderId]);

  const brandOptions = [...new Set(hingeData.map(hinge => hinge.attributes.brand)), language.all];

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
      (selectedBrand === language.all || hinge.attributes.brand === selectedBrand) &&
      hinge.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(hinge => ({
      imgSrc: hinge.attributes.image.data.attributes.url,
      title: hinge.attributes.title,
      brand: hinge.attributes.brand,
      id: hinge.id,
    }));

    const [form] = Form.useForm();

    const handleSbmitForm = async () => {
      const variables = {
        "updateFrameFittingId": hingeSuborderId,
        "data": {
          "hinge": previousHingeId,
          'custom_amount': hingeAmount,
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
        messageApi.success(language.successQuery);
        if (setCurrentStepSend) {
          setCurrentStepSend(prevState => {
            return {
              ...prevState,
              fittingHingeSend: true
            };
          });
        }
        setBtnColor('#4BB543');
      })
      .catch((error) => {
        messageApi.error(language.errorQuery);
      });
    }
  
    useEffect(() => {
      setIsLoading(true);
  
      const variables = {
        frameFittingId: hingeSuborderId,
      };
  
      axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query GetFrameFitting($frameFittingId: ID) {
            frameFitting(id: $frameFittingId) {
              data {
                attributes {
                  amount
                  hinge {
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
        const hingeId = response?.data?.data?.frameFitting?.data?.attributes?.hinge?.data?.id;
        const amount = response?.data?.data?.frameFitting?.data?.attributes?.amount;

        if (hingeId) {
          setPreviousHingeId(hingeId);
        }

        if (amount) {
          setHingeAmount(amount)
        }

        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  
    }, [jwtToken, hingeSuborderId]);

  return (
    <Form onFinish={handleSbmitForm} form={form}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-60px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.hinges}`}
        </Button>
      </Affix>

    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <Input
        placeholder={language.search}
        addonBefore={language.searchBy}
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

        <Form.Item
            // name="amount"
            style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
          >
            <InputNumber
              value={hingeAmount}
              onChange={handleHingeAmount}
              addonBefore={language.amount} 
              addonAfter={language.count}
            />
            <span style={{display: 'none'}}> ({hingeAmount}) </span>
          </Form.Item>
        
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="hingesStep" rules={[{ required: previousHingeId !== null ? false : true, message: language.requiredField }]}>
          <Radio.Group >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredImgs.map((hinge) => (
                <Radio key={hinge.id} value={hinge.id}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      width: '220px', 
                      margin: '20px 10px',
                      border:
                        previousHingeId === hinge.id
                          ? '7px solid #f06d20'
                          : 'none',
                    }}
                    onClick={() => setPreviousHingeId(hinge.id)}
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
                  </Card>
                </Radio>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}
    </Form>
  );
};

export default HingeStep;
