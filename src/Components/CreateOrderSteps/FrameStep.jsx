import { Form, Button, Card, Select, message, Affix } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useOrder } from '../../Context/OrderContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import {getFrameData, getFrames, updateFrameSuborder} from '../../api/frame'
import { removeSlidingSuborderData } from '../../api/sliding';

const { Option } = Select;

const FrameStep = ({ setCurrentStepSend, currentStepSend }) => {
  const jwtToken = localStorage.getItem('token');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [messageApi, contextHolder] = message.useMessage();
  const { orderId, frameSuborderId, slidingSuborderId } = useOrder()
  const orderIdToUse = orderId;
  const [orderData, setOrderData] = useState({});
  const [form] = Form.useForm();
  const [btnColor, setBtnColor] = useState('#ff0505');
  
  const [frames, setFrames] = useState([]);
  const [frameSuborderData, setFrameSuborderData] = useState({});
  const [selectedFrame, setSelectedFrame] = useState('');

  useEffect(() => {
    getFrameData(orderIdToUse, jwtToken, setFrameSuborderData, setFrames, setSelectedFrame);
    form.setFieldsValue({ name: selectedFrame});

    }, [orderIdToUse, jwtToken, selectedFrame]);

    const handleFormSubmit = async () => {
      const selectedFrameId = form.getFieldValue('name');
      await updateFrameSuborder(jwtToken, frameSuborderData, selectedFrameId, orderIdToUse);
      await removeSlidingSuborderData(jwtToken, slidingSuborderId);


      messageApi.success(language.successQuery);
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
  
  return (
    <Card style={{background: '#F8F8F8', borderColor: '#DCDCDC'}}>
      <Form form={form} onFinish={handleFormSubmit}>
        {contextHolder}

      <Affix style={{ position: 'absolute', top: '-50px', right: '20px'}} offsetTop={20}>
        <Button style={{backgroundColor: currentStepSend ? btnColor : '#1677ff', color: 'white' }} htmlType="submit" icon={<SendOutlined />}>
        {`${language.submit} ${language.startData}`}
        </Button>
      </Affix>

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
      </Form>
    </Card>
  );
};

export default FrameStep;

