import React, { useState } from 'react';
import { Tabs } from 'antd';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';
import GroupDecorStep from './GroupDecorStep';
import GroupDecorStepSecond from './GroupDecorStepSecond';

const DecorSidesGroupStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [activeTab, setActiveTab] = useState('decor1');
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
          label: language.side1,
          key: 'decor1',
          children: <GroupDecorStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
        },
        {
          label: `${language.side2} (${language.additionally})`,
          key: 'decor2',
          children: <GroupDecorStepSecond setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
        },
      ]}
    />
  );
};

export default DecorSidesGroupStep;
