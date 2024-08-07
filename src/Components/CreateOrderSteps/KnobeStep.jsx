import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, message, Affix, InputNumber } from 'antd';
import { SendOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'
import ImagesFittingsForm from '../Forms/ImagesFittingsForm';
import {removeKnobe, checkKnobe} from '../../api/knobe';

const KnobesStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [knobesData, setKnobesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedBrand, setSelectedBrand] = useState('5S PVD');
  const [knobeVariant, setKnobeVariant] = useState('standard');
  const [isLoading, setIsLoading] = useState(true);
  const [previousKnobeId, setPreviousKnobeId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const {orderId, knobeSuborderId } = useOrder();
  const orderIdToUse = orderId;
  const jwtToken = localStorage.getItem('token');
  const [btnColor, setBtnColor] = useState('#ff0505');
  const [isDataKnobe, setIsDataKnobe] = useState(true);

  // ++++++++++++++++
  const [knobePrice, setKnobePrice] = useState(0);

  const handleKnobeVariant = (value) => {
    setKnobeVariant(value)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          // 'https://api.boki.fortesting.com.ua/graphql',
          queryLink,
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
                limit: 400
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

 
    // const storedBrand = localStorage.getItem('selectedBrandKnobe') || 'Airone';
    // const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    // setSelectedBrand(storedBrand);
    // setSearchQuery(storedSearchQuery);

    fetchData();

    if (currentStepSend && currentStepSend.fittingKnobeSend) {
      setBtnColor('#4BB543');
    }
  }, [jwtToken]);

  const brandOptions = [...new Set(knobesData.map(knob => knob.attributes.brand)), 'ALL'];

  const handleBrandChange = value => {
    // localStorage.setItem('selectedBrandKnobe', value);
    setSelectedBrand(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    // localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgs = knobesData
    .filter(knob =>
      (selectedBrand === 'ALL' || knob.attributes.brand === selectedBrand) &&
      knob.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(knob => ({
      imgSrc: knob?.attributes?.image?.data?.attributes?.url,
      title: knob?.attributes?.title,
      id: knob?.id,
    }));

    const [form] = Form.useForm();

      // ++++++++++++++++
    //form.setFieldsValue({ price: knobePrice});
    //const selectedFrameId = form.getFieldValue('name');

    const handleSbmitForm = async () => {
        // ++++++++++++++++
      const price = form.getFieldValue('price');

      const variables = {
        "updateFrameFittingId": knobeSuborderId,
        "data": {
          "knobe": previousKnobeId,
          knobe_variant: knobeVariant,
          basicPrice: price,
          price: price,
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
              fittingKnobeSend: true
            };
          });
        }
        setBtnColor('#4BB543');
        setIsDataKnobe(false);
      })
      .catch((error) => {
        messageApi.error(language.errorQuery);
      });
    }
  
  
    useEffect(() => {
      setIsLoading(true);

      const variables = {
        frameFittingId: knobeSuborderId,
        'knobe_variant': knobeVariant,
      };
  
      // axios.post('https://api.boki.fortesting.com.ua/graphql', {
      axios.post(queryLink, {
        query: `
          query GetFrameFitting($frameFittingId: ID) {
            frameFitting(id: $frameFittingId) {
              data {
                attributes {
                  knobe_variant
                  knobe {
                    data {
                      id
                      attributes {
                        brand
                      }
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
        const variant = response?.data?.data?.frameFitting?.data?.attributes?.knobe_variant;

        if (knobeId) {
          setPreviousKnobeId(knobeId);
          setKnobeVariant(variant)

          const knobeBrand = response?.data?.data?.frameFitting?.data?.attributes?.knobe?.data?.attributes.brand;
          setSelectedBrand(knobeBrand ? knobeBrand : '5S PVD');
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  
    }, [jwtToken, knobeSuborderId]);

    useEffect(() => {
      // checkKnobe(jwtToken, orderIdToUse, setIsDataKnobe);
      checkKnobe(jwtToken, orderIdToUse, setIsDataKnobe, setKnobePrice);
      form.setFieldsValue({ price: knobePrice});
    }, [isDataKnobe, previousKnobeId, knobePrice]);

  return (
    <Form onFinish={handleSbmitForm} form={form}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-60px', right: '170px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.knobe}`}
        </Button>
      </Affix>

      <div style={{ position: 'absolute', top: '-60px', right: '20px'}}>
        <Button
          disabled={isDataKnobe} 
          danger 
          icon={<DeleteOutlined />} 
          // onClick={() => removeKnobe(jwtToken, orderIdToUse, setIsDataKnobe, messageApi, language, setPreviousKnobeId)}
          onClick={() => removeKnobe(jwtToken, orderIdToUse, setIsDataKnobe, messageApi, language, setPreviousKnobeId, setKnobeVariant, setKnobePrice)}
          >
          {`${language.delete} ${language.knobe}`}
        </Button>
      </div>

      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        <Input
          placeholder={language.search}
          addonBefore={language.searchBY}
          value={searchQuery}
          onChange={e => handleSearchQueryChange(e.target.value)}
          style={{margin: '10px 0', flex: '1'}}
        />

      <Form.Item 
          label={language.knobe} 
          rules={[{ required: true, message: language.requiredField }]}
          style={{margin: '10px 0', flex: '1'}}
        >
          <Select
            name="selectedPaintFor"
            value={knobeVariant}
            onChange={handleKnobeVariant}
          >
            <Select.Option value="standard">{language.simple}</Select.Option>
            <Select.Option value="cylinder">{language.cylinder}</Select.Option>
            <Select.Option value="key">{language.key}</Select.Option>
            <Select.Option value="wc">{language.wc}</Select.Option>
          </Select>
        </Form.Item>

      <Form.Item 
        label={language.sorting}
        style={{margin: '10px 0', flex: '1'}}
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
         name="price"
         style={{margin: '10px 0', flex: '1'}}
         rules={[
          {
            required: true,
            message: language.requiredField,
          },
        ]}
        >
          <InputNumber addonBefore={language.price} addonAfter="€"/>
        </Form.Item>
      </div>
        
      {isLoading ? (
        <Spin size="large" />
      ) : (
        // <Form.Item name="knobeStep" rules={[{ required: previousKnobeId !== null ? false : true, message: language.requiredField }]}>
        //   <Radio.Group>
        //     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        //       {filteredImgs.map((knob) => (
        //         <Radio key={knob.id} value={knob.id}>
        //           <Card
        //             className="custom-card"
        //             hoverable
        //             style={{
        //               width: '220px', 
        //               margin: '20px 10px',
        //               border:
        //               previousKnobeId === knob.id
        //                 ? '7px solid #f06d20'
        //                 : 'none',
        //             }}
        //             onClick={() => setPreviousKnobeId(knob.id)}
        //           >
        //             <div style={{ overflow: 'hidden', height: 120 }}>
        //               <img
        //                 src={`https://api.boki.fortesting.com.ua${knob.imgSrc}`}
        //                 alt={knob.title}
        //                 style={{ width: '100%', objectFit: 'cover' }}
        //               />
        //             </div>
        //             <Card.Meta
        //               title={knob.title}
        //               style={{ paddingTop: '10px' }}
        //             />
        //           </Card>
        //         </Radio>
        //       ))}
        //     </div>
        //   </Radio.Group>
        // </Form.Item>

        <ImagesFittingsForm
          filteredImgs={filteredImgs}
          language={language}
          stepName={'knobeStep'}
          previousId={previousKnobeId}
          setPreviousId={setPreviousKnobeId}
          imageHeight={'100px'}
      />
      )}
    </Form>
  );
};

export default KnobesStep;
