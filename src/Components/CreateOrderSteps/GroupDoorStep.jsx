import React, { useState } from 'react';
import { Tabs } from 'antd';
import CanvasStep from './CanvasStep';
import StartDataStep from './StartDataStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const GroupDoorStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [activeTab, setActiveTab] = useState('startdata');
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

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
          label: language.startData,
          key: 'startdata',
          children: <StartDataStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
        },
        {
          label: language.canvas,
          key: 'canvas',
          children: <CanvasStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
        },
      ]}
    />
  );
};

export default GroupDoorStep;
