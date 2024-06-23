import React, { useState } from 'react';
import { Tabs } from 'antd';
import CanvasStep from './CanvasStep';
import StartDataStep from './StartDataStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
// import { useOrder } from '../../Context/OrderContext';
// import SlidingStep from './SlidingStep';


const GroupDoorStep = ({ setCurrentStepSend, currentStepSend, setIsDisabledOtherSteps }) => {
  const [activeTab, setActiveTab] = useState('startdata');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  // const { isSliding } = useOrder();

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };

  return (
    <Tabs
      destroyInactiveTabPane={true}
      type="card" 
      activeKey={activeTab} 
      onChange={handleTabChange} 
      items={[
        {
          label: language.startData,
          key: 'startdata',
          children: <StartDataStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
        },
        {
          label: language.canvas,
          key: 'canvas',
          children: <CanvasStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend} setIsDisabledOtherSteps={setIsDisabledOtherSteps}/>,
        },
      ]}
    />
  );
};

export default GroupDoorStep;
