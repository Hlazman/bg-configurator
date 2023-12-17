import React, { useState } from 'react';
import { Tabs } from 'antd';
import HingesStep from './HingesStep';
import KnobeStep from './KnobeStep';
import LockStep from './LockStep';
import { useLanguage } from '../../Context/LanguageContext';
import languageMap from '../../Languages/language';

const GroupAccessoriesStep = ({ setCurrentStepSend, currentStepSend }) => {
  const [activeTab, setActiveTab] = useState('knobe');
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
        label: language.knobe,
        key: 'knobe',
        children: <KnobeStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
      },
      {
        label: language.hinges,
        key: 'hinges',
        children: <HingesStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
      },
      {
        label: language.lock,
        key: 'lock',
        children: <LockStep setCurrentStepSend={setCurrentStepSend} currentStepSend={currentStepSend}/>,
      },
    ]}
  />
  );
};

export default GroupAccessoriesStep;
