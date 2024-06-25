import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Spin, message, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import { getSlidings, getSlidingData, updateSliding } from '../../api/sliding';
import {removeFrameSuborderData} from '../../api/frame'

const SlidingStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { orderId, slidingSuborderId, frameSuborderId } = useOrder();
  const orderIdToUse = orderId;
  const jwtToken = localStorage.getItem('token');
  const [form] = Form.useForm();
  const [slidingData, setSlidingData] = useState([]);
  const [previousSlidingId, setPreviousSlidingId] = useState(null);

  const [btnColor, setBtnColor] = useState('#ff0505');

  const handleSearchQueryChange = value => {
    setSearchQuery(value);
  };

  const filteredSlidingData = slidingData.filter(sliding => 
    sliding.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSbmitForm = async () => {
    await updateSliding(jwtToken, slidingSuborderId, previousSlidingId, messageApi, language);
    
    await removeFrameSuborderData(jwtToken, frameSuborderId, orderIdToUse);

    if (setCurrentStepSend) {
      setCurrentStepSend(prevState => {
        return {
          ...prevState,
          frameSend: true
        };
      });
    }
    setBtnColor('#4BB543');
  }

  useEffect(() => {
    const fetchSlidingData = async () => {
      await getSlidings(orderIdToUse, jwtToken, setSlidingData);
      await getSlidingData(orderIdToUse, jwtToken, setPreviousSlidingId, null);
      setIsLoading(false);
    };

    fetchSlidingData();
  }, [orderIdToUse, jwtToken]);


  return (
    <Form onFinish={handleSbmitForm} form={form}>
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-50px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
        {`${language.submit} ${language.sliding}`}
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
    </div>

      {isLoading ? (
        <Spin size="large" />
      ) : (
        <Form.Item name="slidingStep" rules={[{ required: true, message: language.requiredField }]}>
          <Radio.Group >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredSlidingData.map((sliding) => (
                <Radio key={sliding.id} value={sliding.id}>
                  <Card 
                    className="custom-card"
                    hoverable
                    style={{
                      width: '350px', 
                      margin: '20px 10px',
                      border:
                      previousSlidingId === sliding.id
                        ? '7px solid #f06d20'
                        : 'none',
                    }}
                    onClick={() => setPreviousSlidingId(sliding.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${sliding.attributes.image.data.attributes.url}`}
                        alt={sliding.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta
                      title={sliding.attributes.title}
                      // description={sliding.attributes.description[0].children[0].text}
                      description={languageMap[selectedLanguage][sliding.attributes.description[0].children[0].text]}
                      style={{ paddingTop: '10px' }}
                      />
                      <p> {language.articul} : {sliding.attributes.fittingsArticle} </p>
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

export default SlidingStep;
