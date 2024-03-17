import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, message, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'
import ImagesDecorPaintForm from '../Forms/ImagesDecorPaintForm';
import {checkSuperGloss, updateSuperGloss} from '../../api/paint'

const PaintStep = ({ orderID, fetchOrderData, fetchDecorData, checkDecor, sendDecorForm, isPaintDecor, currentStepSend, colorRangeFilter }) => {
  const [paintData, setPaintData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedColorGroup, setSelectedColorGroup] = useState('black_white_9');
  const [selectedColorRange, setSelectedColorRange] = useState('RAL');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  // const [selectedPaintFor, setSelectedPaintFor] = useState(isPaintDecor ? 'paint' : '');
  const [selectedPaintFor, setSelectedPaintFor] = useState('');
  const [isPaintType, setIsPaintType] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');
  const [previousColorTittle, setPreviousColorTitle] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [selectedDecorId, setSelectedDecorId] = useState(null);
  const [isDisabledGroup, setIsDisabledGroup] = useState(false);
  // const { order } = useOrder();
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;
  const paintForSelectRef = useRef(null);
  const [btnColor, setBtnColor] = useState('#ff0505');
  
  const colorRangeFilterDoors = ["NCS", "RAL"];
  const colorRangeFilterElements = ["NCS", "RAL", "bronze", "gold"];

  const [superGloss, setSuperGloss] = useState(false);

  const [form] = Form.useForm();

  const onFinish = async () => {
    sendDecorForm(orderIdToUse, dorSuborderId, selectedDecorId);
  };

  const colorGroupOptions = [...new Set(paintData.map(paint => paint.attributes?.color_group)), language.all];
  const colorRangeOptions = [...new Set(paintData.map(paint => paint.attributes?.color_range))];

  const handleColorGroupChange = value => {
    // localStorage.setItem('selectedColorGroup', value);
    setSelectedColorGroup(value);
    setSearchQuery('');
  };


  const handleColorRangeChange = value => {
    setSelectedColorRange(value);
    setSearchQuery('');
  
    if (value === 'NCS' || value === 'bronze' || value === 'gold') {
      setSelectedColorGroup('no_group');
      setIsDisabledGroup(true)
    } else {
      setIsDisabledGroup(false)
      setSelectedColorGroup('black_white_9')
    }
  };
 
    const handlePaintForChange = value => {
    setIsPaintType(false)
    // setSelectedPaintFor(value);
    setSelectedPaintFor(value.target.value);
    setPreviousColorTitle(null);
  };

  const handleSearchQueryChange = value => {
    // localStorage.setItem('searchQuery', value);
    setSearchQuery(value);
  };

  const filteredImages = paintData
    .filter(paint =>
      (selectedColorGroup === language.all || paint.attributes.color_group === selectedColorGroup) &&
      paint.attributes.color_range === selectedColorRange &&
      paint.attributes.color_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(paint => paint.attributes.main_properties.image.data.attributes.url);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          // 'https://api.boki.fortesting.com.ua/graphql',
          queryLink,
          {
            query: `
              query Data($pagination: PaginationArg, $filters: PaintFiltersInput) {
                paints(pagination: $pagination, filters: $filters) {
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
              filters: {
                "color_range": {
                  "in": colorRangeFilter === true ? colorRangeFilterDoors : colorRangeFilterElements
                }
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
        setIsLoading(false);

        const superGlossData = await checkSuperGloss(orderIdToUse, jwtToken);
        
        form.setFieldsValue({
          super_gloss: superGlossData,
        })
        setSuperGloss(superGlossData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // const storedColorGroup = localStorage.getItem('selectedColorGroup') || 'black_white_9';
    // const storedSearchQuery = localStorage.getItem('searchQuery') || '';

    // setSelectedColorGroup(storedColorGroup);
    // setSearchQuery(storedSearchQuery);

    fetchData();
    fetchDecorData(setDecorData);
    fetchOrderData(orderIdToUse, setPreviousColorTitle, selectedPaintFor, setSelectedPaintFor, isPaintType);

    if (currentStepSend && currentStepSend.decorSend) {
      setBtnColor('#4BB543');
    }
  }, [jwtToken, orderIdToUse, fetchDecorData, fetchOrderData, selectedPaintFor, isPaintType]);


  const findColorGroup = (array, colorCode) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].attributes.color_code === colorCode) {
            return array[i].attributes.color_group;
        }
    }
    return null;
}

  useEffect(() => {
    if (paintData && previousColorTittle) {
      const colorGroup = findColorGroup(paintData, previousColorTittle);
      setSelectedColorGroup(colorGroup ? colorGroup : 'black_white_9');
    }
  }, [previousColorTittle, paintData]);

  return (
    <Form onFinish={onFinish} form={form}>
      {contextHolder}

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
          
        {/* <Form.Item
          label={language.paintFor} 
          rules={[{ required: true, message: language.requiredField }]}
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
        >
          <Select
            name="selectedPaintFor"
            // value={ !isPaintDecor ? selectedPaintFor : 'paint'}
            value={selectedPaintFor}
            onChange={handlePaintForChange}
            // disabled={isPaintDecor}
            ref={paintForSelectRef}
          >
            <Select.Option value="paint">{language.paint}</Select.Option>
            <Select.Option value="painted_glass">{language.glass}</Select.Option>
            <Select.Option value="painted_veneer">{language.veneer}</Select.Option>
          </Select>
        </Form.Item> */}

        <Form.Item label={`${language.type} ${language.colors}`} style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}>
          <Select
            value={selectedColorRange}
            onChange={handleColorRangeChange}
          >
            {colorRangeOptions.map((colorRange, index) => (
              <Select.Option key={index} value={colorRange}>
                {colorRange}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={language.sorting} style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}} >
        <Select
          value={selectedColorGroup}
          onChange={handleColorGroupChange}
          disabled={isDisabledGroup}
        >
          {colorGroupOptions.map((colorGroup, index) => (
            <Select.Option key={index} value={colorGroup}>
              {colorGroup}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>
        </div>

        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
          <Form.Item
            label={language.paintFor} 
            rules={[{ required: true, message: language.requiredField }]}
            style={{margin: '25px 0'}}
          >
            <Radio.Group
              buttonStyle="solid"
              name="selectedPaintFor"
              value={selectedPaintFor}
              onChange={handlePaintForChange}
              ref={paintForSelectRef}
              tabIndex={0}
            >
              <Radio.Button value="paint">{language.paint}</Radio.Button>
              <Radio.Button value="painted_glass">{language.glass}</Radio.Button>
              <Radio.Button value="painted_veneer">{language.veneer}</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={language.superGloss}
            name="super_gloss"
            style={{margin: '25px 0'}}
          >
            <Radio.Group buttonStyle="solid" onChange={(value) => updateSuperGloss(orderIdToUse, jwtToken, value.target.value)}>
              <Radio.Button value={true}>{language.yes}</Radio.Button>
              <Radio.Button value={false}>{language.no}</Radio.Button>
            </Radio.Group>
          </Form.Item>

        </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        // <Form.Item name="paintRadio" rules={[{ required: true, message: language.requiredField }]}>
        //   <Radio.Group>
        //     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        //       {filteredImages.map((imgSrc) => {
        //         const paint = paintData.find(
        //           paint =>
        //             paint.attributes.main_properties.image.data.attributes.url === imgSrc
        //         );
        //         return (
        //           <Radio key={paint.id} value={paint.id}>
        //             <Card
        //               className="custom-card"
        //               hoverable
        //               style={{
        //                 width: 220, 
        //                 margin: '20px 10px', 
        //                 border:
        //                   previousColorTittle === paint.attributes.color_code
        //                     ? '7px solid #f06d20'
        //                     : 'none',
        //               }}
        //               onClick={() => {
        //                 if (selectedPaintFor) {
        //                   checkDecor(selectedPaintFor, paint.attributes.color_code, decorData, setSelectedDecorId, paint.id, setDecorData);
        //                   setPreviousColorTitle(paint.attributes.color_code);
        //                 } else {
        //                   messageApi.error(language.firstPainFor);
        //                   paintForSelectRef.current.focus();
        //                 }
        //               }}
        //             >
        //               <div style={{ overflow: 'hidden', height: 120 }}>
        //                 <img
        //                   src={`https://api.boki.fortesting.com.ua${imgSrc}`}
        //                   alt={paint.attributes.color_code}
        //                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        //                 />
        //               </div>
        //               <Card.Meta
        //                 title={paint.attributes.color_code}
        //                 style={{ paddingTop: '10px' }}
        //               />
        //             </Card>
        //           </Radio>
        //         );
        //       })}
        //     </div>
        //   </Radio.Group>
        // </Form.Item>

        <ImagesDecorPaintForm
          filteredImages={filteredImages}
          language={language} 
          paintData={paintData}
          previousColorTittle={previousColorTittle}
          selectedPaintFor={selectedPaintFor}
          checkDecor={checkDecor}
          setPreviousColorTitle={setPreviousColorTitle}
          decorData={decorData}
          setSelectedDecorId={setSelectedDecorId}
          setDecorData={setDecorData}
          messageApi={messageApi}
          paintForSelectRef={paintForSelectRef}
        />
      )}
    </Form>
  );
};

export default PaintStep;
