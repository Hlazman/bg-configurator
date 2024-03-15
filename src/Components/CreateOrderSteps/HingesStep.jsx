import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Select, Spin, message, Affix, InputNumber } from 'antd';
import { SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {getHinges, getHingesData, updateHinges, removeHinge, checkHinge} from '../../api/hinge';
import ImagesFittingsForm from '../Forms/ImagesFittingsForm';
import {validateHinges} from '../../api/validationOrder';

const HingeStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [hingeData, setHingeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previousHingeId, setPreviousHingeId] = useState(null); 
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [hingeAmount, setHingeAmount] = useState(1)
  const { orderId, hingeSuborderId } = useOrder();
  const orderIdToUse = orderId;
  const jwtToken = localStorage.getItem('token');
  const [btnColor, setBtnColor] = useState('#ff0505');
  const [form] = Form.useForm();
  const [isDataHinges, setIsDataHinges] = useState(true);

  const handleHingeAmount = (value) => {
    setHingeAmount(value)
  }

  const brandOptions = [...new Set(hingeData.map(hinge => hinge.attributes.brand)), language.all];

  const handleBrandChange = value => {
    setSelectedBrand(value);
    setSearchQuery('');
  };

  const handleSearchQueryChange = value => {
    // localStorage.setItem('searchQuery', value);
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

    const handleSbmitForm = async () => {
      updateHinges(jwtToken, hingeSuborderId, previousHingeId, hingeAmount, messageApi, language, setCurrentStepSend, setBtnColor);
      setIsDataHinges(false);
      setTimeout(() => validateHinges(orderIdToUse, jwtToken), 100);
    }

    useEffect(() => {
      // const storedSearchQuery = localStorage.getItem('searchQuery') || '';
      // setSearchQuery(storedSearchQuery);
  
      getHinges(orderIdToUse, jwtToken, setHingeData, setIsLoading, setSelectedBrand);
  
      if (currentStepSend && currentStepSend.fittingHingeSend) {
        setBtnColor('#4BB543');
      }
    }, [jwtToken, hingeSuborderId, currentStepSend, orderIdToUse]);
  
    useEffect(() => {
      getHingesData(jwtToken, setIsLoading, hingeSuborderId, setPreviousHingeId, setHingeAmount);
    }, [jwtToken, hingeSuborderId]);


    useEffect(() => {
      checkHinge(jwtToken, orderIdToUse, setIsDataHinges);
    }, [isDataHinges, previousHingeId]);

  return (    
    <Form onFinish={handleSbmitForm} form={form}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-60px', right: '170px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
          {`${language.submit} ${language.hinges}`}
        </Button>
      </Affix>

      <div style={{ position: 'absolute', top: '-60px', right: '20px'}}>
        <Button
          disabled={isDataHinges} 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeHinge(jwtToken, orderIdToUse, setIsDataHinges, messageApi, language, setPreviousHingeId)}
          >
          {`${language.delete} ${language.hinges}`}
        </Button>
      </div>

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
        // <Form.Item name="hingesStep" rules={[{ required: previousHingeId !== null ? false : true, message: language.requiredField }]}>
        //   <Radio.Group >
        //     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        //       {filteredImgs.map((hinge) => (
        //         <Radio key={hinge.id} value={hinge.id}>
        //           <Card
        //             className="custom-card"
        //             hoverable
        //             style={{
        //               width: '220px', 
        //               margin: '20px 10px',
        //               border:
        //                 previousHingeId === hinge.id
        //                   ? '7px solid #f06d20'
        //                   : 'none',
        //             }}
        //             onClick={() => setPreviousHingeId(hinge.id)}
        //           >
        //             <div style={{ overflow: 'hidden', height: 220 }}>
        //               <img
        //                 src={`https://api.boki.fortesting.com.ua${hinge.imgSrc}`}
        //                 alt={hinge.title}
        //                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        //               />
        //             </div>
        //             <Card.Meta
        //               title={hinge.title}
        //               description={hinge.brand}
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
          stepName={'hingesStep'}
          previousId={previousHingeId}
          setPreviousId={setPreviousHingeId}
          imageHeight={'200px'}
        />
      )}
    </Form>
  );
};

export default HingeStep;
