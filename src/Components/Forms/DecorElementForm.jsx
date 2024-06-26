import React, { useState, useEffect } from 'react';
import { Form, Button, Select, InputNumber, Spin, Radio, Space, message, Affix, Divider, Alert, Modal, Badge } from 'antd';
import { SendOutlined, InfoCircleOutlined } from '@ant-design/icons';
// import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import GroupDecorElementStep from '../CreateOrderSteps/GroupDecorElementStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
// import {queryLink} from '../../api/variables'
// import {validateDecorTypeElement, validateElements} from '../../api/validationOrder'
import {validateDecorTypeElement} from '../../api/validationOrder'
import {getElements, getElementsDataOrder, updateElementSuborder, getDecorFromSuborder} from '../../api/element'

const { Option } = Select;

const DecorElementForm = ({setCurrentStepSend, elementID, currentStepSend}) => {
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { orderId, dorSuborderId } = useOrder();
  const orderIdToUse = orderId;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [elementOptions, setElementOptions] = useState([]);
  const [currentElementField, setCurrentElementField] = useState('');
  const [showDecor, setShowDecor] = useState(false);
  const [btnColor, setBtnColor] = useState('#ff0505');
  const [hasWidth, setHasWidth] = useState(true); 
  const [hasHeight, setHasHeight] = useState(true); 
  const [hasThickness, setHasThickness] = useState(true); 
  const [hasLength, setHasLength] = useState(true); 
  // const [hasDecor, setHasDecor] = useState(true); 
  const [hasDecorRequired, setHasDecorRequired] = useState(true); 
  const [alert, setAlert] = useState(false);  
  const [alertMessage, setAlertMessage] = useState('');
  const [step, setStep] = useState(1);
  const [realElementId, setRealElementId] = useState(''); 
  const [isLoading, setIsLoading] = useState(true); 
  const [widthLimit, setWidthLimit] = useState({ min: null, max: null });
  const [isBronzeGold, setIsBoronzeGold] = useState(false)


  const handleAmountChange = (value) => {
    if (value <= 0.5) {
      setStep(0.5); 
    } else {
      setStep(1);
    }
  };
  
  const handleShowDecorClick = () => {
    setShowDecor(true);
  }

  const requiredFieldsAndAlert = (currentElementField, elementOptions) => {
    const currentElement = elementOptions?.find(option => option.id === currentElementField);

    if (currentElement) {
      setHasWidth(!currentElement.attributes.hasWidth);
      setHasHeight(!currentElement.attributes.hasHeight);
      setHasThickness(!currentElement.attributes.hasThickness);
      setHasLength(!currentElement.attributes.hasLength);
      // setHasDecor(!currentElement.attributes.hasDecor);
      setHasDecorRequired(!currentElement.attributes.hasDecorRequired);

      const elementType = currentElement.attributes.type;
      switch (elementType) {
        case 'platband':
          setAlert(true);
          setAlertMessage(language.platbandWarning);
          break;

        case 'border':
          setAlert(true);
          setAlertMessage(language.borderWarning);
          break;

        case 'moulding':
          setAlert(true);
          setAlertMessage(language.mouldingWarning);
          break;

        case 'skirting':
          setAlert(true);
          setAlertMessage(language.skirtingWarning);
          break;

        default:
          setAlert(false);
          break;
      }
    } else {
      return;
    }
  };

  const getWidthLimitExtender = () => {
    const currentElement = elementOptions?.find(option => option.id === currentElementField);

    if (currentElement?.attributes?.title.startsWith("extender 200")) {
      setWidthLimit({ min: 151, max: 200 });
    } else if (currentElement?.attributes?.title.startsWith("extender 300")) {
      setWidthLimit({ min: 201, max: null });
    } else if (currentElement?.attributes?.title.startsWith("extender 150")) {
      setWidthLimit({ min: null, max: 150 });
    } else {
      setWidthLimit({ min: null, max: null });
    }
  };

  const getBronzeGold = () => {
    const currentElement = elementOptions?.find(option => option.id === currentElementField);

    if (currentElement?.attributes?.title.toLowerCase().indexOf('aluminium') !== -1) {
      setIsBoronzeGold(true);
    } else {
      setIsBoronzeGold(false);
    }
  };

  const handleFormSubmit = async (values) => {
    const { name, width, height, thickness, amount, length } = values;

    if (elementID) {
      const data = {
        amount,
        element: name,
        sizes: {
          height,
          thickness,
          width,
          length,
        }
      };
  
      await updateElementSuborder(jwtToken, elementID, data, language, messageApi, setCurrentStepSend, setBtnColor);
    }
  };

  const handleRadioChange = (e) => {
    const value = e.target.value;
    
    if (value === 'choose') {
      handleShowDecorClick();
    } else if (value === 'get') {
      setShowDecor(false);
      getDecorFromSuborder(dorSuborderId, jwtToken, validateDecorTypeElement, realElementId, language, messageApi, elementID);
    }
  };

  const infoModal = () => {
    Modal.info({
      title: language.information,
      content: (
        language.saveElementsWarning
      ),
      onOk() {},
    });
  };

  const getData = async () => {
    await getElements(jwtToken, orderIdToUse, setElementOptions);
    const currentElement = await getElementsDataOrder(jwtToken, elementID, form, setCurrentElementField, setRealElementId);
    
    setCurrentElementField(currentElement);
  };
  
  useEffect(() => {
    getData();
  }, [orderIdToUse, jwtToken]);

  useEffect(()=> {
    requiredFieldsAndAlert(currentElementField, elementOptions);
    setRealElementId(currentElementField);
    setIsLoading(false);

    getWidthLimitExtender();
  }, [currentElementField, language]);

  useEffect(() => {
    getBronzeGold();
  }, [currentElementField, isBronzeGold]);

  return (
    <Spin spinning={isLoading}>
      <Form form={form} onFinish={handleFormSubmit} >
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-60px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
        {`${language.submit} ${language.element}`}
        </Button>
      </Affix>

      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: "30px"}}>
        <Form.Item
          name="name"
          label={language.elementFor}
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px"}}
          rules={[{ required: true, message: language.requiredField }]}
        >
            <Select
            placeholder={language.element}
            defaultValue={undefined}
            onChange={(value, option) => { 
              setCurrentElementField(value);
              setRealElementId(option.key);
            }}
          >
              {elementOptions?.map(option => (
                  <Option key={option.id} value={option.id}>
                    {languageMap[selectedLanguage][option.attributes.title]}
                  </Option>
                ))}
          </Select>
          
        </Form.Item>

        <Form.Item
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px", textAlign: 'left'}}
          name="radioOption"
          label={language.elementDecor}
          rules={[{ required: !hasDecorRequired, message: language.requiredField }]}
        >
          <div>
            <Radio.Group disabled={realElementId ? false : true} type="dashed" buttonStyle="solid" onChange={handleRadioChange}>
              <Radio.Button value="choose">{language.elementGetDecor}</Radio.Button>
              <Radio.Button value="get">{language.elementGetDoor}</Radio.Button>
            </Radio.Group>

            <Button 
              style={{marginLeft: '12px', backgroundColor: '#1677ff'}} 
              type="primary" 
              shape="circle" 
              icon={<InfoCircleOutlined />} 
              onClick={infoModal} 
            />
          </div> 
        </Form.Item>
      </div>

        <Space.Compact wrap="true" direction="hirizontal" size="middle">
          <Form.Item 
            name="width" 
            rules={[{ required: !hasWidth, message: language.requiredField }]}
          >
            <InputNumber 
              style={{margin: '0 5px'}}
              addonBefore={language.width} 
              addonAfter="mm"
              disabled={hasWidth}
              min={widthLimit.min}
              max={widthLimit.max}
            />
          </Form.Item>
          
          <Form.Item 
            name="height" 
            rules={[{ 
              required: !hasHeight, 
              message: language.requiredField 
            }]} 
          >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore={language.height} 
              addonAfter="mm"
              disabled={hasHeight}
              />
          </Form.Item>

          <Form.Item 
            name="thickness"
            rules={[{ 
              required: !hasThickness, 
              message: language.requiredField 
            }]}  
          >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore={language.thickness} 
              addonAfter="mm"
              disabled={hasThickness}
            />
          </Form.Item>

          <Form.Item 
              name="length"
              rules={[{ required: !hasLength, message: language.requiredField }]} 
            >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore='length' 
              addonAfter="mm" 
              disabled={hasLength}
            />
          </Form.Item>

          <Form.Item
            name="amount"
          >
            <InputNumber 
              style={{margin: '0 5px'}} 
              addonBefore={language.amount} 
              addonAfter={language.count}
              min={0.5}
              step={step}
              onChange={handleAmountChange}
            />
          </Form.Item>
        </Space.Compact>

        {alert && (
          <Alert
            message={alertMessage}
            type="warning"
            showIcon
            style={{textAlign: 'left'}}
          />
        )}
      </Form>

        <div style={{paddingTop: '20px' }}>
          {showDecor && 
            <>
              <Divider/>
              <h3 style={{textAlign: 'left', paddingBottom: '15px'}}> {language.element} {language.elementGetDecor} </h3>
              {/* <GroupDecorElementStep elementID={elementID} realElementId = {realElementId}/> */}
              <GroupDecorElementStep elementID={elementID} realElementId = {realElementId} showBronzeGold = {isBronzeGold}/>
            </>
          }
        </div>
    </Spin>
  );
};

export default DecorElementForm;
