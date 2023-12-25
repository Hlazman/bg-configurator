import React, { useState } from 'react';
import { Form, Input, Radio, Select, Button, Upload, message, Drawer, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import {queryLink} from '../api/variables'

const { Option } = Select;

export const CreateColorDrawer = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const jwtToken = localStorage.getItem('token');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [colorGroupDisabled, setColorGroupDisabled] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleColorRangeChange = (value) => {
    if (value === 'NCS') {
      setColorGroupDisabled(true);
      form.setFieldsValue({ color_group: 'no_group' }); 
    } else {
      setColorGroupDisabled(false);
    }
  };
  
  const showLargeDrawer = () => {
    setSize('default');
    setOpen(true);
  };
  const onClose = () => {
    form.resetFields();
    setOpen(false);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append('operations', JSON.stringify({
        query: `
          mutation($file: Upload!) {
            upload(file: $file) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          file: null
        }
      }));
      formData.append('map', JSON.stringify({
        '0': ['variables.file']
      }));
      formData.append('0', values.image[0].originFileObj);
  
      const uploadResponse = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql', 
        queryLink, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const imageId = uploadResponse.data.data.upload.data.id;
  
      const response = await axios.post(
        // 'https://api.boki.fortesting.com.ua/graphql',
        queryLink,
        {
          query: `
            mutation CreatePaint($data: PaintInput!) {
              createPaint(data: $data) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data: {
              color_code: values.color_code,
              standard: values.standard || false,
              main_properties: {
                image: imageId,
                title: values.color_code,
              },
              color_group: values.color_group,
              color_range: values.color_range,
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
      messageApi.success(language.successQuery);
      form.resetFields();
    } catch (error) {
      messageApi.error(language.errorQuery);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {contextHolder}
      <Space>
        <Button type="primary" onClick={showLargeDrawer}>
          {language.createColor}
        </Button>
      </Space>
      
      <Drawer
        title={language.createColor}
        placement="right"
        size={size}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>{language.cancel}</Button>
          </Space>
        }
      >
      
      <Form
        form={form}
        onFinish={onFinish}
    >
      <Form.Item
        label={language.colorCode}
        name="color_code"
        rules={[{ required: true, message: language.requiredField }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={language.colorRange}
        name="color_range"
        rules={[{ required: true, message: language.requiredField }]}
      >
        <Select onChange={handleColorRangeChange}>
          <Option value="RAL">RAL</Option>
          <Option value="NCS">NCS</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={language.colorGroup}
        name="color_group"
        rules={[{ required: true, message: language.requiredField }]}
      >
        <Select disabled={colorGroupDisabled}>
          <Option value="yellow_1">Yellow 1</Option>
          <Option value="orange_2">Orange 2</Option>
          <Option value="red_3">Red 3</Option>
          <Option value="purple_4">Purple 4</Option>
          <Option value="blue_5">Blue 5</Option>
          <Option value="green_6">Green 6</Option>
          <Option value="gray_7">Gray 7</Option>
          <Option value="brown_8">Brown 8</Option>
          <Option value="black_white_9">Black/White 9</Option>
          <Option value="no_group">No Group</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={language.standard}
        name="standard"
        rules={[{ required: true, message: language.requiredField }]}
      >
        <Radio.Group>
          <Radio.Button value={true}>{language.yes}</Radio.Button>
          <Radio.Button value={false}>{language.no}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item
        label={language.image}
        name="image"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: true, message: language.requiredField }]}
      >
        <Upload
          action="https://api.boki.fortesting.com.ua/"
          name="image"
          maxCount={1}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>{language.upload}</Button>
        </Upload>
       
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {language.submit}
        </Button>
      </Form.Item>
    </Form>

      </Drawer>
    </>
  );
};

