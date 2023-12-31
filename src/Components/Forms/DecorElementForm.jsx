import React, { useState, useEffect } from 'react';
import { Form, Button, Select, InputNumber, Spin, Radio, Space, message, Affix, Divider, Alert, Modal } from 'antd';
import { SendOutlined, IssuesCloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import GroupDecorElementStep from '../CreateOrderSteps/GroupDecorElementStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {queryLink} from '../../api/variables'

const { Option } = Select;

const DecorElementForm = ({setCurrentStepSend, elementID, currentStepSend}) => {
  const [elementOptions, setElementOptions] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { dorSuborderId } = useOrder();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentElementField, setCurrentElementField] = useState('');
  const [showDecor, setShowDecor] = useState(false);
  const [btnColor, setBtnColor] = useState('#ff0505');

  const noWidth = ['anotherSideColor', 'skirting', 'skirtingAluminium', 'moulding'];
  const noHeigt = ['anotherSideColor', 'skirting', 'skirtingAluminium', 'moulding', 'platband', 'threadedPlatband', 'kapitel', 'extender'];
  const noThickness = ['anotherSideColor', 'platband', 'threadedPlatband', 'kapitel', 'extender', 'decorInsert', 'wallplate', 'cover', 'replaceGlass'];
  const noLength = ['anotherSideColor', 'platband', 'threadedPlatband', 'kapitel', 'extender', 'decorInsert', 'wallplate', 'cover', 'replaceGlass'];
  const noDecor = ['cover', 'moulding', 'skirtingAluminium'];

  const [isWidthDisabled, setIsWidthDisabled] = useState(false); 
  const [isWidthRequired, setIsWidthRequired] = useState(false); 
  const [isHeightRequired, setIsHeightRequired] = useState(false); 
  const [isHeightDisabled, setIsHeightDisabled] = useState(false); 
  const [isThicknessRequired, setIsThicknessRequired] = useState(false); 
  const [isThicknessDisabled, setIsThicknessDisabled] = useState(false); 
  const [isLengthRequired, setIsLengthRequired] = useState(false); 
  const [isLengthDisabled, setIsLengthDisabled] = useState(false);
  const [isDecorRequired, setIsDecorRequired] = useState(true); 
  
  const [step, setStep] = useState(1);
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

  useEffect(() => {
    axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
      {
        query: `
          query Query($elementSuborderId: ID) {
            elementSuborder(id: $elementSuborderId) {
              data {
                id
                attributes {
                  amount
                  type
                  element {
                    data {
                      id
                    }
                  }
                  sizes {
                    height
                    thickness
                    width
                    length
                  }
                }
              }
            }
          }
        `,
        variables: {
          elementSuborderId: elementID || "null",
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then(response => {
      const elementSuborderData = response.data.data.elementSuborder.data;
      if (elementSuborderData) {
        form.setFieldsValue({
          name: elementSuborderData?.attributes?.type,
          width: elementSuborderData?.attributes?.sizes?.width,
          height: elementSuborderData?.attributes?.sizes?.height,
          thickness: elementSuborderData?.attributes?.sizes?.thickness,
          amount: elementSuborderData?.attributes?.amount,
          length: elementSuborderData?.attributes?.sizes?.length,
        });
      }

      setCurrentElementField(elementSuborderData?.attributes?.element?.data?.type);

      if (noWidth.includes(elementSuborderData?.attributes?.type)) {
        setIsWidthDisabled(true);
        setIsWidthRequired(false)
      }
      if (noHeigt.includes(elementSuborderData?.attributes?.type)) {
        setIsHeightDisabled(true);
        setIsHeightRequired(false)
      }
      if (noThickness.includes(elementSuborderData?.attributes?.type)) {
        setIsThicknessDisabled(true);
        setIsThicknessRequired(false)
      }
      if (noLength.includes(elementSuborderData?.attributes?.type)) {
        setIsLengthDisabled(true);
        setIsLengthRequired(false)
      }
      if (noDecor.includes(elementSuborderData?.attributes?.type)) {
        setIsDecorRequired(false);
      }

    })
    .catch(error => {
      console.error('Error fetching element suborder data:', error);
    });
  }, [jwtToken, elementID, form]);

  useEffect(() => {
    axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
      {
        query: `
          query Query($pagination: PaginationArg) {
            elements(pagination: $pagination) {
              data {
                id
                attributes {
                  title
                  type
                }
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 30
          }
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then(response => {
      setElementOptions(response.data.data.elements.data);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching elements data:', error);
      setIsLoading(false);
    });

    if (currentStepSend && currentStepSend.elementSend) {
      setBtnColor('#4BB543');
    }

  }, [jwtToken, form]);

  const handleFormSubmit = values => {
    const { name, width, height, thickness, amount, length } = values;
    const selectedElement = elementOptions.find(option => option.attributes.type === name);

    if (elementID) {
      const data = {
        amount,
        type: selectedElement.attributes.type,
        sizes: {
          height,
          thickness,
          width,
          length,
        }
      };
  
      axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
        {
          query: `
            mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
              updateElementSuborder(id: $updateElementSuborderId, data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            updateElementSuborderId: elementID,
            data,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then(response => {
        messageApi.success(language.successQuery);
        if (setCurrentStepSend) {
          setCurrentStepSend(prevState => {
            return {
              ...prevState,
              elementSend: true
            };
          });
        }
        setBtnColor('#4BB543');
      })
      .catch(error => {
        messageApi.error(language.errorQuery);
      });
    }
  };

  const getDecorFromSuborder = () => {
    if (dorSuborderId) {
      axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
        {
          query: `
            query Query($doorSuborderId: ID) {
              doorSuborder(id: $doorSuborderId) {
                data {
                  attributes {
                    decor {
                      data {
                        id
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            doorSuborderId: dorSuborderId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
        .then((response) => {
          const decorDataId = response.data.data.doorSuborder.data.attributes.decor.data;

          if (decorDataId && decorDataId.id) {
            axios.post(
              // 'https://api.boki.fortesting.com.ua/graphql',
              queryLink,
              {
                query: `
                  mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
                    updateElementSuborder(id: $updateElementSuborderId, data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  updateElementSuborderId: elementID.toString(),
                  data: {
                    decor: decorDataId.id,
                  },
                },
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
              })
              .catch((error) => {
                messageApi.error(language.errorQuery);
              });
          } else {
            messageApi.error(language.NoDecorData);
          }
        })
        .catch((error) => {
          messageApi.error(language.errorQuery);
        });
    } else {
      messageApi.error(language.NoDecorDataDoor);
    }
  };

  const handleRadioChange = (e) => {
    const value = e.target.value;
    setIsDecorRequired(false);
    
    if (value === 'choose') {
      handleShowDecorClick();
    } else if (value === 'get') {
      setShowDecor(false);
      getDecorFromSuborder();
    }
  };

  const uniqueTypesSet = new Set();

  const infoModal = () => {
    Modal.info({
      title: language.information,
      content: (
        language.saveElementsWarning
      ),
      onOk() {},
    });
  };

  const [alert, setAlert] = useState(false);  
  const [alertMessage, setAlertMessae] = useState('');
  
  useEffect(() => {
    if (currentElementField === 'platband') {
      setAlert(true);
      setAlertMessae(language.platbandWarning);
    } else if (currentElementField === 'cover') {
      setAlert(true);
      setAlertMessae(language.coverWarning);
    } else if (currentElementField === 'moulding') {
      setAlert(true);
      setAlertMessae(language.mouldingWarning);
    } else if (currentElementField === 'skirting') {
      setAlert(true);
      setAlertMessae(language.skirtingWarning);
    } else {
      setAlert(false);
    }
  },[alert, currentElementField, language]);

  return (
    <Spin spinning={isloading}>
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
            allowClear
            defaultValue={undefined}
            onChange={(value) => { 
              setCurrentElementField(value);
            }}
          >
              {elementOptions
                .filter(option => {
                  if (!uniqueTypesSet.has(option.attributes.type)) {
                    uniqueTypesSet.add(option.attributes.type);
                    return true;
                  }
                  return false;
                })
                .map(option => (
                  <Option key={option.id} value={option.attributes.type}>
                    {languageMap[selectedLanguage][option.attributes.type]}
                  </Option>
                ))}
          </Select>
        </Form.Item>

        <Form.Item
          style={{margin: '10px 0', flex: '1', 'minWidth': "300px", textAlign: 'left'}}
          name="radioOption"
          label={language.elementDecor}
          // rules={[{ required: !noDecor.includes(currentElementField) || isDecorRequired, message: language.requiredField }]}
          rules={[{ required: !noDecor.includes(currentElementField) && isDecorRequired, message: language.requiredField }]}
        >
          <Radio.Group type="dashed" buttonStyle="solid" onChange={handleRadioChange}>
            <Radio.Button value="choose">{language.elementGetDecor}</Radio.Button>
            <Radio.Button value="get">{language.elementGetDoor}</Radio.Button>
          </Radio.Group>

          <Button className="blinking" style={{marginLeft: '10px'}} icon={<IssuesCloseOutlined />} type="primary" onClick={infoModal} />
        </Form.Item>
      </div>

        <Space.Compact wrap="true" direction="hirizontal" size="middle">
          <Form.Item 
            name="width" 
            rules={[{ required: !noWidth.includes(currentElementField) || isWidthRequired, message: language.requiredField }]}
          >
            <InputNumber 
              style={{margin: '0 5px'}}
              addonBefore={language.width} 
              addonAfter="mm"
              disabled={noWidth.includes(currentElementField) || isWidthDisabled}
            />
          </Form.Item>
          
          <Form.Item 
            name="height" 
            rules={[{ 
              required: !noHeigt.includes(currentElementField) || isHeightRequired, 
              message: language.requiredField 
            }]} 
          >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore={language.height} 
              addonAfter="mm"
              disabled={noHeigt.includes(currentElementField) || isHeightDisabled}
              />
          </Form.Item>

          <Form.Item 
            name="thickness"
            rules={[{ 
              required: !noThickness.includes(currentElementField) || isThicknessRequired, 
              message: language.requiredField 
            }]}  
          >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore={language.thickness} 
              addonAfter="mm"
              disabled={noThickness.includes(currentElementField) || isThicknessDisabled}
            />
          </Form.Item>

          <Form.Item 
              name="length"
              rules={[{ required: !noLength.includes(currentElementField) || isLengthRequired, message: language.requiredField }]} 
            >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore='length' 
              addonAfter="mm" 
              disabled={noLength.includes(currentElementField) || isLengthDisabled}

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
              <GroupDecorElementStep elementID={elementID}/>
            </>
          }
        </div>

    </Spin>
  );
};

export default DecorElementForm;
