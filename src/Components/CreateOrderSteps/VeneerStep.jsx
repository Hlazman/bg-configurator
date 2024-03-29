import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, Affix, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'
import {checkVeneerDirection, updateVeneerDirection} from '../../api/veneer'
import ImagesDecorVeenerForm from '../Forms/ImagesDecorVeenerForm';

const VeneerStep = ({ fetchOrderData, fetchDecorData, checkDecor, sendDecorForm, currentStepSend }) => {
  const [veneerData, setVeneerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('lacquer_1');
  const [isloading, setIsLoading] = useState(true);  
  const jwtToken = localStorage.getItem('token');
  const [previousVeneerTitle, setPreviousVeneerTitle] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { orderId, dorSuborderId} = useOrder();
  const orderIdToUse = orderId;
  const [btnColor, setBtnColor] = useState('#ff0505');

  const [veneerDirection, setVeneerDirection] = useState(false);

  const [form] = Form.useForm();
  const onFinish = async () => {
    sendDecorForm(orderIdToUse, dorSuborderId, selectedDecorId);
  };

  const categoryOptions = [...new Set(veneerData.map(veneer => veneer.attributes.category)), language.all];

  const handleCategoryChange = value => {
    // localStorage.setItem('selectedCategory', value);
    setSelectedCategory(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    // localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImgs = veneerData
    .filter(veneer =>
      (selectedCategory === language.all || veneer.attributes.category === selectedCategory) &&
      (veneer.attributes.main_properties.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       veneer.attributes.code.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(veneer => ({
      imgSrc: veneer.attributes.main_properties.image.data.attributes.url,
      title: veneer.attributes.main_properties.title,
      description: veneer.attributes.code,
      id: veneer.id,
      productId: veneer.producId,
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          // 'https://api.boki.fortesting.com.ua/graphql',
          queryLink,
          {
            query: `
              query Veneers($pagination: PaginationArg) {
                veneers(pagination: $pagination) {
                  data {
                    attributes {
                      category
                      code
                      main_properties {
                        title
                        id
                        image {
                          data {
                            attributes {
                              url
                            }
                          }
                        }
                      }
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

        const veneers = response.data.data.veneers.data.map(veneer => ({
          ...veneer,
          id: veneer.attributes.main_properties.id,
          producId: veneer.id,
        }));
        setVeneerData(veneers);
        setIsLoading(false);


        const veneerDirectionData = await checkVeneerDirection(orderIdToUse, jwtToken);
        
        form.setFieldsValue({
          horizontal_veneer: veneerDirectionData,
        })
        
        setVeneerDirection(veneerDirectionData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    // const storedCategory = localStorage.getItem('selectedCategory') || 'lacquer_1';
    // const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    // setSelectedCategory(storedCategory);
    // setSearchQuery(storedSearchQuery);

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousVeneerTitle, 'veneer');

    if (currentStepSend && currentStepSend.decorSend) {
      setBtnColor('#4BB543');
    }

  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData]);

  const findVeenerCategory = (array, veenerTitle) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].attributes.main_properties.title === veenerTitle) {
            return array[i].attributes.category;
        }
    }
    return null;
}

  useEffect(() => {
    if (veneerData && previousVeneerTitle) {
      const veererCategory = findVeenerCategory(veneerData, previousVeneerTitle);
      setSelectedCategory(veererCategory ? veererCategory : 'lacquer_1');
    }
  }, [previousVeneerTitle, veneerData]);

  return (
    <Form onFinish={onFinish} form={form}> 

      <Affix style={{ position: 'absolute', top: '-60px', right: '20px'}} offsetTop={60}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.decor}`}
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
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          {categoryOptions.map((category, index) => (
            <Select.Option key={index} value={category}>
              {/* {category} */}
              {languageMap[selectedLanguage][category]}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}> 
        <Form.Item
          label={language.horizontalVeneer}
          name="horizontal_veneer"
          style={{margin: '10px 0', }}
        >
          <Radio.Group buttonStyle="solid" onChange={(value) => updateVeneerDirection(orderIdToUse, jwtToken, value.target.value)}>
            <Radio.Button value={true}>{language.yes}</Radio.Button>
            <Radio.Button value={false}>{language.no}</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </div>

      {isloading ? (
        <Spin size="large" />
      ) : (
        // <Form.Item name="veneerRadio" rules={[{ required: true, message: language.requiredField }]}>
        //   <Radio.Group >
        //     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        //       {filteredImgs.map((veneer) => (
        //         <Radio key={veneer.id} value={veneer.id}>
        //           <Card
        //             className="custom-card"
        //             hoverable
        //             style={{
        //               width: '200px', 
        //               margin: '20px 10px',
        //               border:
        //                 previousVeneerTitle === veneer.title
        //                 ? '7px solid #f06d20'
        //                 : 'none',
        //             }}
        //             onClick={() => {
        //               checkDecor('veneer', veneer.title, decorData, setSelectedDecorId, veneer.productId, setDecorData);
        //               setPreviousVeneerTitle(veneer.title);
        //             }}
        //           >
        //             <div style={{ overflow: 'hidden', height: 220 }}>
        //               <img
        //                 src={`https://api.boki.fortesting.com.ua${veneer.imgSrc}`}
        //                 alt={veneer.title}
        //                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        //               />
        //             </div>
        //             <Card.Meta
        //               title={veneer.title}
        //               description={veneer.description}
        //               style={{ paddingTop: '10px' }}
        //             />
        //           </Card>
        //         </Radio>
        //       ))}
        //     </div>
        //   </Radio.Group>
        // </Form.Item>

        <ImagesDecorVeenerForm
          filteredImgs={filteredImgs}
          name={'veneerRadio'}
          previousTitle={previousVeneerTitle}
          setPreviousTitle={setPreviousVeneerTitle}
          checkDecor={checkDecor}
          decorData={decorData}
          setSelectedDecorId={setSelectedDecorId}
          setDecorData={setDecorData}
          language={language}
        />
      )}
    </Form>
  );
};

export default VeneerStep;
