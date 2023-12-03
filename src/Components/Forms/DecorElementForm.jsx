import React, { useState, useEffect } from 'react';
import { Form, Button, Select, InputNumber, Spin, Radio, Space, message, Affix, Divider } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useOrder } from '../../Context/OrderContext';
import GroupDecorElementStep from '../CreateOrderSteps/GroupDecorElementStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const { Option } = Select;

const DecorElementForm = ({setCurrentStepSend, elementID}) => {
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

  // const [isPaintDecor, setIsPaintDecor] = useState(false);
  // const [isMirrorDecor, setIsMirrorDecor] = useState(false);
  // const onlyWidth = ['1', '2', '11', '13'];
  // const noWidthHeightThickness = ['14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25'];
  // const noDecor = ['16', '20', '22'];
  // const paintDecor = ['16', '17', '20', '21', '22', '23', '24', '25'];
  // const mirrorDecor = ['16', '17', '20', '21', '22', '23', '25'];

  const noWidth = ['anotherSideColor', 'skirting', 'moulding'];
  const noHeigt = ['anotherSideColor', 'skirting', 'moulding', 'platband', 'threadedPlatband', 'kapitel', 'extender',];
  const noThickness = ['anotherSideColor', 'platband', 'threadedPlatband', 'kapitel', 'extender', 'decorInsert', 'wallplate', 'cover', 'replaceGlass'];
  const noLength = ['anotherSideColor', 'platband', 'threadedPlatband', 'kapitel', 'extender', 'decorInsert', 'wallplate', 'cover', 'replaceGlass'];

  const handleShowDecorClick = () => {
    // if (paintDecor.includes(currentElementField)) {
    //   setIsPaintDecor(true)
    // }
    // if (mirrorDecor.includes(currentElementField)) {
    //   setIsMirrorDecor(true)
    // }
    setShowDecor(true);
  }

  useEffect(() => {
    axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
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
          // name: elementSuborderData?.attributes?.element?.data?.id,
          name: elementSuborderData?.attributes?.type,
          width: elementSuborderData?.attributes?.sizes?.width,
          height: elementSuborderData?.attributes?.sizes?.height,
          thickness: elementSuborderData?.attributes?.sizes?.thickness,
          amount: elementSuborderData?.attributes?.amount,
          length: elementSuborderData?.attributes?.sizes?.length,
        });
      }
      // setCurrentElementField(elementSuborderData?.attributes?.element?.data?.id)
      setCurrentElementField(elementSuborderData?.attributes?.element?.data?.type)
      
    })
    .catch(error => {
      console.error('Error fetching element suborder data:', error);
    });
  }, [jwtToken, elementID, form]);

  useEffect(() => {
    axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
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
  }, [jwtToken, form]);

  const handleFormSubmit = values => {
    const { name, width, height, thickness, amount, length } = values;
    // const selectedElement = elementOptions.find(option => option.id === name);
    const selectedElement = elementOptions.find(option => option.attributes.type === name);

    if (elementID) {
      const data = {
        amount,
        // element: selectedElement.id,
        type: selectedElement.attributes.type,
        sizes: {
          height,
          thickness,
          width,
          length,
        }
      };
  
      axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
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
      })
      .catch(error => {
        messageApi.error(language.errorQuery);
      });
    }
  };

  const getDecorFromSuborder = () => {
    if (dorSuborderId) {
      axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
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
              'https://api.boki.fortesting.com.ua/graphql',
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
    if (value === 'choose') {
      handleShowDecorClick();
    } else if (value === 'get') {
      setShowDecor(false)
      getDecorFromSuborder();
    }
  };

  const uniqueTypesSet = new Set()

  return (
    <Spin spinning={isloading}>
      <Form form={form} onFinish={handleFormSubmit} >
      {contextHolder}

      <Affix style={{ position: 'absolute', top: '-60px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
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
                
              // if (paintDecor.includes(value)) {
              //     setIsPaintDecor(true)
              //   } else {
              //     setIsPaintDecor(false)
              //   }

              //   if (mirrorDecor.includes(value)) {
              //     setIsMirrorDecor(true)
              //   } else {
              //     setIsMirrorDecor(false)
              //   }
            }}
          >
            {/* {elementOptions.map(option => (
              <Option key={option.id} value={option.id}>{languageMap[selectedLanguage][option.attributes.title]}</Option>
            ))} */}

              {elementOptions
                .filter(option => {
                  if (!uniqueTypesSet.has(option.attributes.type)) {
                    uniqueTypesSet.add(option.attributes.type); // Добавляем уникальный тип в Set
                    return true;
                  }
                  return false;
                })
                .map(option => (
                  // <Option key={option.id} value={option.id}>
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
          // rules={[{ required: !noDecor.includes(currentElementField), message: language.requiredField }]}
          rules={[{ required: true, message: language.requiredField }]}
        >
          <Radio.Group type="dashed" buttonStyle="solid" onChange={handleRadioChange}>
            {/* <Radio.Button disabled={noDecor.includes(currentElementField)} value="choose">{language.elementGetDecor}</Radio.Button> */}
            {/* <Radio.Button disabled={paintDecor.includes(currentElementField)} value="get">{language.elementGetDoor}</Radio.Button> */}
            <Radio.Button value="choose">{language.elementGetDecor}</Radio.Button>
            <Radio.Button value="get">{language.elementGetDoor}</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </div>

        <Space.Compact wrap="true" direction="hirizontal" size="middle">
          <Form.Item 
            name="width" 
            // rules={[{ required: !noWidthHeightThickness.includes(currentElementField), message: language.requiredField }]}
            rules={[{ required: !noWidth.includes(currentElementField), message: language.requiredField }]}
          >
            <InputNumber 
              style={{margin: '0 5px'}}
              addonBefore={language.width} 
              addonAfter="mm"
              // disabled={noWidthHeightThickness.includes(currentElementField)}
              disabled={noWidth.includes(currentElementField)}
            />
          </Form.Item>
          
          <Form.Item 
            name="height" 
            rules={[{ 
              // required: !noWidthHeightThickness.includes(currentElementField) && !onlyWidth.includes(currentElementField), 
              required: !noHeigt.includes(currentElementField), 
              message: language.requiredField 
            }]} 
          >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore={language.height} 
              addonAfter="mm"
              // disabled={noWidthHeightThickness.includes(currentElementField) || onlyWidth.includes(currentElementField)}
              disabled={noHeigt.includes(currentElementField)}
              />
          </Form.Item>

          <Form.Item 
            name="thickness"
            rules={[{ 
              // required: !noWidthHeightThickness.includes(currentElementField) && !onlyWidth.includes(currentElementField), 
              required: !noThickness.includes(currentElementField), 
              message: language.requiredField 
            }]}  
          >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore={language.thickness} 
              addonAfter="mm"
              // disabled={noWidthHeightThickness.includes(currentElementField) || onlyWidth.includes(currentElementField)}
              disabled={noThickness.includes(currentElementField)}
            />
          </Form.Item>

          <Form.Item 
              name="length"
              // rules={[{ required: noWidthHeightThickness.slice(0, -4).includes(currentElementField), message: language.requiredField }]} 
              rules={[{ required: !noLength.includes(currentElementField), message: language.requiredField }]} 
            >
            <InputNumber
              style={{margin: '0 5px'}}
              addonBefore='length' 
              addonAfter="mm" 
              // disabled={!noWidthHeightThickness.slice(0, -4).includes(currentElementField)}
              disabled={noLength.includes(currentElementField)}

            />
          </Form.Item>

          <Form.Item
            name="amount"
            // rules={[{ 
            //   // required: !noWidthHeightThickness.includes(currentElementField) || !onlyWidth.includes(currentElementField),
            //   message: language.requiredField
            // }]}
          >
            <InputNumber 
              style={{margin: '0 5px'}} 
              addonBefore={language.amount} 
              addonAfter={language.count}
              // disabled={onlyWidth.includes(currentElementField)}
            />
          </Form.Item>

        </Space.Compact>

      </Form>

        <div style={{paddingTop: '20px' }}>
          {/* {showDecor && !noDecor.includes(currentElementField) &&  */}
          {showDecor && 
            <>
              <Divider/>
              <h3 style={{textAlign: 'left', paddingBottom: '15px'}}> {language.element} {language.elementGetDecor} </h3>
              {/* <GroupDecorElementStep elementID={elementID} isPaintDecor={isPaintDecor} isMirrorDecor={isMirrorDecor} /> */}
              <GroupDecorElementStep elementID={elementID} />
            </>
          }
        </div>
    </Spin>
  );
};

export default DecorElementForm;
