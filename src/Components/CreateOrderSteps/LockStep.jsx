import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, message, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'

const LockStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [lockData, setLockData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedBrand, setSelectedBrand] = useState('Polaris');
  const [isLoading, setIsLoading] = useState(true);
  const [previousLockId, setPreviousLockId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { lockSuborderId } = useOrder();
  const jwtToken = localStorage.getItem('token');
  const [btnColor, setBtnColor] = useState('#ff0505');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          // 'https://api.boki.fortesting.com.ua/graphql',
          queryLink,
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

    const storedBrand = localStorage.getItem('selectedBrandLock') || 'Polaris';
    const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    setSelectedBrand(storedBrand);
    setSearchQuery(storedSearchQuery);

    fetchData();

    if (currentStepSend && currentStepSend.fittingLockSend) {
      setBtnColor('#4BB543');
    }
  }, [jwtToken]);

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
      "updateFrameFittingId": lockSuborderId,
      "data": {
        "lock": previousLockId, 
      }
    };

    axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
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
            fittingLockSend: true
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
      frameFittingId: lockSuborderId
    };

    // axios.post('https://api.boki.fortesting.com.ua/graphql', {
    axios.post(queryLink, {
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

  }, [jwtToken, lockSuborderId]);

  return (
    <Form onFinish={handleSbmitForm} form={form}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-60px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.lock}`}
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
    </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="lockStep" rules={[{ required: true, message: language.requiredField }]}>
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
    </Form>
  );
};

export default LockStep;
