import { Form, Button, Card, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {getFrameData, getFrames, updateFrameSuborder} from '../../api/frame'

const { Option } = Select;

const FrameStep = ({ setCurrentStepSend, currentStepSend }) => {
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [messageApi, contextHolder] = message.useMessage();
  const { orderId, frameSuborderId } = useOrder()
  const orderIdToUse = orderId;
  const [frames, setFrames] = useState([]);
  const [framesFilter, setFrameFilter] = useState({});
  const [orderData, setOrderData] = useState({});
  const [form] = Form.useForm();
  const [btnColor, setBtnColor] = useState('#ff0505');
  
  const handleFormSubmit = () => {
    const selectedFrameId = form.getFieldValue('name');
    const dataToUpdate = {
      decor: orderData?.door_suborder?.data?.attributes?.decor?.data?.id,
      frame: selectedFrameId,
      side: orderData?.side,
      sizes: {
        height: orderData?.door_suborder?.data?.attributes?.sizes?.height,
        thickness: orderData?.door_suborder?.data?.attributes?.sizes?.thickness,
        width: orderData?.door_suborder?.data?.attributes?.sizes?.width,
      }
    };

    updateFrameSuborder(jwtToken, frameSuborderId, dataToUpdate, setBtnColor, messageApi, setCurrentStepSend, language);
  };

  useEffect(() => {
    getFrameData(jwtToken, orderIdToUse, setOrderData, form, setFrameFilter);
  }, [jwtToken, orderIdToUse, form]);

  useEffect(() => {
    getFrames(jwtToken, setFrames, currentStepSend, setBtnColor, framesFilter);
  }, [jwtToken, orderData, currentStepSend, framesFilter]);

  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC'}}>
      <Form form={form} onFinish={handleFormSubmit}>
        {contextHolder}

        <Form.Item
          label={language.frame}
          name="name"
          style={{ marginTop: '20px' }}
          rules={[{ required: true, message: language.requiredField }]}
        >
          <Select
            placeholder={language.frame}
            allowClear
          >
            {frames.map(frame => (
              <Option key={frame.id} value={frame.id}>{languageMap[selectedLanguage][frame.attributes.title]}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
            {`${language.submit} ${language.frame}`}
          </Button>
        </Form.Item>

      </Form>
    </Card>
  );
};

export default FrameStep;

