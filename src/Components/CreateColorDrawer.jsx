import React, { useState } from 'react';
import { Form, Input, Radio, Select, Button, Upload, message, Drawer, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

export const CreateColorDrawer = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const jwtToken = localStorage.getItem('token');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [colorGroupDisabled, setColorGroupDisabled] = useState(false);

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
        'https://api.boki.fortesting.com.ua/graphql', // Use the appropriate endpoint for file upload
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      const imageId = uploadResponse.data.data.upload.data.id;
  
      // Create paint with the uploaded image ID
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql', // Use the appropriate endpoint for creating paint
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
  
      console.log('Response:', response.data);
      message.success('Color added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
      message.error('Error to add Color');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <Space>
        <Button type="primary" onClick={showLargeDrawer}>
          Create color
        </Button>
      </Space>
      
      <Drawer
        title="Create color"
        placement="right"
        size={size}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
          </Space>
        }
      >
      
      <Form
        form={form}
        onFinish={onFinish}
    >
      <Form.Item
        label="Color Code (Title)"
        name="color_code"
        rules={[{ required: true, message: 'Please input color code!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Color Range"
        name="color_range"
        rules={[{ required: true, message: 'Please select color range!' }]}
      >
        <Select onChange={handleColorRangeChange}>
          <Option value="RAL">RAL</Option>
          <Option value="NCS">NCS</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Color Group"
        name="color_group"
        rules={[{ required: true, message: 'Please select color group!' }]}
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
        label="Standard"
        name="standard"
        rules={[{ required: true, message: 'Please select standard!' }]}
      >
        <Radio.Group>
          <Radio.Button value={true}>Yes</Radio.Button>
          <Radio.Button value={false}>No</Radio.Button>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item
        label="Image"
        name="image"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: true, message: 'Please upload Image!' }]}
      >
        <Upload
          action="https://api.boki.fortesting.com.ua/"
          name="image"
          maxCount={1}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
       
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>

      </Drawer>
    </>
  );
};

