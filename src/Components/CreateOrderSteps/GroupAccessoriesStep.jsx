import React, { useState } from 'react';
import { Tabs } from 'antd';
import HingesStep from './HingesStep';
import KnobeStep from './KnobeStep';
// import SkirtingStep from './SkirtingStep';
import LockStep from './LockStep';

const GroupAccessoriesStep = ({ setCurrentStepSend }) => {
  const [activeTab, setActiveTab] = useState('hinges');

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
        label: 'Knobe',
        key: 'knobe',
        // children: <KnobeStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        children: <KnobeStep setCurrentStepSend={setCurrentStepSend} />,
      },
      {
        label: 'Hinges',
        key: 'hinges',
        // children: <HingesStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        children: <HingesStep setCurrentStepSend={setCurrentStepSend} />,
      },
      {
        label: 'Lock',
        key: 'lock',
        // children: <LockStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        children: <LockStep setCurrentStepSend={setCurrentStepSend} />,
      },
      // {
      //   label: 'Skirting',
      //   key: 'skirting',
      //   children: <SkirtingStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
      // },
    ]}
  />
  );
};

export default GroupAccessoriesStep;
