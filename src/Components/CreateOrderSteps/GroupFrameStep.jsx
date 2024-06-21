import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useLanguage } from '../../Context/LanguageContext';
import { useOrder } from '../../Context/OrderContext';
import languageMap from '../../Languages/language';
import SlidingStep from './SlidingStep';
import FrameStep from './FrameStep';


const GroupDoorStep = ({ setCurrentStepSend, currentStepSend }) => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { isSliding } = useOrder();
  // const [activeTab, setActiveTab] = useState('frame');
  const [activeTab, setActiveTab] = useState(isSliding ? 'frame' : 'sliding');

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };

  return (
    <Tabs 
      type="card" 
      activeKey={activeTab} 
      onChange={handleTabChange} 
      items={[
        {
          label: language.frame,
          key: 'frame',
          children: <FrameStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
          disabled: !isSliding,
        },
        {
          label: language.sliding,
          key: 'sliding',
          children: <SlidingStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
          disabled: isSliding,
        },
      ]}
    />
  );
};

export default GroupDoorStep;
